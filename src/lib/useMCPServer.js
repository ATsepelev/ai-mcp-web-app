import { useEffect } from 'react';
import { MCP } from './mcp_core';

let serverInstance = null;

/**
 * Hook for initializing MCP server
 * @param {Array} tools Array of tools to register
 */
export const useMCPServer = (tools = []) => {
  useEffect(() => {
    if (!serverInstance) {
      serverInstance = MCP.createServer();

      // Register tools
      tools.forEach(tool => {
        serverInstance.registerTool({
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
          handler: tool.handler
        });
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, [tools]);

  return serverInstance;
};