import React from 'react';
import {ChatWidget, useMCPServer} from "ai-mcp-web-app";
import './App.css';
import TestArea from "./TestArea/TestArea_en";
import { REVIEW_TOOLS} from "./mcp_tools_en";


function App() {
  useMCPServer(REVIEW_TOOLS);

  return (
    <div className="App">
      <header className="App-header">
        <h1>MCP Protocol Demonstration in Browser</h1>
      </header>
      <div className="main-content">
        <TestArea />
      </div>
      <ChatWidget
        greeting="Hello! I'm your AI assistant with access to tools."
        chatTitle="AI Assistant"
        modelName="devstral-small-2507"
        //baseUrl="https://api.mistral.ai/v1"
        baseUrl="http://localhost:1234/v1"
        // Example with new MCP servers format
        // mcpServers={{
        //   "files": {
        //     "type": "ws",
        //     "url": "wss://mcp.example.com/files"
        //   },
        //   "api": {
        //     "type": "http-stream",
        //     "url": "https://api.example.com/mcp",
        //     "headers": {
        //       "Authorization": "Bearer ${API_KEY}"
        //     }
        //   }
        // }}
        // envVars={{
        //   API_KEY: process.env.REACT_APP_API_KEY
        // }}
        // allowedTools={["files.readFile", "api.getData"]}
        apiKey={""}
        locale="en"
        // Example theme customization
        // theme={{
        //   // Collapsed state colors
        //   mainButtonBackground: 'linear-gradient(145deg, #10b981, #059669)',
        //   mainButtonColor: 'white',
        //   voiceButtonBackground: 'linear-gradient(145deg, #8b5cf6, #7c3aed)',
        //   
        //   // Header colors
        //   headerBackground: 'linear-gradient(135deg, #f3e7ff, #e9d5ff)',
        //   headerTextColor: '#4c1d95',
        //   
        //   // Message colors
        //   messagesBackground: '#faf5ff',
        //   userMessageBackground: 'linear-gradient(135deg, #ddd6fe, #c4b5fd)',
        //   userMessageColor: '#4c1d95',
        //   assistantMessageBackground: 'white',
        //   assistantMessageBorder: '#e9d5ff',
        //   
        //   // Input area colors
        //   inputBackground: '#faf5ff',
        //   inputBorder: '#e9d5ff',
        //   inputFocusBorder: '#c4b5fd',
        //   sendButtonBackground: 'linear-gradient(145deg, #8b5cf6, #7c3aed)',
        //   
        //   // Images (optional)
        //   // headerIcon: '/path/to/chat-icon.png',
        //   // botAvatar: '/path/to/bot-avatar.png',
        //   // userAvatar: '/path/to/user-avatar.png',
        //   // expandedBackgroundImage: '/path/to/background.jpg'
        // }}
      />
    </div>
  );
}

export default App;