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
        apiKey={""}
        locale="en"
      />
    </div>
  );
}

export default App;