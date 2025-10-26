export { default as ChatWidget } from './lib/ChatWidget/ChatWidget';
export { default as chatWidgetStyles } from './lib/ChatWidget/ChatWidget.module.css';
export { useOpenAIChat } from './lib/useOpenAIChat';
export { useMCPClient } from './lib/useMCPClient';
export { useMCPServer } from './lib/useMCPServer';
export { MCP } from './lib/mcp_core';
export { 
  generateStorageKey, 
  loadMessages, 
  saveMessages, 
  clearHistory, 
  clearAllHistory 
} from './lib/chatHistoryStorage';