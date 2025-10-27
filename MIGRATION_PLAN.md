# План миграции на Chatrium

## 📋 Checklist миграции

### 1. GitHub Organization Setup ✅ (Выполнено)

- [x] Создана организация `chatrium`
- [ ] Создан репозиторий `chatrium/widget`
- [ ] Настроены права доступа
- [ ] Добавлено описание и topics

### 2. Подготовка кода

```bash
# 1. Обновить package-lock.json
npm install

# 2. Тестовая сборка
npm run build

# 3. Проверка dist/
ls -la dist/
```

### 3. Создание нового репозитория

**Вариант A: Создать новый репозиторий и запушить код**

```bash
# Создать новый репозиторий на GitHub: chatrium/widget

# Добавить новый remote
git remote add chatrium https://github.com/chatrium/widget.git

# Запушить код
git push chatrium main

# Опционально: создать ветки
git push chatrium --all
git push chatrium --tags
```

**Вариант B: Перенос существующего репозитория**

1. Зайти в Settings старого репозитория
2. В разделе "Danger Zone" нажать "Transfer"
3. Перенести в организацию `chatrium`
4. Переименовать репозиторий в `widget`

### 4. NPM Organization Setup ✅ (Выполнено)

- [x] Создана организация `@chatrium`
- [ ] Настроены права публикации
- [ ] Добавлены maintainers

### 5. Публикация на NPM

```bash
# 1. Логин в npm
npm login

# 2. Проверка, что организация доступна
npm org ls chatrium

# 3. Dry-run публикации
npm publish --dry-run --access public

# 4. Публикация
npm publish --access public

# 5. Проверка
npm view @chatrium/widget
```

### 6. Обновление старого репозитория (ATsepelev/ai-mcp-web-app)

#### 6.1 Создать файл DEPRECATION_NOTICE.md

```markdown
# ⚠️ This package has been renamed to @chatrium/widget

This repository and npm package (`ai-mcp-web-app`) have been **deprecated** 
and will no longer receive updates.

## 🎉 New Location

- **New name:** `@chatrium/widget`
- **New repository:** https://github.com/chatrium/widget
- **New npm package:** https://www.npmjs.com/package/@chatrium/widget

## 📦 Migration Guide

Uninstall the old package:
\`\`\`bash
npm uninstall ai-mcp-web-app
\`\`\`

Install the new package:
\`\`\`bash
npm install @chatrium/widget
\`\`\`

Update imports:
\`\`\`javascript
// Before
import { ChatWidget } from "ai-mcp-web-app";

// After
import { ChatWidget } from "@chatrium/widget";
\`\`\`

## 📚 Full Documentation

See the [migration guide](https://github.com/chatrium/widget#migration-from-v2) 
for complete instructions.
```

#### 6.2 Обновить README.md (добавить в начало)

```markdown
# ⚠️ DEPRECATED - See [@chatrium/widget](https://github.com/chatrium/widget)

> **This package has been renamed and moved to [@chatrium/widget](https://github.com/chatrium/widget)**
> 
> Please migrate to the new package for continued updates and support.
> 
> [Migration Guide →](https://github.com/chatrium/widget#migration-from-v2)

---

[Original README content below...]
```

#### 6.3 Создать GitHub Issue с уведомлением

**Title:** "Package Renamed to @chatrium/widget - Migration Required"

**Body:**
```markdown
# 📢 Important Announcement: Package Renamed

This package has been renamed and is now part of the **Chatrium** ecosystem.

## What Changed

- **Old:** `ai-mcp-web-app`
- **New:** `@chatrium/widget`
- **New Organization:** https://github.com/chatrium

## Why?

We've rebranded to **Chatrium** to better reflect our vision of creating 
a family of AI conversation tools. This is the first step in building 
a comprehensive ecosystem.

## Migration Required

Please update your dependencies:

\`\`\`bash
npm uninstall ai-mcp-web-app
npm install @chatrium/widget
\`\`\`

And update your imports:

\`\`\`javascript
import { ChatWidget } from "@chatrium/widget";
\`\`\`

## Resources

- 📦 New NPM Package: https://www.npmjs.com/package/@chatrium/widget
- 📖 Documentation: https://github.com/chatrium/widget
- 🔄 Migration Guide: https://github.com/chatrium/widget#migration-from-v2
- 📋 Changelog: https://github.com/chatrium/widget/blob/main/CHANGELOG.md

## Support

This repository will remain accessible but will not receive updates. 
Please migrate to the new package for continued support and new features.

For questions, please open an issue in the new repository: 
https://github.com/chatrium/widget/issues
```

Pin this issue to the top.

#### 6.4 Добавить deprecation warning в package.json

```json
{
  "name": "ai-mcp-web-app",
  "version": "2.0.1",
  "deprecated": "This package has been renamed to @chatrium/widget. Please update your dependencies.",
  ...
}
```

#### 6.5 Опубликовать последнюю версию с deprecation

```bash
cd старый-репозиторий
npm version patch
npm publish
```

После публикации пользователи увидят:
```
npm WARN deprecated ai-mcp-web-app@2.0.1: This package has been renamed to @chatrium/widget. Please update your dependencies.
```

### 7. NPM Deprecation

После публикации нового пакета, пометить старый как deprecated:

```bash
npm deprecate ai-mcp-web-app "Package renamed to @chatrium/widget - please migrate: npm install @chatrium/widget"
```

