import { useState, useEffect } from 'react';
import { MCP } from './mcp_core';

export const useMCPClient = () => {
  const [client, setClient] = useState(null);
  const [tools, setTools] = useState([]);
  const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected, error

  useEffect(() => {
    const initClient = async () => {
      try {
        setStatus('connecting');
        const clientInstance = MCP.createClient();

        // Initialize protocol
        await clientInstance.initialize();

        // Load tools
        const tools = await clientInstance.loadTools();
        setTools(tools);
        setClient(clientInstance);
        setStatus('connected');

        console.log('[MCP] Client initialized with tools:', tools);
      } catch (error) {
        console.error('[MCP] Client initialization failed:', error);
        setStatus('error');
      }
    };

    if (!client) {
      initClient();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    client,
    tools,
    status,
    callTool: client ? client.callTool.bind(client) : null
  };
};