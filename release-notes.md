# 🎉 Release v1.3.2: Package Size Optimization

**Дата**: 17 октября 2025

## 🚀 Основные изменения

### ⚡ Оптимизация размера пакета (~98% уменьшение!)

- **Размер пакета**: 15.7 MB → 305.6 KB (**51× меньше!**)
- **Распакованный размер**: 34.9 MB → 1.2 MB (**29× меньше!**)

## 📦 Что нового

### Опциональный tiktoken для точного подсчёта токенов

`js-tiktoken` теперь является опциональной зависимостью:

**Базовая установка (легковесная):**
```bash
npm install ai-mcp-web-app
```
- Размер: ~300 KB
- Подсчёт токенов: приблизительный (~3.5 символов = 1 токен)
- Точность: ~85-90%

**С точным подсчётом токенов:**
```bash
npm install ai-mcp-web-app js-tiktoken
```
- Размер: ~21 MB
- Подсчёт токенов: точный (cl100k_base encoding)
- Точность: 100%

### Интеллектуальный fallback

Виджет автоматически определяет наличие tiktoken и выбирает режим подсчёта:
- ✅ **Tiktoken установлен**: точный подсчёт токенов
- ✅ **Tiktoken НЕ установлен**: приблизительный подсчёт (формула: символы ÷ 3.5)

## 🔧 Технические детали

- Dual-mode token counting: accurate (with tiktoken) or approximate (without)
- Console info message when using approximate counting
- No breaking changes - fully backward compatible
- Context management works in both modes

## 📚 Документация

Обновлена документация в README с информацией о выборе между точностью и размером пакета.

## 🐛 Исправления

- Maintained all functionality from v1.3.1
- System messages properly filtered from UI
- System message always preserved in first position

## 🔗 Полный changelog

См. [CHANGELOG.md](https://github.com/ATsepelev/ai-mcp-web-app/blob/main/CHANGELOG.md) для детальной истории изменений.

## 📦 Установка

```bash
npm install ai-mcp-web-app@1.3.2
```

## 🎯 Рекомендации

- **Для большинства проектов**: используйте без tiktoken (приблизительный подсчёт достаточно точен для управления контекстом)
- **Для критичных приложений**: установите tiktoken дополнительно для 100% точности
- **Hybrid подход**: начните без tiktoken, добавьте позже при необходимости

---

## 📋 Что включено в v1.3.1-1.3.2

### Context Size Management (v1.3.1)
- New `maxContextSize` parameter (default: 32000 tokens)
- Automatic message exclusion when context limit exceeded
- Visual indicators for excluded messages
- Localized tooltips (EN/RU/ZH)
- System message always preserved

### Package Size Optimization (v1.3.2)
- Made js-tiktoken optional
- Added approximate token counting fallback
- 98% package size reduction

