# AI Chat Widget with MCP Tools

A modern, customizable chat widget with voice input support and MCP (Model Communication Protocol) tool integration for interacting with AI assistants.

## Features

- **Voice Input**: Speech-to-text functionality for hands-free messaging
- **MCP Integration**: Built-in support for Model Communication Protocol tools
- **Customizable UI**: Multiple positioning options and component visibility settings
- **Multi-language Support**: Localization support with custom locales
- **Tool Integration**: Built-in review form tools with DOM manipulation capabilities
- **Responsive Design**: Works on desktop and mobile devices

## Installation

```bash
npm install ai-mcp-web-app
```

## Usage

### Basic Implementation

```javascript
import {ChatWidget, useMCPServer} from "ai-mcp-web-app";
import {TOOLS} from "./mcp_tools";

function App() {
  useMCPServer(TOOLS);
  
  return (
    <div className="App">
      <ChatWidget 
        modelName="gpt-4o-mini"
        baseUrl="http://127.0.0.1:1234/v1"
        apiKey="your-api-key"
        locale="en"
      />
    </div>
  );
}
```

### Custom Configuration
```javascript
<ChatWidget 
  position="bottom-right"
  showComponents="both" // 'both', 'chat', 'voice'
  chatTitle="My AI Assistant"
  greeting="Welcome! How can I help you today?"
  modelName="gpt-4o-mini"
  baseUrl="http://127.0.0.1:1234/v1"
  apiKey={process.env.REACT_APP_OPENAI_API_KEY}
  locale="en"
  customLocales={{
    en: {
      openChat: "Open chat",
      voiceInput: "Voice input",
      // ... other custom translations
    }
  }}
/>
```

## Internal MCP Tool Integration
```javascript
useMCPServer(TOOLS);
```

## API Configuration
### OpenAI Compatible Endpoints
- **modelName**: AI model name (default: 'gpt-4o-mini')
- **baseUrl**: API endpoint URL (default: 'http://127.0.0.1:1234/v1')
- **apiKey**: Authentication key for API access

### Widget Positioning

Available positions:
- `top-left`
- `top-right` 
- `bottom-left`
- `bottom-right` (default)

## Localization
Supported languages:
- English (`en`)
- Russian (`ru`)
- Chinese (`zh`)

Add custom locales:
```javascript
const customLocales = {
  fr: {
    openChat: "Ouvrir le chat",
    voiceInput: "Entrée vocale",
    // ... other French translations
  }
};

<ChatWidget customLocales={customLocales} locale="fr" />
```

## Styling
The widget uses CSS modules with extensive customization options:
- Gradient backgrounds
- Smooth animations
- Responsive shadows
- Mobile-friendly design

Customize appearance by modifying `ChatWidget.css` or providing custom component.

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development
### Project Structure
```
lib/
├── ChatWidget/
│   ├── ChatWidget.js
│   ├── ChatWidget.css
│   └── locales/
│   │   ├── index.js
│   │   ├── ...
├── locales/
│   ├── openai/
│   │   ├── index.js
│   │   ├── ...
├── mcp_core.js
├── useMCPClient.js
├── useMCPServer.js
└── useOpenAIChat.js
```

### Key Components
- **ChatWidget**: Main UI component
- **useOpenAIChat**: Chat logic and message handling
- **MCP Core**: Protocol implementation for tool communication
- **MCP Tools**: Built-in DOM manipulation tools
- **useMCPClient/Server**: React hooks for MCP integration

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.
```
