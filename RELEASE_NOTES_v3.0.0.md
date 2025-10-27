# Release v3.0.0: Rebranding to Chatrium Widget

## 🎉 Major Release - Rebranding & Ecosystem Launch

This release represents a complete rebranding of the project from **ai-mcp-web-app** to **Chatrium Widget** (`@chatrium/widget`) - the first package in the **Chatrium ecosystem** of AI conversation tools.

## 🚨 Breaking Changes

### Package Name Change

**Before (v2.0.0):**
- Package name: `ai-mcp-web-app`
- Repository: `ATsepelev/ai-mcp-web-app`

**After (v3.0.0):**
- Package name: `@chatrium/widget` (scoped)
- Organization: `chatrium` (GitHub)
- Repository: `chatrium/widget`

### Migration Required

**Step 1: Uninstall old package**
```bash
npm uninstall ai-mcp-web-app
```

**Step 2: Install new package**
```bash
npm install @chatrium/widget
```

**Step 3: Update all imports**
```javascript
// Before
import { ChatWidget, useMCPServer } from "ai-mcp-web-app";

// After
import { ChatWidget, useMCPServer } from "@chatrium/widget";
```

## ✨ New Features

### Chatrium Ecosystem

**Chatrium** is now a family of tools for building AI-powered conversational interfaces. The `@chatrium/widget` package is the first in a growing ecosystem:

- **@chatrium/widget** (this release) - React chat widget with voice input and MCP integration
- **@chatrium/server** _(coming soon)_ - Backend MCP server implementation
- **@chatrium/cli** _(coming soon)_ - Development and deployment tools  
- **@chatrium/tools** _(coming soon)_ - Reusable MCP tool library

This ecosystem approach allows for:
- ✅ Modular architecture
- ✅ Independent versioning
- ✅ Specialized packages for different use cases
- ✅ Easy integration between Chatrium tools
- ✅ Room for future expansion

### Brand Identity

**Chatrium** (pronunciation: CHAT-ree-um)
- **Etymology:** "Chat" + "-rium" (as in auditorium, aquarium)
- **Concept:** A space for AI conversations
- **Tagline:** "Your space for AI conversations"

### Visual Assets

