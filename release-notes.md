# 🎉 Release v1.4.0: Voice Input Refactoring & Bug Fixes

**Дата**: 21 октября 2025

## 🚀 Основные изменения

### 🎤 Рефакторинг голосового ввода

Голосовой ввод полностью переработан для улучшения архитектуры и надежности:

#### Новая архитектура
- **Отдельный модуль**: `src/lib/voiceInput.js` - изолированная логика распознавания речи
- **Чистый API**: `createVoiceRecognition(locale, onTranscript, onError, onRecordingChange)`
- **Методы контроля**: `start()`, `stop()`, `isSupported()`, `cleanup()`
- **Улучшенная организация кода**: ~95 строк в `ChatWidget.js` сокращены до ~40 строк

#### Основные преимущества
- ✅ Четкое разделение ответственности (separation of concerns)
- ✅ Улучшенная тестируемость
- ✅ Упрощенное управление состоянием
- ✅ Более понятная структура кода

### 🐛 Исправлена проблема дублирования голосовых сообщений

**Проблема**: Произнесенные слова дублировались при отправке

**Причина**: 
- Speech Recognition API возвращает **накопительные результаты**
- Старый код накапливал дубликаты: `buffer += transcript` 
- Пример: 1-й результат: "привет", 2-й результат: "привет мир" → buffer: "приветпривет мир" ❌

**Решение**:
```javascript
// Старый код (неправильно)
buffer += res[0].transcript; // Накапливает дубликаты

// Новый код (правильно)
buffer = ''; // Очистка
for (let i = 0; i < event.results.length; i++) {
  buffer += event.results[i][0].transcript; // Перестройка заново
}
```

**Дополнительные меры**:
- Флаг `finalDelivered` предотвращает двойную отправку в `onresult` и `onend`
- Правильная обработка финальных результатов
- Улучшенная логика доставки транскрипта

## 📦 Что нового

### Новый модуль `voiceInput.js`

```javascript
import { createVoiceRecognition } from 'ai-mcp-web-app/voiceInput';

// Создание экземпляра распознавания речи
const voiceRecognition = createVoiceRecognition(
  'en',                                    // locale
  (transcript) => console.log(transcript), // onTranscript
  (error) => console.error(error),         // onError
  (isRecording) => setState(isRecording)   // onRecordingChange
);

// Использование
voiceRecognition.start();
voiceRecognition.stop();
voiceRecognition.cleanup();
```

### Упрощенная интеграция в ChatWidget

```javascript
// До: ~95 строк сложной логики с множеством ref'ов
const isStartingRef = useRef(false);
const hasStartedRef = useRef(false);
const hasGotResultRef = useRef(false);
// ... и т.д.

// После: ~40 строк с чистым API
const voiceRecognition = createVoiceRecognition(
  locale,
  handleTranscript,
  handleError,
  handleRecordingChange
);
```

## 🔧 Технические улучшения

### Архитектура
- Изоляция voice-логики от UI-компонента
- Удалены неиспользуемые refs: `isStartingRef`, `hasStartedRef`, `hasGotResultRef`, `hasRetriedStartRef`
- Упрощена функция `toggleVoiceRecording()` (~30 строк → ~15 строк)

### Качество кода
- Лучшая организация и читаемость
- Улучшенная обработка ошибок
- Чище управление жизненным циклом компонентов
- Нет breaking changes - полностью обратно совместимо

## 📚 Обновления документации

README.md обновлен с информацией о:
- Новой архитектуре голосового ввода
- Исправлениях дублирования
- Улучшениях кода

## 🔗 Полный changelog

См. [CHANGELOG.md](https://github.com/ATsepelev/ai-mcp-web-app/blob/main/CHANGELOG.md) для детальной истории изменений.

## 📦 Установка

```bash
npm install ai-mcp-web-app@1.4.0
```

## 🎯 Рекомендации по обновлению

### Для пользователей виджета
- ✅ **Обновление безопасное** - нет breaking changes
- ✅ **Просто обновите версию** в package.json
- ✅ **Все работает как раньше**, только надежнее

### Для разработчиков, модифицирующих код
- Если вы использовали внутренние refs (`isStartingRef` и т.д.) - они удалены
- Voice-логика теперь в отдельном модуле `voiceInput.js`
- API остался прежним, реализация улучшена

## 🐛 Известные проблемы

Нет известных проблем в этом релизе.

---

## 📋 История релизов v1.3.x - v1.4.0

### v1.4.0 (текущий)
- Рефакторинг голосового ввода
- Исправление дублирования сообщений
- Улучшение архитектуры кода

### v1.3.2
- Оптимизация размера пакета (98% уменьшение)
- js-tiktoken стал опциональным

### v1.3.1
- Управление размером контекста (maxContextSize)
- Точный подсчет токенов с tiktoken

---

## 💬 Поддержка

- **Issues**: [GitHub Issues](https://github.com/ATsepelev/ai-mcp-web-app/issues)
- **Документация**: [README.md](https://github.com/ATsepelev/ai-mcp-web-app#readme)

Спасибо за использование ai-mcp-web-app! 🚀
