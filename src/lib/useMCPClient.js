import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const externalClients = useRef(new Map());
  const initializingRef = useRef(false);
  
  // Memoize dependencies to prevent unnecessary re-initialization
  const mcpServersJson = useMemo(() => JSON.stringify(mcpServers), [mcpServers]);
  const envVarsJson = useMemo(() => JSON.stringify(envVars), [envVars]);
  const allowedToolsJson = useMemo(() => JSON.stringify(allowedTools), [allowedTools]);
  const blockedToolsJson = useMemo(() => JSON.stringify(blockedTools), [blockedTools]);
  const externalServersJson = useMemo(() => JSON.stringify(externalServers), [externalServers]);

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
    console.log('[MCP] useEffect triggered. Client exists:', !!client, 'Initializing:', initializingRef.current);
    
    // Prevent concurrent initializations
    if (initializingRef.current) {
      console.log('[MCP] Already initializing, skipping');
      return;
    }
    
    // Only initialize if client doesn't exist
    if (client) {
      console.log('[MCP] Client already exists, skipping initialization');
      return;
    }
    
    console.log('[MCP] Starting client initialization...');
    initializingRef.current = true;
    
    // Flag to cancel initialization if component unmounts or dependencies change
    let cancelled = false;
    
    const initClient = async () => {
      try {
        console.log('[MCP] Setting status to connecting...');
        setStatus('connecting');
        
        console.log('[MCP] Creating internal client...');
        const internalClient = MCP.createClient();
        console.log('[MCP] Internal client created:', !!internalClient);

        // Initialize protocol
        console.log('[MCP] Initializing protocol...');
        await internalClient.initialize();
        console.log('[MCP] Protocol initialized');

        // Load tools
        console.log('[MCP] Loading internal tools...');
        const internalTools = await internalClient.loadTools();
        console.log('[MCP] Loaded', internalTools.length, 'internal tools:', internalTools.map(t => t.name));
        
        // Load resources
        let internalResources = [];
        try {
          console.log('[MCP] Loading internal resources...');
          internalResources = await internalClient.loadResources();
          console.log('[MCP] Loaded', internalResources.length, 'internal resources');
        } catch (e) {
          console.log('[MCP] Resources not supported or error:', e.message);
          // Resources may not be supported
        }

        // Get processed server array
        const serverArray = getServerArray();

        // Store all external results (will be populated incrementally)
        const externalResultsMap = new Map();
        
        // Helper to merge and update state
        const updateMergedState = () => {
          const externalResults = Array.from(externalResultsMap.values());
          
          // Merge tool catalogs
        const mergedTools = [];
        for (const t of internalTools) {
          mergedTools.push({ ...t, source: 'internal', qualifiedName: t.name, parameters: t.parameters });
        }
        for (const res of externalResults) {
          if (res && res.tools && res.client) {
            for (const t of res.tools) {
              const name = t.name || t.tool || t.id;
              const description = t.description || t.title || '';
              const parameters = t.parameters || t.inputSchema || {};
              mergedTools.push({ name, description, parameters, source: res.id, qualifiedName: `${res.id}_${name}` });
            }
          }
        }

          // Merge resource catalogs
          const mergedResources = [];
          for (const r of internalResources) {
            mergedResources.push({ ...r, source: 'internal', qualifiedUri: r.uri });
          }
          for (const res of externalResults) {
            if (res && res.resources && res.client) {
              for (const r of res.resources) {
                const uri = r.uri;
                const name = r.name || uri;
                const title = r.title || name;
                const description = r.description || '';
                const mimeType = r.mimeType || 'application/json';
                const size = r.size;
                const annotations = r.annotations || {};
                mergedResources.push({ uri, name, title, description, mimeType, size, annotations, source: res.id, qualifiedUri: `${res.id}_${uri}` });
              }
            }
          }

          // Apply tool filtering
          const filteredTools = filterTools(mergedTools, allowedTools, blockedTools);

          console.log('[MCP] Updating state:', {
            mergedTools: mergedTools.length,
            filteredTools: filteredTools.length,
            mergedResources: mergedResources.length,
            externalResults: externalResults.length
          });

          // Update state
          setTools(filteredTools.map(t => ({ name: t.qualifiedName, description: t.description, parameters: t.parameters })));
          setResources(mergedResources.map(r => ({ uri: r.qualifiedUri, name: r.name, description: r.description, mimeType: r.mimeType, annotations: r.annotations })));
          
          const anyExternalErrors = externalResults.some(r => r.error);
          const anyConnected = externalResults.some(r => r.client);
          const newStatus = anyExternalErrors && anyConnected ? 'partial_connected' : 'connected';
          console.log('[MCP] Setting status:', newStatus);
          setStatus(newStatus);
        };

        // Initialize routed client immediately with internal tools
        const routedClient = {
          callTool: async (name, args) => {
            if (typeof name === 'string' && name.includes('_')) {
              const [sid, ...rest] = name.split('_');
              const tool = rest.join('_');
              const ext = externalClients.current.get(sid);
              if (!ext) throw new Error(`Unknown external server '${sid}'`);
              return ext.callTool(tool, args);
            }
            const internalHas = internalTools.some(t => t.name === name);
            const externalResults = Array.from(externalResultsMap.values());
            const externalMatches = externalResults.filter(r => r.client && r.tools.some(t => t.name === name));
            if (internalHas && externalMatches.length === 0) {
              return internalClient.callTool(name, args);
            }
            if (!internalHas && externalMatches.length === 1) {
              const { id } = externalMatches[0];
              const ext = externalClients.current.get(id);
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
            if (typeof uri === 'string' && uri.includes('_')) {
              const parts = uri.split('_');
              const sid = parts[0];
              const resourceUri = parts.slice(1).join('_');
              const ext = externalClients.current.get(sid);
              if (!ext) throw new Error(`Unknown external server '${sid}'`);
              return ext.readResource(resourceUri);
            }
            const internalHas = internalResources.some(r => r.uri === uri);
            const externalResults = Array.from(externalResultsMap.values());
            const externalMatches = externalResults.filter(r => r.client && r.resources && r.resources.some(res => res.uri === uri));
            if (internalHas && externalMatches.length === 0) {
              return internalClient.readResource(uri);
            }
            if (!internalHas && externalMatches.length === 1) {
              const { id } = externalMatches[0];
              const ext = externalClients.current.get(id);
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

        // Set client immediately with internal tools
        setClient(routedClient);
        
        console.log('[MCP] Client initialized. Internal tools:', internalTools.length, 'Internal resources:', internalResources.length);
        
        // If no external servers, set connected status immediately
        if (serverArray.length === 0) {
          console.log('[MCP] No external servers configured');
          updateMergedState();
          initializingRef.current = false;
        } else {
          // Set connecting status for external servers
          setStatus('connecting');
          
          // Initialize external clients with timeout and process as they complete
          const DEFAULT_TIMEOUT = 10000; // 10 seconds
          
          serverArray.forEach((srv) => {
            // Validate server config
            if (!srv || !srv.id || !srv.url) {
              console.warn('[MCP] Invalid server config:', srv);
              return;
            }
            
            const timeout = srv.timeoutMs || DEFAULT_TIMEOUT;
            
            // Fire and forget - errors are caught inside
            (async () => {
              try {
                const transport = (srv.transport || (srv.url && srv.url.startsWith('wss:') ? 'ws' : 'sse'));
                let ec;
                if (transport === 'ws') {
                  ec = new MCPWebSocketClient(srv.url, { headers: srv.headers, protocols: srv.protocols });
                } else {
                  ec = new MCPSseClient(srv.url, { headers: srv.headers, withCredentials: srv.withCredentials, postUrl: srv.postUrl, timeoutMs: timeout });
                }
                
                // Race between initialization and timeout
                const result = await Promise.race([
                  (async () => {
                    await ec.initialize();
                    const extTools = await ec.loadTools();
                    let extResources = [];
                    try {
                      extResources = await ec.loadResources();
                    } catch (e) {
                      // Resources may not be supported
                    }
                    return { success: true, tools: extTools, resources: extResources, client: ec };
                  })(),
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Connection timeout (${timeout}ms)`)), timeout)
                  )
                ]);
                
                if (result.success) {
                  // Only add to map after successful initialization
                  externalClients.current.set(srv.id, result.client);
                  externalResultsMap.set(srv.id, { 
                    id: srv.id, 
                    client: result.client, 
                    tools: result.tools, 
                    resources: result.resources 
                  });
                  console.log(`[MCP] Connected to external server '${srv.id}'`);
                }
              } catch (e) {
                console.warn(`[MCP] Failed to connect to external server '${srv.id}':`, e.message);
                externalResultsMap.set(srv.id, { 
                  id: srv.id, 
                  client: null, 
                  tools: [], 
                  resources: [], 
                  error: e 
                });
              }
              
              // Update state after each server completes (success or failure)
              if (!cancelled) {
                updateMergedState();
              }
            })().catch(err => {
              // Catch any unhandled errors from the async IIFE
              console.error(`[MCP] Unhandled error for server '${srv.id}':`, err);
            });
          });
          
          initializingRef.current = false;
        }
      } catch (error) {
        console.error('[MCP] Client initialization failed:', error);
        setStatus('error');
        initializingRef.current = false;
      }
    };

    // Only initialize when client doesn't exist
    console.log('[MCP] Calling initClient()...');
    initClient().catch(err => {
      console.error('[MCP] initClient() failed with unhandled error:', err);
      setStatus('error');
      initializingRef.current = false;
    });

    return () => {
      // Cancel ongoing initialization
      cancelled = true;
      initializingRef.current = false;
      
      // Cleanup: disconnect all external clients to stop reconnection attempts
      for (const [id, ec] of externalClients.current.entries()) {
        if (ec && typeof ec.disconnect === 'function') {
          ec.disconnect();
        }
      }
      externalClients.current.clear();
    };
  }, [mcpServersJson, envVarsJson, allowedToolsJson, blockedToolsJson, externalServersJson]);

  // Stable callback functions to prevent unnecessary re-renders
  const callTool = useCallback((name, args) => {
    if (!client) return Promise.reject(new Error('Client not initialized'));
    return client.callTool(name, args);
  }, [client]);

  const readResource = useCallback((uri) => {
    if (!client) return Promise.reject(new Error('Client not initialized'));
    return client.readResource(uri);
  }, [client]);

  const returnValue = {
    client,
    tools,
    resources,
    status,
    callTool,
    readResource
  };
  
  // Log on every render to track state changes
  console.log('[MCP] useMCPClient returning:', {
    hasClient: !!client,
    toolsCount: tools.length,
    resourcesCount: resources.length,
    status
  });
  
  return returnValue;
};