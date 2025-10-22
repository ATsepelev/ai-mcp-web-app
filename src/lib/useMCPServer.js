import { useEffect } from 'react';
import { MCP } from './mcp_core';

let serverInstance = null;

/**
 * Hook for initializing MCP server
 * @param {Array} tools Array of tools to register
 * @param {Array} resources Array of resources to register
 */
export const useMCPServer = (tools = [], resources = []) => {
  useEffect(() => {
    console.log('[MCP Server] useEffect triggered. Tools:', tools.length, 'Resources:', resources.length, 'Server exists:', !!serverInstance);
    
    if (!serverInstance) {
      console.log('[MCP Server] Creating new server instance');
      serverInstance = MCP.createServer();

      // Register tools
      console.log('[MCP Server] Registering', tools.length, 'tools');
      tools.forEach(tool => {
        const toolName = tool.function?.name || tool.name;
        console.log('[MCP Server] Registering tool:', toolName);
        serverInstance.registerTool({
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
          handler: tool.handler
        });
      });

      // Register resources (Spec 2025-06-18)
      console.log('[MCP Server] Registering', resources.length, 'resources');
      resources.forEach(resource => {
        console.log('[MCP Server] Registering resource:', resource.uri);
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
      
      console.log('[MCP Server] Server initialized with', serverInstance.tools.length, 'tools and', serverInstance.resources.length, 'resources');
    } else {
      console.log('[MCP Server] Server already exists, skipping initialization');
    }

    return () => {
      // Cleanup if needed
    };
  }, [tools, resources]);

  console.log('[MCP Server] Returning server instance:', !!serverInstance);
  return serverInstance;
};