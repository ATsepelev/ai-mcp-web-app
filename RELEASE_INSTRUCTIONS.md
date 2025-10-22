# How to Create GitHub Release for v1.5.0

## Quick Steps

1. **Go to GitHub Releases:**
   - Navigate to https://github.com/ATsepelev/ai-mcp-web-app/releases/new
   - Or click "Releases" → "Draft a new release"

2. **Select Tag:**
   - Choose tag: `v1.5.0` (already pushed)
   - Or type `v1.5.0` if not visible

3. **Fill Release Information:**
   - **Release title:** `v1.5.0: MCP Resources Support`
   - **Description:** Copy content from `release-notes-v1.5.0.md`

4. **Publish:**
   - Click "Publish release"

---

## Alternative: Using GitHub CLI

If you want to install GitHub CLI for future releases:

```bash
# Install GitHub CLI (Windows)
winget install --id GitHub.cli

# Or download from: https://cli.github.com/

# Then create release:
gh release create v1.5.0 --title "v1.5.0: MCP Resources Support" --notes-file release-notes-v1.5.0.md
```

---

## What's Already Done

✅ Version updated to 1.5.0 in `package.json`  
✅ CHANGELOG.md updated with v1.5.0 changes  
✅ README.md updated with MCP Resources documentation  
✅ Git commit created and pushed  
✅ Git tag `v1.5.0` created and pushed  
✅ npm package published to registry  
✅ Release notes prepared in `release-notes-v1.5.0.md`

## What's Left

🔲 Create GitHub Release (manual step via web UI)

---

After creating the release, you can delete these temporary files:
- `RELEASE_INSTRUCTIONS.md`
- `release-notes-v1.5.0.md`

