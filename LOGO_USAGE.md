# Chatrium Logo Usage Guide

## Available Logo Files

### 1. **logo.svg** - Full Logo (Horizontal)
- **Size:** 240x70px
- **Usage:** Main logo for documentation, websites, presentations
- **Contains:** Icon + Text + Tagline
- **Background:** Light backgrounds

### 2. **logo-dark.svg** - Full Logo for Dark Backgrounds
- **Size:** 240x70px
- **Usage:** Dark mode websites, dark presentations
- **Contains:** Icon + Text + Tagline (lighter colors)
- **Background:** Dark backgrounds

### 3. **logo-icon.svg** - Icon Only
- **Size:** 64x64px
- **Usage:** Favicons, app icons, social media avatars
- **Contains:** Icon only (hexagon with waves)
- **Scalable:** Works from 16px to any size

### 4. **logo-wordmark.svg** - Text Only
- **Size:** 180x40px
- **Usage:** Compact headers, footers, badges
- **Contains:** "CHATRIUM" text with gradient
- **Background:** Any (has no icon)

## Logo Features

### Design Elements

**Hexagon Symbol:**
- Represents a "space" or "room" for conversations
- Gradient from Blue (#2563EB) to Purple (#7C3AED)
- Inner glow effect for depth
- Subtle shadow for professional look

**Wave Pattern:**
- Six waves (3 left, 3 right)
- Represents voice/audio and dialogue
- Varying opacity (0.6, 0.8, 1.0) for depth
- Smooth curves with rounded caps

**Typography:**
- Font: Space Grotesk (bold, 600 weight)
- Letter spacing: 0.5px for readability
- Tagline: Inter (regular, subtle)

### Color Specifications

**Primary Gradient:**
```css
linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)
```

**Colors:**
- Blue: `#2563EB` (rgb 37, 99, 235)
- Purple: `#7C3AED` (rgb 124, 58, 237)
- Text (light): `#1F2937`
- Text (dark): `#F9FAFB`
- Tagline: `#6B7280` / `#D1D5DB`

## Usage Guidelines

### Minimum Sizes

- **Full Logo:** 120px width minimum
- **Icon Only:** 16px minimum (favicon)
- **Wordmark:** 80px width minimum

### Clear Space

Maintain clear space around logo equal to height of hexagon (approximately 50px for full logo).

```
    [space]
[space] LOGO [space]
    [space]
```

### Dos ✅

- Use provided SVG files for best quality
- Maintain aspect ratio when scaling
- Use logo-dark.svg on dark backgrounds
- Use icon for small spaces (< 120px width)
- Center logo when standalone

### Don'ts ❌

- Don't rotate or skew the logo
- Don't change the gradient colors
- Don't add effects (drop shadows, glows, etc.)
- Don't place on busy backgrounds without proper contrast
- Don't stretch or distort the proportions
- Don't recreate or modify the logo

## File Formats

### Current

- **SVG** - Vector format, scalable, preferred for web and print

### Coming Soon (Generate from SVG)

- **PNG** - 16x16, 32x32, 64x64, 128x128, 256x256, 512x512
- **ICO** - Multi-resolution favicon
- **PDF** - Print-ready vector format

## Integration Examples

### HTML

```html
<!-- Full logo -->
<img src="logo.svg" alt="Chatrium" width="240" height="70">

<!-- Icon only -->
<img src="logo-icon.svg" alt="Chatrium" width="64" height="64">

<!-- Dark background -->
<div style="background: #1F2937;">
  <img src="logo-dark.svg" alt="Chatrium" width="240" height="70">
</div>
```

### Markdown

```markdown
![Chatrium](./logo.svg)
```

### React

```jsx
import logo from './logo.svg';

function Header() {
  return <img src={logo} alt="Chatrium" width={240} height={70} />;
}
```

## Background Recommendations

### Light Backgrounds ✅
- White (#FFFFFF)
- Light Gray (#F9FAFB, #F3F4F6)
- Light Blue (#EFF6FF)
- Use: **logo.svg**

### Dark Backgrounds ✅
- Black (#000000)
- Dark Gray (#1F2937, #111827)
- Dark Blue (#1E3A8A)
- Use: **logo-dark.svg**

### Busy Backgrounds ⚠️
If you must use logo on photos or patterns:
- Add solid background behind logo
- Use white/dark backdrop with 80% opacity
- Ensure sufficient contrast
- Add subtle border if needed

## Favicon Implementation

```html
<!-- In <head> section -->
<link rel="icon" type="image/svg+xml" href="/logo-icon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/logo-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/logo-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/logo-180.png">
```

## Social Media Specifications

### Profile Images
- **File:** logo-icon.svg or logo-icon.png
- **Twitter:** 400x400px
- **Facebook:** 180x180px
- **LinkedIn:** 300x300px
- **GitHub:** 512x512px

### Cover Images
- Use full logo (logo.svg)
- Ensure proper sizing for each platform
- Maintain clear space

## Questions?

For logo-related questions or custom requirements, please open an issue at:
https://github.com/chatrium/widget/issues

---

**Last Updated:** October 27, 2025  
**Version:** 3.0.0

