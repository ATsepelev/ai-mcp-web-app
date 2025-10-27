# Chatrium Brand Guidelines

## Brand Identity

**Chatrium** is a family of tools for building AI-powered conversational interfaces. Our brand represents innovation, simplicity, and the power of conversation.

### Chatrium Ecosystem

Chatrium consists of multiple packages working together:

- **@chatrium/widget** - React chat widget with voice input and MCP integration
- **@chatrium/server** _(coming soon)_ - Backend MCP server implementation
- **@chatrium/cli** _(coming soon)_ - Development and deployment tools
- **@chatrium/tools** _(coming soon)_ - Reusable MCP tool library

## Name

### Official Name
- **Correct:** Chatrium
- **Pronunciation:** CHAT-ree-um (rhymes with "auditorium")
- **Never use:** chatrium, ChatRium, Chat-rium, CHATRIUM (except in logos)

### Tagline
**Primary:** "Your space for AI conversations"

**Alternatives:**
- "Where conversations come alive"
- "AI conversations, beautifully crafted"
- "The conversation space for modern apps"

## Logo

### Logo Concept
The Chatrium logo features a hexagonal shape representing a "space" or "room" for conversations, with subtle wave patterns inside suggesting dialogue and voice interaction.

### Logo Variants
1. **Full Logo:** Symbol + wordmark
2. **Icon Only:** Just the hexagonal symbol (for favicons, app icons)
3. **Wordmark Only:** Text-only version for compact spaces

### Usage Guidelines

**Minimum Size:**
- Full logo: 120px width
- Icon only: 32px
- Wordmark only: 80px width

**Clear Space:**
- Maintain at least 20px of clear space around the logo
- Clear space equals half the height of the hexagon symbol

**Dos:**
- ✅ Use official logo files provided
- ✅ Maintain aspect ratio
- ✅ Use on approved backgrounds
- ✅ Ensure sufficient contrast

**Don'ts:**
- ❌ Do not rotate, skew, or distort the logo
- ❌ Do not change logo colors (except approved variations)
- ❌ Do not add effects (shadows, glows, outlines)
- ❌ Do not place on busy backgrounds without proper contrast

## Color Palette

### Primary Colors

```css
/* Tech-Premium Gradient (Recommended) */
--chatrium-primary: #2563EB;      /* Deep Blue */
--chatrium-secondary: #7C3AED;    /* Purple */
--chatrium-gradient: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
```

**Usage:** Primary buttons, links, headers, logo gradient

### Alternative Color Schemes

**Modern:**
```css
--chatrium-alt-primary: #06B6D4;   /* Cyan */
--chatrium-alt-secondary: #3B82F6; /* Blue */
--chatrium-alt-gradient: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%);
```

**Innovative:**
```css
--chatrium-alt2-primary: #667eea;   /* Light Purple */
--chatrium-alt2-secondary: #764ba2; /* Dark Purple */
--chatrium-alt2-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Functional Colors

```css
--chatrium-success: #10B981;  /* Green - Success states */
--chatrium-warning: #F59E0B;  /* Orange - Warnings */
--chatrium-error: #EF4444;    /* Red - Errors */
--chatrium-info: #3B82F6;     /* Blue - Information */
```

### Neutral Colors

```css
--chatrium-text: #1F2937;          /* Primary text (dark gray) */
--chatrium-text-light: #6B7280;    /* Secondary text (medium gray) */
--chatrium-bg: #F9FAFB;            /* Light background */
--chatrium-bg-dark: #111827;       /* Dark background */
--chatrium-border: #E5E7EB;        /* Borders and dividers */
--chatrium-white: #FFFFFF;         /* Pure white */
--chatrium-black: #000000;         /* Pure black */
```

## Typography

### Font Families

**Primary Font:** Inter
- Versatile, modern, excellent readability
- Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
- Usage: UI, body text, buttons

**Display Font:** Space Grotesk (for logo and large headings)
- Modern, geometric, distinctive
- Weights: Medium (500), SemiBold (600), Bold (700)
- Usage: Logo, hero headings, marketing materials

**Monospace Font:** JetBrains Mono
- Clean, developer-friendly
- Usage: Code snippets, technical documentation

### Typography Scale

```css
/* Headings */
--text-5xl: 3rem;     /* 48px - Hero */
--text-4xl: 2.25rem;  /* 36px - Page titles */
--text-3xl: 1.875rem; /* 30px - Section headings */
--text-2xl: 1.5rem;   /* 24px - Card headings */
--text-xl: 1.25rem;   /* 20px - Subheadings */
--text-lg: 1.125rem;  /* 18px - Large body */

