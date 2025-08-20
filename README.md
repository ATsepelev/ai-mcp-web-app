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

## Building from Source

To build the widget from source for customization or contribution:

```bash
git clone https://github.com/ATsepelev/ai-mcp-web-app.git
cd ai-mcp-web-app
npm install
npm run build
```

The compiled assets will be generated in the `dist/` directory and can be integrated into your project.

### Unified Application Architecture
Unlike traditional AI integrations requiring separate backend services, this widget operates as a **self-contained solution** where:
- MCP server runs directly in the browser
- Tool handlers execute within your application context
- Chat client and voice interface share the same runtime
- All components communicate through an internal protocol

This architecture provides:
- **Zero external dependencies**: No backend infrastructure needed
- **Seamless DOM integration**: Tools can directly manipulate your page elements
- **Real-time execution**: Instant feedback without network latency
- **Simplified deployment**: Single JavaScript bundle integration

This makes it an exceptionally powerful yet straightforward solution for automating workflows in any web application with minimal integration effort.

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

## MCP Tool Development

### Tool Definition Structure
MCP tools follow OpenAI's function calling specification with enhanced capabilities for web automation. Each tool consists of:

1. **Function Schema**: Describes the tool's interface using JSON Schema
2. **Handler Implementation**: JavaScript function that executes when called

```javascript
export const TOOLS = [
  {
    function: {
      name: "toolName",
      description: "Clear description of what the tool does",
      parameters: {
        type: "object",
        properties: {
          // Parameter definitions with validation
        },
        required: ["requiredParameters"]
      }
    },
    handler: async (args) => {
      // Implementation logic with full DOM access
      // Can interact with page elements, APIs, etc.
    }
  }
];
```

### Key Features of MCP Tools
- **Type-safe parameters**: Automatic validation based on JSON Schema
- **Full DOM access**: Handlers can directly manipulate page elements
- **Async execution**: Support for asynchronous operations
- **Error handling**: Automatic error reporting to the AI
- **Context awareness**: Access to current page state and user interactions

### Example: Review Form Automation Tools
```javascript
export const REVIEW_TOOLS = [
  {
    function: {
      name: "fillReviewForm",
      description: "Fills product review form with provided details",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Reviewer's name" },
          stars: { 
            type: "integer", 
            minimum: 1, 
            maximum: 5,
            description: "Rating from 1-5 stars"
          },
          review: { type: "string", description: "Review text content" }
        },
        required: ["name", "stars"]
      }
    },
    handler: fillReviewForm
  },
  {
    function: {
      name: "clickSubmitReview",
      description: "Clicks review form submit button",
      parameters: { type: "object", properties: {} }
    },
    handler: clickSubmitReview
  },
  {
    function: {
      name: "clearReviewForm",
      description: "Resets all fields in the review form",
      parameters: { type: "object", properties: {} }
    },
    handler: clearReviewForm
  }
];
```

### Implementing Tool Handlers
Handler functions receive validated parameters and can interact with the DOM:

```javascript
function fillReviewForm({ name, stars, review }) {
  document.querySelector('#review-name').value = name;
  document.querySelector(`#star-rating [data-stars="${stars}"]`).click();
  if (review) document.querySelector('#review-text').value = review;
}

function clickSubmitReview() {
  document.querySelector('#review-submit').click();
}
```

## Internal MCP Server Integration
Initialize the MCP server with your tool definitions:

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