**Logo:**
- Hexagonal design representing a "space" or "room" for conversations
- Modern gradient: Deep Blue (#2563EB) to Purple (#7C3AED)
- Three style variations: full logo, icon only, wordmark only
- Available in SVG and PNG formats (16px - 512px)

**Color Palette:**
```css
/* Primary Colors */
--chatrium-primary: #2563EB;      /* Deep Blue */
--chatrium-secondary: #7C3AED;    /* Purple */
--chatrium-gradient: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);

/* Functional Colors */
--chatrium-success: #10B981;
--chatrium-warning: #F59E0B;
--chatrium-error: #EF4444;
--chatrium-info: #3B82F6;

/* Neutral Colors */
--chatrium-text: #1F2937;
--chatrium-bg: #F9FAFB;
--chatrium-border: #E5E7EB;
```

**Typography:**
- Primary: Inter (UI and body text)
- Display: Space Grotesk (logo and headings)
- Monospace: JetBrains Mono (code)

### Brand Guidelines

New comprehensive brand guidelines document (`BRAND_GUIDELINES.md`) including:
- Logo usage rules and restrictions
- Complete color palette with hex codes
- Typography scale and font families
- Voice and tone guidelines
- UI design system (spacing, shadows, borders)
- Package naming conventions
- Code style guidelines
- Ecosystem structure

## 📝 Documentation Updates

### Updated Files

1. **README.md**
   - New title: "Chatrium Widget"
   - Chatrium ecosystem section added
   - Updated all package references to `@chatrium/widget`
   - Updated all code examples with new imports
   - Added links to GitHub organization
   - Updated repository structure

2. **package.json**
   - Name changed to `@chatrium/widget`
   - Version bumped to 3.0.0
   - Updated description with "Chatrium Widget" branding
   - Repository moved to `chatrium/widget`
   - Organization-based URLs

3. **CHANGELOG.md**
   - Added comprehensive v3.0.0 entry
   - Ecosystem explanation
   - Migration guide from v2.0.0
   - Future packages roadmap

4. **Examples**
   - Updated `src/examples/App.js` with new imports
   - Updated `consumer/src/App.jsx` with new imports
   - Updated `consumer/package.json` with new dependency

## 🔧 Technical Details

### No Functional Changes

- ✅ All features from v2.0.0 preserved
- ✅ No API changes (except package name)
- ✅ Complete backwards compatibility (code-wise)
- ✅ All tests passing
- ✅ Build configuration unchanged

### What Stays the Same

- Chat widget functionality
- Voice input support
- MCP tool integration
- MCP resources support
- LLM configuration (llmConfigs array)
- Debug mode
- Localization (en, ru, zh)
- Theme customization
- External MCP servers support

### What Changed

- Package name: `ai-mcp-web-app` → `@chatrium/widget`
- Repository: `ATsepelev/ai-mcp-web-app` → `chatrium/widget`
- Organization created: `chatrium`
- Import statements
- Documentation references
- Brand identity

## 📦 Installation

```bash
# Fresh installation
npm install @chatrium/widget

# Or with Yarn
yarn add @chatrium/widget

# Or with pnpm
pnpm add @chatrium/widget
```

## 🎯 Quick Migration Guide

### For Existing Users

1. **Update package.json:**
```json
{
  "dependencies": {
    "@chatrium/widget": "^3.0.0"
  }
}
```

2. **Find and replace in all files:**
```bash
# Unix/Mac
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i 's/ai-mcp-web-app/@chatrium\/widget/g' {} +

# Windows PowerShell
Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts,*.tsx | ForEach-Object { 
  (Get-Content $_.FullName) -replace 'ai-mcp-web-app', '@chatrium/widget' | 
  Set-Content $_.FullName 
}
```

3. **Install and test:**
```bash
npm install
npm start
```

### Verification Checklist

- [ ] Updated package.json
- [ ] Updated all import statements
- [ ] Ran npm install
- [ ] Tested application
- [ ] All features working as expected

## 📚 Resources

### Documentation

- **README:** [github.com/chatrium/widget](https://github.com/chatrium/widget#readme)
- **Brand Guidelines:** [BRAND_GUIDELINES.md](https://github.com/chatrium/widget/blob/main/BRAND_GUIDELINES.md)
- **Changelog:** [CHANGELOG.md](https://github.com/chatrium/widget/blob/main/CHANGELOG.md)

### Links

- **NPM Package:** https://www.npmjs.com/package/@chatrium/widget
- **GitHub Organization:** https://github.com/chatrium
- **Widget Repository:** https://github.com/chatrium/widget
- **Issues:** https://github.com/chatrium/widget/issues
- **License:** MIT

## 🤔 Why Chatrium?

The name "Chatrium" was chosen after extensive research of popular AI chat and conversational AI projects:

### Meaning
- **"Chat"** - Clear, direct, universally understood
- **"-rium"** - Latin suffix meaning "place" or "space" (as in auditorium, aquarium)
- **Together** - "A space for conversations"

### Benefits
- ✅ **Memorable** - Easy to remember and pronounce
- ✅ **Unique** - No conflicts with existing projects
- ✅ **Modern** - Fits with current tech naming trends (like Vercel, Supabase)
- ✅ **Universal** - Works across languages and cultures
- ✅ **Brandable** - Strong visual and verbal identity
- ✅ **Meaningful** - Reflects the core purpose of the project
- ✅ **Scalable** - Works as an ecosystem of related tools

### Pronunciation
**CHAT-ree-um** (rhymes with "auditorium")

## 🌟 Future Roadmap

### Upcoming Chatrium Packages

**@chatrium/server** - Backend MCP Server
- Production-ready MCP server implementation
- WebSocket and SSE transport support
- Authentication and authorization
- Tool and resource hosting
- Scaling and monitoring

**@chatrium/cli** - Development Tools
- Project scaffolding
- Local development server
- Deployment utilities
- Configuration management
- Testing helpers

**@chatrium/tools** - Tool Library
- Pre-built MCP tools
- Common use cases (forms, data, APIs)
- Easy customization
- TypeScript support
- Extensive documentation

**@chatrium/themes** - UI Theme Pack
- Pre-designed themes
- Dark mode support
- Accessibility compliant
- CSS variables based
- Easy customization

## 🙏 Acknowledgments

Thank you to all users and contributors who have supported this project. The rebranding to Chatrium marks an exciting new chapter in making AI chat integration simple and accessible for developers worldwide.

## ⚠️ Important Notes

1. **NPM Package:** The old `ai-mcp-web-app` package will remain available for existing users but will not receive updates. All future development will be under the `@chatrium/widget` package.

2. **GitHub Repository:** The repository has been moved to a GitHub organization. GitHub will automatically redirect from the old URL, but we recommend updating your remote URLs:
```bash
git remote set-url origin https://github.com/chatrium/widget.git
```

3. **No Code Changes:** This is purely a rebranding - your code logic remains unchanged. Only import statements need to be updated.

4. **Ecosystem Growth:** Keep an eye on the [@chatrium organization](https://github.com/chatrium) for new packages and tools!

## 🐛 Reporting Issues

If you encounter any issues with the migration or have questions, please:
1. Check the [Migration Guide](#quick-migration-guide)
2. Review [CHANGELOG.md](https://github.com/chatrium/widget/blob/main/CHANGELOG.md)
3. Open an issue at https://github.com/chatrium/widget/issues

## 🎊 What's Next?

With the rebranding complete and the ecosystem foundation laid, we're excited to work on:
- **@chatrium/server** - First priority after widget stabilization
- Enhanced MCP protocol support
- More example integrations
- Performance optimizations
- Additional localization options
- Comprehensive video tutorials

Stay tuned for updates!

---

**Release Date:** October 27, 2025  
**Full Changelog:** https://github.com/chatrium/widget/blob/main/CHANGELOG.md  
**Ecosystem:** https://github.com/chatrium