/* Body */
--text-base: 1rem;    /* 16px - Default */
--text-sm: 0.875rem;  /* 14px - Small text */
--text-xs: 0.75rem;   /* 12px - Captions */
```

### Line Heights
- Headlines: 1.2
- Body text: 1.6
- Captions: 1.4

## Voice & Tone

### Brand Voice

Chatrium's voice is:
- **Professional yet approachable** - We're experts but never condescending
- **Clear and concise** - Technical accuracy without jargon overload
- **Innovative and forward-thinking** - Excited about AI and new technologies
- **Developer-focused** - Speaking the language of our primary audience

### Tone Guidelines

**When writing documentation:**
- Use active voice
- Be direct and instructional
- Include code examples
- Anticipate questions

**When writing marketing copy:**
- Focus on benefits, not just features
- Use concrete examples
- Avoid hyperbole
- Let the product speak for itself

**When writing error messages:**
- Be helpful and solution-oriented
- Never blame the user
- Provide next steps
- Include links to documentation when relevant

### Example Phrases

**✅ Good:**
- "Chatrium makes voice-enabled AI chat simple"
- "Build conversations that matter"
- "Integrate AI chat in minutes, not hours"
- "Voice-first design meets powerful AI"
- "Your chat widget, your rules"

**❌ Avoid:**
- "The best chat widget ever!" (too hyperbolic)
- "Revolutionary AI technology" (overused buzzword)
- "One-click solution" (oversimplification)
- "Cutting-edge innovation" (meaningless filler)

## UI Guidelines

### Spacing System
Based on 4px grid:
- 0.25rem (4px)
- 0.5rem (8px)
- 0.75rem (12px)
- 1rem (16px)
- 1.5rem (24px)
- 2rem (32px)
- 3rem (48px)
- 4rem (64px)

### Border Radius
- Small: 4px (buttons, inputs)
- Medium: 8px (cards, modals)
- Large: 12px (containers)
- Full: 9999px (pills, badges)

### Shadows

```css
/* Subtle elevation */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Card elevation */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

/* Floating elements */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Modal/Dialog */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

## Brand Applications

### In Documentation
- Always capitalize "Chatrium" at the start of sentences
- Use inline code formatting for package name: `chatrium`
- When referring to the widget component: "the Chatrium widget" or "ChatWidget component"

### In Code
```javascript
// Package name (scoped)
import { ChatWidget } from '@chatrium/widget';

// Component name (PascalCase)
<ChatWidget />

// CSS classes (kebab-case with prefix)
.chatrium-widget { }
.chatrium-button { }
```

### Package Naming
All Chatrium packages use the `@chatrium` scope:
- `@chatrium/widget`
- `@chatrium/server`
- `@chatrium/cli`
- `@chatrium/tools`

### Social Media
- **Twitter/X:** @ChatriumAI (if available)
- **GitHub Organization:** github.com/chatrium
- **GitHub Repositories:**
  - github.com/chatrium/widget
  - github.com/chatrium/server _(coming soon)_
  - github.com/chatrium/cli _(coming soon)_
- **Hashtags:** #Chatrium #AIChat #VoiceUI #MCP

## File Naming Conventions

### Logo Files
- `chatrium-logo.svg` - Full logo (vector)
- `chatrium-logo-dark.svg` - Dark background version
- `chatrium-icon.svg` - Icon only (vector)
- `chatrium-wordmark.svg` - Text only (vector)
- `chatrium-logo-{size}.png` - Raster versions (16, 32, 64, 128, 256, 512)

### Screenshots & Marketing
- `chatrium-screenshot-{feature}.png`
- `chatrium-banner-{size}.png`
- `chatrium-demo-{name}.gif`

## Version History

**Version 1.0** - October 2025
- Initial brand guidelines
- Rebranding from ai-mcp-web-app to Chatrium
- Established color palette, typography, and voice

---

## Contact

For brand inquiries or questions about these guidelines, please open an issue on GitHub or contact the maintainers.

**Last Updated:** October 27, 2025

