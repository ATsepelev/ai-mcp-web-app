# Release v1.5.0: MCP Resources Support

## 🎉 Major New Feature: MCP Resources

This release adds **full support for MCP Resources** following the official [MCP Specification 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/server/resources).

### What's New

#### 📚 MCP Resources Implementation
- **Static Resources**: Provide contextual data to AI (product catalogs, configuration, FAQ)
- **Dynamic Resources**: Supply real-time data on-demand (form state, session info, statistics)
- **Automatic AI Integration**: Static resources pre-loaded into context, dynamic resources accessible via tool
- **Spec Compliance**: Full adherence to MCP 2025-06-18 specification

#### 🔧 Technical Features
- Spec-compliant resource descriptors with `uri`, `name`, `title`, `description`, `mimeType`, `size`
- Proper capabilities format: `{ tools: {}, resources: { subscribe, listChanged } }`
- Complete annotations support: `audience`, `priority`, `lastModified`, `cachePolicy`
- Binary data support via `blob` field (base64 encoding)
- Spec-compliant error codes: `-32002` (not found), `-32603` (internal error)
- Protocol methods: `resources/list`, `resources/read` + legacy variants

#### 🚀 Developer Experience
- Simple API: `useMCPServer(TOOLS, RESOURCES)`
- Client hook returns `resources` array and `readResource` function
- Automatic resource categorization based on `cachePolicy` annotation
- Context size limits to prevent prompt overflow (5KB per resource, 20KB total)
- Example resources included in `src/examples/mcp_resources_en.js`

### Usage Example

```javascript
import { ChatWidget, useMCPServer } from "ai-mcp-web-app";
import { TOOLS } from "./mcp_tools";
import { RESOURCES } from "./mcp_resources";

function App() {
  useMCPServer(TOOLS, RESOURCES);
  
  return (
    <ChatWidget 
      modelName="gpt-4o-mini"
      apiKey={process.env.REACT_APP_OPENAI_API_KEY}
    />
  );
}
```

### Resource Definition Example

```javascript
export const RESOURCES = [
  {
    uri: "resource://app/products",
    name: "products",
    title: "Product Catalog",
    description: "Available products with pricing",
    mimeType: "application/json",
    handler: async () => ({ products: [...] }),
    annotations: {
      audience: ["assistant"],
      priority: 0.9,
      cachePolicy: "static",
      lastModified: "2025-01-15T10:00:00Z"
    }
  }
];
```

### Benefits

1. **Enhanced AI Context**: AI has immediate access to your application's data
2. **Reduced Prompt Engineering**: No need to manually describe data in prompts
3. **Real-time Data Access**: Dynamic resources always return current state
4. **Standardized Protocol**: Follows official MCP specification
5. **Performance Optimized**: Automatic size limiting and caching strategies

### Documentation

- 📖 Comprehensive README update with Resources section
- 📋 Detailed CHANGELOG with all changes
- 🔍 MCP Spec Compliance Report in `docs/`
- 💡 Example resources with real-world use cases

### Bug Fixes & Optimizations

- Fixed infinite loop prevention with `resourcesLoadedRef`
- Stable function references via `useCallback` to prevent re-renders
- Context management with size limits for large prompts

---

## 📦 Installation

```bash
npm install ai-mcp-web-app@1.5.0
```

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/ai-mcp-web-app)
- [GitHub Repository](https://github.com/ATsepelev/ai-mcp-web-app)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)
- [Documentation](https://github.com/ATsepelev/ai-mcp-web-app#readme)

## 📝 Full Changelog

See [CHANGELOG.md](https://github.com/ATsepelev/ai-mcp-web-app/blob/main/CHANGELOG.md) for complete details.

---

**Previous Version:** [v1.4.1](https://github.com/ATsepelev/ai-mcp-web-app/releases/tag/v1.4.1)

