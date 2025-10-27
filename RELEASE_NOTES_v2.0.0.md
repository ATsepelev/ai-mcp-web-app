# Release v2.0.0: LLM Configuration Refactor and Debug Mode

## 🎉 Major Release - Breaking Changes

This release represents a complete refactoring of LLM configuration to provide a more flexible, OpenAI-style configuration format with automatic fallback support.

## 🚨 Breaking Changes

### LLM Configuration Structure

Individual LLM props have been **removed** and consolidated into a single `llmConfigs` array:

**Removed props:**
- `modelName`
- `baseUrl`
- `apiKey`
- `temperature`
- `maxContextSize`
- `maxToolLoops`
- `systemPromptAddition`
- `validationOptions`
- `toolsMode`

**New prop:**
- `llmConfigs` - Array of configuration objects

### Migration Example

**Before (v1.x):**
```javascript
<ChatWidget 
  modelName="gpt-4o-mini"
  baseUrl="http://127.0.0.1:1234/v1"
  apiKey="your-api-key"
  temperature={0.5}
  maxContextSize={32000}
/>
```

**After (v2.0):**
```javascript
<ChatWidget 
  llmConfigs={[{
    modelName: "gpt-4o-mini",
    baseUrl: "http://127.0.0.1:1234/v1",
    apiKey: "your-api-key",
    temperature: 0.5,
    maxContextSize: 32000
  }]}
/>
```

## ✨ New Features

### 1. Automatic Fallback Support

Configure multiple LLM endpoints with automatic failover on errors:

```javascript
<ChatWidget 
  llmConfigs={[
    {
      modelName: "gpt-4o",
      baseUrl: "https://primary-api.com/v1",
      apiKey: "primary-key"
    },
    {
      modelName: "gpt-3.5-turbo",
      baseUrl: "https://backup-api.com/v1",
      apiKey: "backup-key"
    }
  ]}
/>
```

**Benefits:**
- 🔄 Automatically switches to next config on API errors
- ✅ Resets to primary config on successful request
- 🚀 High-availability deployments with backup LLMs
- 📊 Fallback events visible in debug mode

### 2. Debug Mode

New `debug` prop for comprehensive development logging:

```javascript
<ChatWidget 
  debug={true}
  llmConfigs={[...]}
/>
```

**When enabled, logs include:**
- 🔧 MCP protocol initialization
- 🌐 External server connections
- 📡 LLM API requests and responses
- 🛠️ Tool calls with arguments and results
- 🔄 Fallback events and config switching
- 📦 Resource loading operations
- 💾 Chat history persistence

**Default:** `false` (production-ready, zero console output)

All logs formatted with `[Debug]` prefix for easy filtering.

### 3. Per-Config Settings

Each LLM configuration supports independent settings:

```javascript
llmConfigs={[
  {
    modelName: "gpt-4",
    temperature: 0.2,      // Low temperature for accuracy
    maxContextSize: 128000,
    maxToolLoops: 10,
    toolsMode: "api"
  },
  {
    modelName: "gpt-3.5-turbo",
    temperature: 0.8,      // Higher temperature for creativity
    maxContextSize: 16000,
    maxToolLoops: 5,
    toolsMode: "prompt"
  }
]}
```

## 🔧 Technical Improvements

- Refactored `ChatWidget.js` to accept `llmConfigs` prop
- Enhanced `useOpenAIChat.js` with:
  - Config index state management
  - Automatic fallback logic in error handlers
  - Config normalization with defaults
  - Success reset to primary config
- Updated `chatHistoryStorage.js`:
  - `generateStorageKey()` accepts llmConfigs array
  - Backwards compatible with old format
  - Uses first config for key generation
- Added debug flag support across all MCP components:
  - `mcp_core.js` - Protocol-level logging
  - `useMCPClient.js` - Client initialization
  - `useMCPServer.js` - Server registration
- Removed all production console logs when debug is disabled
- Updated all example applications

## 📚 Documentation

- Comprehensive README updates with migration guide
- Detailed CHANGELOG with all breaking changes
- Code examples for single and multi-config setups
- Debug mode usage guide

## 🔗 Links

- **npm Package:** https://www.npmjs.com/package/chatrium
- **GitHub Repository:** https://github.com/ATsepelev/chatrium
- **Documentation:** [README.md](https://github.com/ATsepelev/chatrium#readme)
- **Issues:** https://github.com/ATsepelev/chatrium/issues

## 📦 Installation

```bash
npm install chatrium@2.0.0
```

**Note:** This package has been rebranded to `chatrium` in v3.0.0. For the latest version, use:
```bash
npm install chatrium
```

## ⚠️ Upgrade Notes

1. **Breaking change:** Update all `ChatWidget` components to use `llmConfigs` array
2. **No backwards compatibility:** v1.x props will not work in v2.0
3. **Test thoroughly:** Verify your LLM configuration works before deploying
4. **Debug mode:** Enable temporarily during migration for detailed logs

## 🙏 Feedback

If you encounter any issues or have suggestions, please [open an issue](https://github.com/ATsepelev/ai-mcp-web-app/issues).

---

**Full Changelog:** https://github.com/ATsepelev/chatrium/blob/main/CHANGELOG.md

