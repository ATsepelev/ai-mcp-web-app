# ⚠️ This package has been renamed to @chatrium/widget

## 📢 Important Notice

This repository and npm package (`ai-mcp-web-app`) have been **deprecated** and will no longer receive updates.

The project has been rebranded as **Chatrium** and is now part of a larger ecosystem of AI conversation tools.

## 🎉 New Location

**Package has moved to:**

- **New package name:** `@chatrium/widget`
- **New repository:** https://github.com/chatrium/widget
- **New npm page:** https://www.npmjs.com/package/@chatrium/widget
- **Organization:** https://github.com/chatrium

## 🚀 Why the Change?

We've rebranded to **Chatrium** to better reflect our vision:

- ✅ **Chatrium** = "Chat" + "-rium" (space/room for conversations)
- ✅ Building an **ecosystem** of AI conversation tools
- ✅ Professional scoped package: `@chatrium/widget`
- ✅ Room for growth: `@chatrium/server`, `@chatrium/cli`, etc.

## 📦 Migration Guide

Migrating is simple - just update your package name:

### Step 1: Uninstall old package

```bash
npm uninstall ai-mcp-web-app
```

### Step 2: Install new package

```bash
npm install @chatrium/widget
```

### Step 3: Update imports

```javascript
// Before
import { ChatWidget, useMCPServer } from "ai-mcp-web-app";

// After  
import { ChatWidget, useMCPServer } from "@chatrium/widget";
```

### Step 4: Done! ✅

**No other code changes needed** - the API is 100% compatible with v2.0.0.

## 🔄 Find and Replace

For quick migration across all files:

**Unix/Mac:**
```bash
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i 's/ai-mcp-web-app/@chatrium\/widget/g' {} +
```

**Windows PowerShell:**
```powershell
Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts,*.tsx | ForEach-Object { 
  (Get-Content $_.FullName) -replace 'ai-mcp-web-app', '@chatrium/widget' | 
  Set-Content $_.FullName 
}
```

## 📚 What's New in v3.0.0

While the functionality remains the same, the new release includes:

- ✨ Professional brand identity with logo
- 📦 Scoped npm package (`@chatrium/widget`)
- 🏢 GitHub organization structure
- 📖 Enhanced documentation
- 🎨 Comprehensive brand guidelines
- 🔮 Foundation for ecosystem growth

See the [full changelog](https://github.com/chatrium/widget/blob/main/CHANGELOG.md).

## 🌟 Chatrium Ecosystem

**@chatrium/widget** is the first package in the Chatrium family. Future packages:

- **@chatrium/server** _(coming soon)_ - Backend MCP server implementation
- **@chatrium/cli** _(coming soon)_ - Development and deployment tools
- **@chatrium/tools** _(coming soon)_ - Reusable MCP tool library

## 🆘 Need Help?

- **Migration issues?** Open an issue: https://github.com/chatrium/widget/issues
- **Questions?** Check the docs: https://github.com/chatrium/widget#readme
- **Discussions:** https://github.com/chatrium/widget/discussions

## ⏰ Timeline

- **Now:** `ai-mcp-web-app` is deprecated (no new features)
- **v2.0.1:** Last release with deprecation warning
- **Future:** This repository will be archived (read-only)

## 🙏 Thank You

Thank you for using ai-mcp-web-app! We're excited about the future of Chatrium and hope you'll join us on this journey.

**Migrate today:** https://github.com/chatrium/widget

---

**Quick Links:**

- 📦 NPM: https://www.npmjs.com/package/@chatrium/widget
- 📖 Docs: https://github.com/chatrium/widget
- 🎨 Brand: https://github.com/chatrium/widget/blob/main/BRAND_GUIDELINES.md
- 🔄 Migration: https://github.com/chatrium/widget#migration-from-v2

