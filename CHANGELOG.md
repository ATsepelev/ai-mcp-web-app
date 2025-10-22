# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.6] - 2025-01-22

### Fixed
- **Critical: Partial MCP Server Failures Breaking All Tools**: Fixed issue where failure of one external MCP server would prevent all external tools from working
  - External clients now added to Map only after successful initialization
  - Failed connections are properly logged with warnings but don't block successful servers
  - Tools and resources from successfully connected servers remain fully functional
  - Graceful degradation: system works with partial connectivity
  - Status correctly shows `partial_connected` when some servers fail

### Technical
- Moved `externalClients.current.set()` to execute only after successful `initialize()`
- Added console warnings for failed server connections with server ID and error message
- Each external server initializes independently in try-catch block
- Failed servers return `{ client: null, tools: [], resources: [], error }` without affecting others

## [1.5.5] - 2025-01-22

### Fixed
- **Dependency Stabilization**: Memoize useMCPClient dependencies to prevent unnecessary reinitialization
  - Added JSON.stringify memoization for mcpServers, envVars, allowedTools, blockedTools, externalServers
  - Dependencies now compared by value, not by reference
  - Prevents client reinitialization when parent component passes new object/array instances with same data
  - Significantly reduces unnecessary useEffect triggers
  - External MCP clients remain connected when widget state changes

### Technical
- All object/array dependencies memoized via `JSON.stringify`
- useEffect dependencies changed to JSON strings for deep comparison
- No client disconnection when equivalent data is passed with different references

## [1.5.4] - 2025-01-22

### Fixed
- **Critical: Excessive Reinitialization**: Fixed constant client recreation causing infinite reconnection loops
  - Reverted to `if (!client)` check to prevent unnecessary reinitialization
  - Changed `externalClients` from `useMemo` to `useRef` for stable reference
  - Added `initializingRef` to prevent concurrent initialization attempts
  - Reset `initializingRef` in cleanup and after initialization completes
  - Completely prevents client recreation when dependencies change unnecessarily
  - Eliminates reconnection attempts triggered by component re-renders

### Technical
- `externalClients` now uses `useRef` instead of `useMemo` for persistent Map
- `initializingRef` guards prevent duplicate parallel initializations
- Cleanup properly resets `initializingRef.current` to allow reinitialization if needed
- Only initialize once when client is null, not on every dependency change

## [1.5.3] - 2025-01-22 (REVERTED)

### Fixed
- **Critical: useEffect Race Condition**: Fixed stale client state and race conditions in useMCPClient
  - Reset client/tools/resources state at the start of useEffect
  - Always reinitialize clients when dependencies change (removed `if (!client)` check)
  - Added cancellation flag to prevent stale initialization from completing
  - Prevents race conditions when dependencies change rapidly
  - Ensures cleanup properly disconnects clients before new initialization
  - Completely eliminates reconnection attempts after component updates

### Technical
- State reset at useEffect start prevents stale client usage
- Cancellation flag (`cancelled`) stops async initialization if unmounted
- Cleanup sets `cancelled = true` and disconnects all clients synchronously
- Initialization checks `cancelled` flag before updating state
- Fixes issue where old initialization would complete after cleanup

## [1.5.2] - 2025-01-22

### Fixed
- **Critical: Reconnection Timers Not Canceled**: Fixed reconnection attempts continuing after disconnect()
  - Added `reconnectTimer` property to track scheduled reconnections
  - Timers are now properly canceled in `disconnect()` method
  - Prevents reconnection attempts from accumulating in background
  - Fixes continuous reconnection attempts when typing in chat
  - Both WebSocket and SSE clients now check `shouldReconnect` before scheduling timers

### Technical
- `MCPWebSocketClient` and `MCPSseClient` now store reconnect timer reference
- Timers are cleared via `clearTimeout()` when `disconnect()` is called
- Reconnection scheduling only occurs if `shouldReconnect` flag is true
- Prevents orphaned timers from continuing to fire after client cleanup

## [1.5.1] - 2025-01-22

### Fixed
- **Critical: Infinite Reconnection Loop**: Fixed infinite reconnection attempts from external MCP servers
  - Added `shouldReconnect` flag to control reconnection behavior
  - Added `disconnect()` method to properly stop WebSocket and SSE clients
  - Added cleanup in `useMCPClient` to disconnect clients on unmount or prop changes
  - Prevents exponential growth of reconnection attempts when typing or changing props
  - Fixes browser freeze when external servers are unavailable
