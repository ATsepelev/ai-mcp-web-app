# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
