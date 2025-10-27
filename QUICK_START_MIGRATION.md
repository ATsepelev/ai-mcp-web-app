# 🚀 Quick Start: Миграция на Chatrium

## ✅ Готово к публикации!

- ✅ Организации созданы (GitHub + NPM)
- ✅ package.json обновлен (`@chatrium/widget`)
- ✅ package-lock.json обновлен
- ✅ Сборка успешна (`npm run build`)
- ✅ Логотипы созданы
- ✅ Документация обновлена

## 📋 Следующие шаги (выполнить по порядку)

### 1. Создать GitHub репозиторий

Перейти на: https://github.com/organizations/chatrium/repositories/new

**Настройки:**
- Repository name: `widget`
- Description: `Chatrium Widget - A modern chat widget with voice input and MCP integration for AI assistants`
- Public
- ❌ НЕ инициализировать с README (у нас уже есть)

### 2. Запушить код

```bash
# Добавить новый remote
git remote add chatrium https://github.com/chatrium/widget.git

# Запушить код
git push chatrium main

# Запушить теги (если есть)
git push chatrium --tags
```

**Альтернатива:** Если хотите перенести существующий репозиторий:
1. Settings → Danger Zone → Transfer
2. New owner: `chatrium`
3. New name: `widget`

### 3. Настроить GitHub репозиторий

В настройках `chatrium/widget`:

**About (правый сайдбар):**
- Description: "Chatrium Widget - Your space for AI conversations"
- Website: https://www.npmjs.com/package/@chatrium/widget
- Topics: `chatrium`, `chat-widget`, `ai`, `mcp`, `voice-input`, `react`, `conversational-ai`

**Settings → General:**
- ✅ Issues
- ✅ Discussions (рекомендуется)
- ❌ Projects (опционально)
- ❌ Wiki (опционально)

### 4. Опубликовать на NPM

```bash
# Логин (если не залогинены)
npm login

# Проверка package.json
cat package.json | grep -A 3 '"name"'
# Должно показать: "name": "@chatrium/widget"

# DRY RUN (проверка что будет опубликовано)
npm publish --dry-run --access public

# ПУБЛИКАЦИЯ
npm publish --access public
```

**Примечание:** Флаг `--access public` обязателен для scoped packages!

### 5. Проверка публикации

```bash
# Проверить что пакет доступен
npm view @chatrium/widget

# Установить в тестовом проекте
mkdir test-chatrium
cd test-chatrium
npm init -y
npm install @chatrium/widget

# Проверить версию
npm list @chatrium/widget
```

### 6. Пометить старый пакет как deprecated

**⚠️ ВАЖНО: Делать ПОСЛЕ публикации нового пакета!**

```bash
# Deprecate старый пакет
npm deprecate ai-mcp-web-app "Package renamed to @chatrium/widget. Install new package: npm install @chatrium/widget"
```

### 7. Обновить старый репозиторий

В репозитории `ATsepelev/ai-mcp-web-app`:

1. **Добавить в начало README.md:**

```markdown
# ⚠️ DEPRECATED - See [@chatrium/widget](https://github.com/chatrium/widget)

> **This package has been renamed and moved to [@chatrium/widget](https://github.com/chatrium/widget)**
> 
> Please migrate to the new package for continued updates and support.
> 
> [Migration Guide →](https://github.com/chatrium/widget#migration)

---
```

2. **Создать pinned issue:**
   - Title: "📢 Package Renamed to @chatrium/widget - Migration Required"
   - Body: Скопировать из MIGRATION_PLAN.md раздел "Создать GitHub Issue"
   - Pin to top

3. **Добавить topics:**
   - `deprecated`
   - `moved-to-chatrium`

### 8. Создать GitHub Release

В новом репозитории `chatrium/widget`:

**Вариант A: Через UI**
1. Releases → Draft a new release
2. Tag: `v3.0.0`
3. Title: `v3.0.0: Rebranding to Chatrium Widget + Ecosystem Launch`
4. Description: Вставить содержимое из `RELEASE_NOTES_v3.0.0.md`
5. ✅ Set as the latest release

**Вариант B: Через PowerShell скрипт**
```powershell
.\create-github-release.ps1
```

### 9. Анонсы (опционально)

**GitHub Discussion:**
- Title: "🎉 Welcome to Chatrium!"
- Category: Announcements
- Body: Из MIGRATION_PLAN.md

**Social Media:**
```
🚀 Big News: ai-mcp-web-app is now Chatrium!

We've rebranded and launched an ecosystem for AI conversation tools.

✨ @chatrium/widget - React chat widget
🔮 Coming: server, cli, tools packages

📦 npm install @chatrium/widget
🔗 github.com/chatrium/widget

#AI #React #OpenSource #ChatBot
```

## 🎯 Проверочный список

После выполнения всех шагов:

- [ ] `@chatrium/widget` доступен на npm
- [ ] `chatrium/widget` репозиторий активен
- [ ] Старый пакет показывает deprecation warning
- [ ] README старого репозитория обновлен
- [ ] GitHub Release v3.0.0 создан
- [ ] Тестовая установка работает: `npm install @chatrium/widget`

## 📞 Помощь

Если что-то пошло не так:

1. **NPM публикация не работает:**
   ```bash
   npm whoami  # Проверить логин
   npm org ls chatrium  # Проверить доступ
   ```

2. **GitHub push не работает:**
   ```bash
   git remote -v  # Проверить remotes
   git remote set-url chatrium https://github.com/chatrium/widget.git
   ```

3. **Пакет не виден после публикации:**
   - Подождите 1-2 минуты (NPM кэширование)
   - Проверьте: https://www.npmjs.com/package/@chatrium/widget

---

**Время на всё:** ~20-30 минут

Удачи! 🚀

