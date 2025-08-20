const MCP_PROTOCOL_VERSION = "1.0.0";
const MCP_EVENT_NAME = 'mcp_message_internal';

/**
 * Generates unique ID for requests.
 * @returns {string} Unique ID.
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

class MCPBase {
  constructor(type, eventTarget = window) {
    this.type = type;
    this.eventTarget = eventTarget;
    this.pendingRequests = new Map();
    this.requestHandlers = new Map();
    this.setupListeners();
  }

  setupListeners() {
    this.eventTarget.addEventListener(MCP_EVENT_NAME, (event) => {
      if (event.detail && event.detail.senderType === this.type) return;
      this.handleMessage(event.detail);
    });
  }

  handleMessage(message) {
    if (!message || typeof message !== 'object') return;

    // Handle JSON-RPC messages
    if (message.jsonrpc === "2.0") {
      if (message.method) {
        this.handleRequest(message);
      } else if (message.id) {
        this.handleResponse(message);
      }
    }
    // Handle MCP protocol messages
    else if (message.mcp) {
      this.handleProtocolMessage(message);
    }
  }

  send(message) {
    message.senderType = this.type;
    const event = new CustomEvent(MCP_EVENT_NAME, { detail: message });
    this.eventTarget.dispatchEvent(event);
  }

  sendRequest(method, params) {
    return new Promise((resolve, reject) => {
      const id = generateId();
      this.pendingRequests.set(id, { resolve, reject });

      this.send({
        jsonrpc: "2.0",
        id: id,
        method: method,
        params: params
      });
    });
  }

  handleRequest(request) {
    const { id, method, params } = request;
    const handler = this.requestHandlers.get(method);

    if (!handler) {
      if (id !== undefined) {
        this.send({
          jsonrpc: "2.0",
          id: id,
          error: {
            code: -32601,
            message: `Method '${method}' not found`
          }
        });
      }
      return;
    }

    try {
      const result = handler(params);
      if (result instanceof Promise) {
        result
          .then(res => {
            if (id !== undefined) {
              this.send({
                jsonrpc: "2.0",
                id: id,
                result: res
              });
            }
          })
          .catch(error => {
            this.handleRequestError(id, error);
          });
      } else {
        if (id !== undefined) {
          this.send({
            jsonrpc: "2.0",
            id: id,
            result: result
          });
        }
      }
    } catch (error) {
      this.handleRequestError(id, error);
    }
  }

  handleRequestError(id, error) {
    console.error(`Error handling request:`, error);
    if (id !== undefined) {
      this.send({
        jsonrpc: "2.0",
        id: id,
        error: {
          code: error.code || -32000,
          message: error.message || "Internal error",
          data: error.data
        }
      });
    }
  }

  handleResponse(response) {
    const { id, result, error } = response;
    const pending = this.pendingRequests.get(id);

    if (pending) {
      this.pendingRequests.delete(id);
      if (error) {
        const err = new Error(`[${error.code}] ${error.message}`);
        err.data = error.data;
        pending.reject(err);
      } else {
        pending.resolve(result);
      }
    }
  }

  onRequest(method, handler) {
    this.requestHandlers.set(method, handler);
  }
}

class MCPServer extends MCPBase {
  constructor(eventTarget = window) {
    super('server', eventTarget);
    this.tools = [];
    this.setupProtocolHandlers();
  }

  setupProtocolHandlers() {
    // Connection initialization
    this.onRequest('mcp.initialize', (params) => {
      if (params.version !== MCP_PROTOCOL_VERSION) {
        throw {
          code: 4001,
          message: `Unsupported protocol version. Client: ${params.version}, Server: ${MCP_PROTOCOL_VERSION}`
        };
      }

      return {
        version: MCP_PROTOCOL_VERSION,
        capabilities: ["tools"]
      };
    });

    // Return tools list
    this.onRequest('mcp.tools.list', () => {
      return this.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }));
    });

    // Tool execution
    this.onRequest('mcp.tools.call', async (params) => {
      const { name, arguments: args } = params;
      const tool = this.tools.find(t => t.name === name);

      if (!tool) {
        throw {
          code: 4004,
          message: `Tool '${name}' not found`
        };
      }

      try {
        const result = await tool.handler(args);
        return { success: true, result };
      } catch (error) {
        throw {
          code: 5001,
          message: `Tool execution failed: ${error.message}`,
          data: error
        };
      }
    });
  }

  registerTool(tool) {
    if (!tool.name || !tool.handler) {
      throw new Error("Invalid tool definition");
    }

    // Check for duplicates
    if (this.tools.some(t => t.name === tool.name)) {
      console.warn(`Tool '${tool.name}' is already registered. Overwriting.`);
      this.tools = this.tools.filter(t => t.name !== tool.name);
    }

    this.tools.push({
      name: tool.name,
      description: tool.description || "",
      parameters: tool.parameters || {},
      handler: tool.handler
    });

    console.log(`Registered tool: ${tool.name}`);
  }

  registerTools(tools) {
    tools.forEach(tool => this.registerTool(tool));
  }
}

class MCPClient extends MCPBase {
  constructor(eventTarget = window) {
    super('client', eventTarget);
    this.initialized = false;
    this.tools = [];
  }

  async initialize() {
    if (this.initialized) return;

    const response = await this.sendRequest('mcp.initialize', {
      version: MCP_PROTOCOL_VERSION,
      capabilities: ["tools"]
    });

    if (response.version !== MCP_PROTOCOL_VERSION) {
      throw new Error(`Protocol version mismatch. Server: ${response.version}, Client: ${MCP_PROTOCOL_VERSION}`);
    }

    this.initialized = true;
    return response;
  }

  async loadTools() {
    if (!this.initialized) {
      await this.initialize();
    }

    const tools = await this.sendRequest('mcp.tools.list');
    this.tools = tools;
    return tools;
  }

  async callTool(name, args) {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.sendRequest('mcp.tools.call', {
      name: name,
      arguments: args
    });
  }
}

const MCP = {
  createServer: (eventTarget = window) => new MCPServer(eventTarget),
  createClient: (eventTarget = window) => new MCPClient(eventTarget),
  EVENT_NAME: MCP_EVENT_NAME,
  PROTOCOL_VERSION: MCP_PROTOCOL_VERSION
};

export default MCP;
export { MCP, MCPServer, MCPClient };