- **TypeError in disconnect()**: Fixed `pending.reject is not a function` error
  - Added type check before calling `reject()` on pending requests
  - SSE client stores empty objects `{}` for some requests, now handles gracefully

### Technical
- `MCPWebSocketClient` now has `disconnect()` method and checks `shouldReconnect` flag
- `MCPSseClient` now has `disconnect()` method and checks `shouldReconnect` flag
- `useMCPClient` cleanup properly disconnects all external clients
- Pending requests validation before rejection to handle empty objects
- All pending requests are rejected when client disconnects

## [1.5.0] - 2025-01-22

### Added
- **MCP Resources Support**: Full implementation of MCP Resources specification (2025-06-18)
  - Static resources for contextual data (product catalogs, configuration, FAQ)
  - Dynamic resources for real-time data (form state, session info, statistics)
  - Automatic categorization via `cachePolicy` annotation
  - Spec-compliant resource descriptors with `uri`, `name`, `title`, `description`, `mimeType`, `size`
  - Support for both text and binary (base64) content
  - `resources/list` and `resources/read` protocol methods
  - Legacy method support: `mcp.resources.list` and `mcp.resources.read`
  
- **AI Integration of Resources**: 
  - Static resources pre-loaded into system prompt for immediate context
  - Dynamic resources exposed as `readMCPResource` tool for on-demand access
  - Context size limits (5KB per resource, 20KB total) to prevent prompt overflow
  - Efficient resource categorization based on `cachePolicy` metadata
  
- **New React Hooks**:
  - `useMCPServer` now accepts `resources` parameter for resource registration
  - `useMCPClient` returns `resources` array and `readResource` function
  - Resources merged from internal and external MCP servers
  
- **Spec Compliance (MCP 2025-06-18)**:
  - Proper capabilities format: `{ tools: {}, resources: { subscribe, listChanged } }`
  - Complete resource annotations: `audience`, `priority`, `lastModified`
  - Binary data support via `blob` field (base64 encoding)
  - Spec-compliant error codes: `-32002` (not found), `-32603` (internal error)

### Changed
- **Capabilities Format**: Updated from array to object structure per MCP spec
- **Resource Descriptors**: Enhanced with `title` (display name) and `size` (bytes) fields
- **Annotations**: Added `lastModified` (ISO 8601) timestamp field
- **Resource Contents**: Now include `name` and `title` fields in response
- **Performance**: Optimized resource loading with ref-based flags to prevent infinite loops

### Fixed
- **Infinite Loop Prevention**: Added `resourcesLoadedRef` to ensure static resources load only once
- **Stable Function References**: Wrapped `readResource` in `useCallback` to prevent re-renders
- **Context Management**: Implemented size limits to prevent excessively large prompts

### Technical
- Complete MCP Resources protocol implementation in `mcp_core.js`
- Resource merging and routing logic in `useMCPClient.js`
- Resource registration and handler management in `useMCPServer.js`
- AI context integration in `useOpenAIChat.js`
- Example resources in `src/examples/mcp_resources_en.js`
- Comprehensive spec compliance documentation

## [1.4.1] - 2025-10-21

