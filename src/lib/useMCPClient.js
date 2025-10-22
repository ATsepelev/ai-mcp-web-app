import { useState, useEffect, useMemo, useCallback } from 'react';
import { MCP, MCPWebSocketClient, MCPSseClient } from './mcp_core';

/**
 * Hook to provide a merged MCP client over internal (in-page) and optional external servers.
 * @param {Object} options
 * @param {Object} options.mcpServers - Object with server configurations { "server-id": { type, url, headers, ... } }
 * @param {Object} options.envVars - Environment variables for substitution in URLs and headers
 * @param {Array<string>} options.allowedTools - Whitelist of allowed tools (takes priority)
 * @param {Array<string>} options.blockedTools - Blacklist of blocked tools
 * @param {Array<{id:string, transport?: 'ws'|'sse', url:string, headers?:Object, protocols?:string[], withCredentials?:boolean, postUrl?:string, timeoutMs?:number}>} options.externalServers - Deprecated: use mcpServers instead
 */
export const useMCPClient = (options = {}) => {
  const [client, setClient] = useState(null);
  const [tools, setTools] = useState([]);
  const [resources, setResources] = useState([]);
  const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected, partial_connected, error
  const { mcpServers = {}, envVars = {}, allowedTools = null, blockedTools = [], externalServers = [] } = options;
  const externalClients = useMemo(() => new Map(), []);

  // Helper function to substitute environment variables
  const substituteEnvVars = (value, envVars) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\$\{([^}]+)\}/g, (match, expr) => {
      // Support format ${VAR:-default}
      const [varName, defaultValue] = expr.split(':-');
      return envVars[varName.trim()] ?? defaultValue ?? match;
    });
  };

  // Helper function to filter tools
  const filterTools = (tools, allowedTools, blockedTools) => {
    if (allowedTools && Array.isArray(allowedTools) && allowedTools.length > 0) {
      // allowedTools has priority
      return tools.filter(t => allowedTools.includes(t.qualifiedName));
    }
    if (blockedTools && Array.isArray(blockedTools) && blockedTools.length > 0) {
      return tools.filter(t => !blockedTools.includes(t.qualifiedName));
    }
    return tools;
  };

  // Convert mcpServers object to array format for internal processing
  const getServerArray = () => {
    const servers = [];
    
    // Process mcpServers object
    Object.entries(mcpServers).forEach(([serverId, config]) => {
      if (config && typeof config === 'object') {
        
        const processedConfig = {
          id: serverId,
          transport: config.type === 'ws' ? 'ws' : 'sse', // accepts 'http-stream', 'sse', 'http'
          url: substituteEnvVars(config.url, envVars),
          headers: config.headers ? Object.fromEntries(
            Object.entries(config.headers).map(([key, value]) => [
              key, 
              substituteEnvVars(value, envVars)
            ])
          ) : undefined,
          protocols: config.protocols,
          withCredentials: config.withCredentials,
          postUrl: config.postUrl ? substituteEnvVars(config.postUrl, envVars) : undefined,
          timeoutMs: config.timeoutMs
        };
        servers.push(processedConfig);
      }
    });

    // Add externalServers for backward compatibility
    if (Array.isArray(externalServers) && externalServers.length > 0) {
      servers.push(...externalServers);
    }

    return servers;
  };

  useEffect(() => {
    // Reset state to prevent using stale client
    setClient(null);
    setTools([]);
    setResources([]);
    
    // Flag to cancel initialization if component unmounts or dependencies change
    let cancelled = false;
    
    const initClient = async () => {
      try {
        setStatus('connecting');
        const internalClient = MCP.createClient();

        // Initialize protocol
        await internalClient.initialize();

        // Load tools
        const internalTools = await internalClient.loadTools();
        
        // Load resources
        let internalResources = [];
        try {
          internalResources = await internalClient.loadResources();
        } catch (e) {
          // Resources may not be supported
        }

        // Get processed server array
        const serverArray = getServerArray();

        // Initialize external clients in parallel
        const externalInitPromises = serverArray.map(async (srv) => {
          try {
            const transport = (srv.transport || (srv.url.startsWith('wss:') ? 'ws' : 'sse'));
            let ec;
            if (transport === 'ws') {
              ec = new MCPWebSocketClient(srv.url, { headers: srv.headers, protocols: srv.protocols });
            } else {
              ec = new MCPSseClient(srv.url, { headers: srv.headers, withCredentials: srv.withCredentials, postUrl: srv.postUrl, timeoutMs: srv.timeoutMs });
            }
            externalClients.set(srv.id, ec);
            await ec.initialize();
            const extTools = await ec.loadTools();
            let extResources = [];
            try {
              extResources = await ec.loadResources();
            } catch (e) {
              // Resources may not be supported by all servers
            }
            return { id: srv.id, client: ec, tools: extTools, resources: extResources };
          } catch (e) {
            return { id: srv.id, client: null, tools: [], resources: [], error: e };
          }
        });

        const externalResults = await Promise.all(externalInitPromises);

        // Check if cancelled before processing results
        if (cancelled) return;

        // Merge tool catalogs; qualify external tool names as id.tool
        const mergedTools = [];
        // internal first (source: internal)
        for (const t of internalTools) {
          // Internal uses our legacy shape: {name, description, parameters}
          mergedTools.push({ ...t, source: 'internal', qualifiedName: t.name, parameters: t.parameters });
        }
        for (const res of externalResults) {
          if (res && res.tools && res.client) {
            for (const t of res.tools) {
              // Normalize spec fields to our consumer shape
              const name = t.name || t.tool || t.id;
              const description = t.description || t.title || '';
              const parameters = t.parameters || t.inputSchema || {};
              mergedTools.push({ name, description, parameters, source: res.id, qualifiedName: `${res.id}_${name}` });
            }
          }
        }

        // Merge resource catalogs; qualify external resource URIs as id_uri
        // Spec 2025-06-18: include title, size, and annotations
        const mergedResources = [];
        // internal first (source: internal)
        for (const r of internalResources) {
          mergedResources.push({ ...r, source: 'internal', qualifiedUri: r.uri });
        }
        for (const res of externalResults) {
          if (res && res.resources && res.client) {
            for (const r of res.resources) {
              // Normalize resource fields (Spec 2025-06-18)
              const uri = r.uri;
              const name = r.name || uri;
              const title = r.title || name;                    // Spec 2025-06-18
              const description = r.description || '';
              const mimeType = r.mimeType || 'application/json';
              const size = r.size;                              // Spec 2025-06-18
              const annotations = r.annotations || {};
              mergedResources.push({ uri, name, title, description, mimeType, size, annotations, source: res.id, qualifiedUri: `${res.id}_${uri}` });
            }
          }
        }

        // Provide a facade client that routes calls
        const routedClient = {
          callTool: async (name, args) => {
            // If qualified: id_tool
            if (typeof name === 'string' && name.includes('_')) {
              const [sid, ...rest] = name.split('_');
              const tool = rest.join('_');
              const ext = externalClients.get(sid);
              if (!ext) throw new Error(`Unknown external server '${sid}'`);
              return ext.callTool(tool, args);
            }
            // Bare name: try internal first; if ambiguous across externals, error
            const internalHas = internalTools.some(t => t.name === name);
            const externalMatches = externalResults.filter(r => r.client && r.tools.some(t => t.name === name));
            if (internalHas && externalMatches.length === 0) {
              return internalClient.callTool(name, args);
            }
            if (!internalHas && externalMatches.length === 1) {
              const { id } = externalMatches[0];
              const ext = externalClients.get(id);
              return ext.callTool(name, args);
            }
            if (internalHas && externalMatches.length >= 1) {
              throw new Error(`Ambiguous tool '${name}'. Use qualified name like 'internal_${name}' or '<serverId>_${name}'.`);
            }
            if (!internalHas && externalMatches.length > 1) {
              throw new Error(`Ambiguous external tool '${name}'. Use qualified name '<serverId>_${name}'.`);
            }
            throw new Error(`Tool '${name}' not found.`);
          },
          readResource: async (uri) => {
            // If qualified: id_uri
            if (typeof uri === 'string' && uri.includes('_')) {
              const parts = uri.split('_');
              const sid = parts[0];
              const resourceUri = parts.slice(1).join('_');
              const ext = externalClients.get(sid);
              if (!ext) throw new Error(`Unknown external server '${sid}'`);
              return ext.readResource(resourceUri);
            }
            // Bare URI: try internal first; if ambiguous across externals, error
            const internalHas = internalResources.some(r => r.uri === uri);
            const externalMatches = externalResults.filter(r => r.client && r.resources && r.resources.some(res => res.uri === uri));
            if (internalHas && externalMatches.length === 0) {
              return internalClient.readResource(uri);
            }
            if (!internalHas && externalMatches.length === 1) {
              const { id } = externalMatches[0];
              const ext = externalClients.get(id);
              return ext.readResource(uri);
            }
            if (internalHas && externalMatches.length >= 1) {
              throw new Error(`Ambiguous resource '${uri}'. Use qualified URI like 'internal_${uri}' or '<serverId>_${uri}'.`);
            }
            if (!internalHas && externalMatches.length > 1) {
              throw new Error(`Ambiguous external resource '${uri}'. Use qualified URI '<serverId>_${uri}'.`);
            }
            throw new Error(`Resource '${uri}' not found.`);
          }
        };

        // Apply tool filtering
        const filteredTools = filterTools(mergedTools, allowedTools, blockedTools);

        setTools(filteredTools.map(t => ({ name: t.qualifiedName, description: t.description, parameters: t.parameters })));
        setResources(mergedResources.map(r => ({ uri: r.qualifiedUri, name: r.name, description: r.description, mimeType: r.mimeType, annotations: r.annotations })));
        setClient(routedClient);
        const anyExternalErrors = externalResults.some(r => r.error);
        setStatus(anyExternalErrors && externalResults.some(r => r.client) ? 'partial_connected' : 'connected');
      } catch (error) {
        console.error('[MCP] Client initialization failed:', error);
        setStatus('error');
      }
    };

    // Always initialize when dependencies change
    initClient();

    return () => {
      // Cancel ongoing initialization
      cancelled = true;
      
      // Cleanup: disconnect all external clients to stop reconnection attempts
      for (const [id, ec] of externalClients.entries()) {
        if (ec && typeof ec.disconnect === 'function') {
          ec.disconnect();
        }
      }
      externalClients.clear();
    };
  }, [mcpServers, envVars, allowedTools, blockedTools, externalServers]);

  // Stable callback functions to prevent unnecessary re-renders
  const callTool = useCallback((name, args) => {
    if (!client) return Promise.reject(new Error('Client not initialized'));
    return client.callTool(name, args);
  }, [client]);

  const readResource = useCallback((uri) => {
    if (!client) return Promise.reject(new Error('Client not initialized'));
    return client.readResource(uri);
  }, [client]);

  return {
    client,
    tools,
    resources,
    status,
    callTool,
    readResource
  };
};