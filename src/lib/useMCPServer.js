import { useEffect } from 'react';
import { MCP } from './mcp_core';

let serverInstance = null;

/**
 * Hook for initializing MCP server
 * @param {Array} tools Array of tools to register
 * @param {Array} resources Array of resources to register
 * @param {boolean} debug Enable debug logging
 */
export const useMCPServer = (tools = [], resources = [], debug = false) => {
  useEffect(() => {
    if (!serverInstance) {
      serverInstance = MCP.createServer(window, debug);

      // Register tools
      tools.forEach(tool => {
        serverInstance.registerTool({
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
          handler: tool.handler
        });
      });

      // Register resources (Spec 2025-06-18)
      resources.forEach(resource => {
        serverInstance.registerResource({
          uri: resource.uri,
          name: resource.name,
          title: resource.title,           // Spec 2025-06-18
          description: resource.description,
          mimeType: resource.mimeType,
          size: resource.size,             // Spec 2025-06-18
          annotations: resource.annotations,  // Include annotations
          handler: resource.handler
        });
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, [tools, resources, debug]);

  return serverInstance;
};