### Added
- **Markdown Code Block Tool Calls**: Support for parsing tool calls from markdown JSON code blocks
  - LLMs can now wrap tool calls in \`\`\`json blocks for better formatting
  - Validates tool registration before execution
  - Supports multiple tool calls in single response
  - Automatic extraction and cleanup of markdown blocks

### Fixed
- **Empty JSON Blocks Display**: Fixed issue where empty JSON markdown blocks appeared in chat after tool execution
  - Comprehensive 5-level cleanup system: parse → clean → render → validate → display
  - Added validation in `renderMarkdown` to skip empty code blocks
  - Improved `cleanAssistantContent` with aggressive empty block removal
  - Multiple cleanup passes to handle edge cases with multiple tool calls
  
- **Empty Assistant Messages**: Fixed display of empty assistant messages after content cleanup
  - Reordered logic to clean content before checking emptiness
  - Added DOM-based validation to verify rendered content has actual text
  - Enhanced `isDisplayContentEmpty` to detect invisible Unicode characters
  - Messages with only whitespace/braces now properly hidden

### Changed
- **Enhanced System Prompts**: Updated for all locales (English, Russian, Chinese) with explicit tool call format instructions
  - Clear examples of correct vs incorrect tool call format
  - Support for both native OpenAI tool_calls and markdown-wrapped alternatives
  - Emphasis that "name" field must contain tool name, not user data
  - Better guidance for models without native tool_calls support

### Technical
- Improved tool call extraction with index-based removal for multiple blocks
- Added Unicode whitespace detection (zero-width spaces, non-breaking spaces, etc.)
- Optimized `isDisplayContentEmpty` to avoid double-cleaning content
- Multi-pass cleanup regex patterns for complex edge cases
- Better separation between content cleaning and validation logic

## [1.4.0] - 2025-10-21

### Added
- **Voice Input Module**: Extracted voice recognition logic into separate `voiceInput.js` module
  - New `createVoiceRecognition()` function for encapsulated voice input management
  - Clean API: `start()`, `stop()`, `isSupported()`, `cleanup()`
  - Improved code organization and maintainability

### Fixed
- **Voice Input Duplication Bug**: Fixed issue where spoken words were being duplicated
  - Root cause: Speech Recognition API returns cumulative results, old code was accumulating duplicates
  - Solution: Buffer is now rebuilt from scratch on each result event instead of appending
  - Added `finalDelivered` flag to prevent double delivery in `onresult` and `onend` handlers
  - Improved transcript delivery logic to handle all edge cases properly

### Changed
- Refactored `ChatWidget.js` voice recognition initialization (~95 lines reduced to ~40 lines)
- Simplified `toggleVoiceRecording()` function (~30 lines reduced to ~15 lines)
- Removed unused internal refs: `isStartingRef`, `hasStartedRef`, `hasGotResultRef`, `hasRetriedStartRef`
- Voice recognition state management now handled by dedicated module

### Technical
- Better separation of concerns: voice logic isolated from UI component
- Enhanced error handling in voice recognition module
- Cleaner component lifecycle management
- No breaking changes - fully backward compatible

## [1.3.2] - 2025-10-17

### Changed
- **Optimized package size**: Reduced bundle size by ~20MB
  - Made `js-tiktoken` an optional dependency instead of required
  - Added fallback to approximate token counting (~3.5 chars per token)
  - Users can choose: accurate counting with tiktoken or lightweight approximate counting
  - Install tiktoken separately for accurate counting: `npm install js-tiktoken`

### Technical
- Token counting now has dual mode: accurate (with tiktoken) or approximate (without)
- Approximate counting uses ~3.5 characters per token heuristic
- Console info message when using approximate counting

## [1.3.1] - 2025-10-17

### Added
- **Context Size Management**: New `maxContextSize` parameter (default: 32000 tokens) for automatic context window management
  - Accurately counts tokens using tiktoken library (cl100k_base encoding)
  - Automatically excludes oldest messages when context limit is exceeded
  - System message is always preserved in the first position
  - Excluded messages remain visible in UI with visual indicators (dimmed, dashed border, warning icon)
  - Localized tooltips explain excluded messages won't be sent to AI assistant
  - Supports English, Russian, and Chinese locales

### Fixed
- System messages are now properly filtered from UI display
- System message always maintains first position in filtered message arrays
- Fixed duplicate variable declarations in message filtering logic

### Dependencies
- Added `js-tiktoken` ^1.0.15 for accurate token counting

## [1.2.0] - 2025-01-27

### Added
- Enhanced MCP (Model Communication Protocol) core functionality
- Improved tool integration capabilities
- New tools mode guide for better developer experience
- Enhanced localization support for all supported languages

### Changed
- Updated ChatWidget component with new features and improvements
- Enhanced OpenAI chat hook with better error handling and functionality
- Improved localization files for English, Russian, and Chinese languages
- Updated MCP client and server implementations for better reliability

### Fixed
- Various bug fixes and stability improvements
- Enhanced error handling across components
- Improved tool execution reliability

### Technical Improvements
- Better TypeScript support and type safety
- Enhanced build configuration
- Improved code organization and structure
- Better documentation and examples

## [1.1.6] - Previous Release

### Features
- Initial release with basic chat widget functionality
- Voice input support
- MCP tool integration
- Multi-language localization
- Customizable UI components