Это добавит warning при установке старого пакета.

### 8. Обновление документации в новом репозитории

#### 8.1 README.md (добавить секцию миграции)

```markdown
## Migrating from ai-mcp-web-app

If you're upgrading from the old `ai-mcp-web-app` package:

1. **Uninstall old package:**
   \`\`\`bash
   npm uninstall ai-mcp-web-app
   \`\`\`

2. **Install new package:**
   \`\`\`bash
   npm install @chatrium/widget
   \`\`\`

3. **Update imports:**
   \`\`\`javascript
   // Before
   import { ChatWidget, useMCPServer } from "ai-mcp-web-app";
   
   // After
   import { ChatWidget, useMCPServer } from "@chatrium/widget";
   \`\`\`

4. **Done!** No code changes needed - the API is 100% compatible.

See [CHANGELOG.md](./CHANGELOG.md) for full details.
```

### 9. Создание GitHub Release v3.0.0

```bash
# В новом репозитории
git tag -a v3.0.0 -m "v3.0.0: Rebranding to Chatrium Widget + Ecosystem Launch"
git push chatrium v3.0.0

# Или использовать PowerShell скрипт
.\create-github-release.ps1
```

### 10. Анонсы и коммуникация

#### 10.1 GitHub Discussions (в новом репозитории)

**Title:** "🎉 Welcome to Chatrium!"

**Body:**
```markdown
# Welcome to Chatrium! 🎉

We're excited to announce the rebranding of `ai-mcp-web-app` to **Chatrium**!

## What is Chatrium?

Chatrium is now a **family of AI conversation tools**. This package 
(`@chatrium/widget`) is the first in a growing ecosystem.

## Coming Soon

- `@chatrium/server` - Backend MCP server
- `@chatrium/cli` - Development tools
- `@chatrium/tools` - Reusable tool library

## Resources

- 📦 [NPM Package](https://www.npmjs.com/package/@chatrium/widget)
- 📖 [Documentation](https://github.com/chatrium/widget)
- 🎨 [Brand Guidelines](./BRAND_GUIDELINES.md)

Feel free to ask questions or share feedback!
```

#### 10.2 Social Media / Dev.to / Reddit

```markdown
🚀 Excited to announce: ai-mcp-web-app is now **Chatrium**!

We've rebranded and created an ecosystem for AI conversation tools.

✨ What's new:
- New name: @chatrium/widget
- GitHub organization: github.com/chatrium
- Ecosystem approach with future packages planned

📦 Migration is simple:
npm install @chatrium/widget

🔗 Learn more: github.com/chatrium/widget

#AI #ChatBot #React #JavaScript #OpenSource
```

## 🔄 Последовательность действий (Step-by-Step)

### День 1: Подготовка

1. ✅ Создать организации (GitHub + NPM) - **Выполнено**
2. [ ] Обновить package-lock.json (`npm install`)
3. [ ] Тестовая сборка (`npm run build`)
4. [ ] Проверить все тесты
5. [ ] Создать репозиторий `chatrium/widget`

### День 2: Миграция кода

6. [ ] Запушить код в новый репозиторий
7. [ ] Настроить GitHub Pages / Wiki (опционально)
8. [ ] Добавить topics и описание
9. [ ] Настроить branch protection rules
10. [ ] Добавить GitHub Actions (если нужны)

### День 3: NPM публикация

11. [ ] Dry-run публикации
12. [ ] Публикация `@chatrium/widget@3.0.0`
13. [ ] Проверка установки: `npm install @chatrium/widget`
14. [ ] Тест в тестовом проекте

### День 4: Deprecation старого пакета

15. [ ] Обновить README в старом репозитории (добавить deprecation notice)
16. [ ] Создать DEPRECATION_NOTICE.md
17. [ ] Создать и закрепить GitHub Issue с анонсом
18. [ ] Опубликовать v2.0.1 с deprecation в package.json
19. [ ] npm deprecate старого пакета

### День 5: Коммуникация и релиз

20. [ ] Создать GitHub Release v3.0.0
21. [ ] Создать GitHub Discussion с приветствием
22. [ ] Опубликовать анонсы (Twitter, Dev.to, Reddit)
23. [ ] Обновить личные профили со ссылкой на новый проект

## 📊 Проверочный список после миграции

- [ ] NPM пакет `@chatrium/widget` доступен
- [ ] Старый пакет помечен как deprecated
- [ ] GitHub репозиторий `chatrium/widget` активен
- [ ] README в старом репозитории содержит уведомление
- [ ] Документация обновлена
- [ ] Примеры работают с новым пакетом
- [ ] Yalc работает локально (`npm run yalc:publish`)
- [ ] GitHub Release создан
- [ ] Анонсы опубликованы

## 🆘 Troubleshooting

### NPM публикация не работает

```bash
# Проверить логин
npm whoami

# Проверить доступ к организации
npm org ls chatrium

# Проверить permissions
npm access ls-packages @chatrium
```

### GitHub permissions

```bash
# Проверить remote
git remote -v

# Обновить remote URL
git remote set-url origin https://github.com/chatrium/widget.git
```

### Пользователи не видят deprecation

- Нужно время - npm кэширует данные
- Пользователи должны запустить `npm install` или `npm update`
- Warning появляется только при новой установке

---

**Готов к миграции!** 🚀

