# MCP Resources Specification Compliance Report

**Дата:** 22 октября 2025  
**Спецификация:** MCP 2025-06-18  
**Ссылка:** https://modelcontextprotocol.io/specification/2025-06-18/server/resources

---

## ✅ Выполненные изменения

### 1. ✅ Capabilities Format (КРИТИЧНО)

**Было:**
```javascript
capabilities: ["tools", "resources"]  // массив (неправильно)
```

**Стало:**
```javascript
capabilities: {
  tools: {},
  resources: {
    subscribe: false,      // subscriptions not implemented yet
    listChanged: false     // list change notifications not implemented yet
  }
}
```

**Файлы:**
- `src/lib/mcp_core.js` - `MCPServer.setupProtocolHandlers()` (line 169-176)
- `src/lib/mcp_core.js` - `MCPClient.initialize()` (line 357-360)

---

### 2. ✅ Resource Descriptor Fields

**Добавлены обязательные поля по спеке:**
- ✅ `title` - human-readable название для UI (было только `name`)
- ✅ `size` - размер ресурса в байтах (опционально)

**Было:**
```javascript
{
  uri: "resource://example/catalog",
  name: "Product Catalog",
  description: "...",
  mimeType: "application/json"
}
```

**Стало:**
```javascript
{
  uri: "resource://example/product-catalog",
  name: "product-catalog",              // ID/slug
  title: "Product Catalog",             // ← NEW: Display name
  description: "...",
  mimeType: "application/json",
  size: undefined,                      // ← NEW: Optional size in bytes
  annotations: { ... }
}
```

**Файлы:**
- `src/lib/mcp_core.js` - `registerResource()` (line 343, 346)
- `src/lib/mcp_core.js` - `resources/list` handler (line 218, 221)
- `src/lib/mcp_core.js` - `mcp.resources.list` handler (line 232, 235)
- `src/lib/useMCPClient.js` - resource merge logic (line 160, 163)
- `src/lib/useMCPServer.js` - resource registration (line 31, 34)

---

### 3. ✅ Annotations - `lastModified` Field

**Добавлено обязательное поле `lastModified` по спеке:**

**Было:**
```javascript
annotations: {
  audience: ["user", "assistant"],
  priority: 0.8,
  cachePolicy: "static"  // наше расширение
}
```

**Стало:**
```javascript
annotations: {
  audience: ["user", "assistant"],
  priority: 0.8,
  cachePolicy: "static",
  lastModified: "2025-01-15T10:00:00Z"  // ← NEW: ISO 8601 timestamp
}
```

**Для динамических ресурсов:**
```javascript
annotations: {
  cachePolicy: "dynamic",
  lastModified: new Date().toISOString()  // всегда текущее время
}
```

**Файлы:**
- `consumer/src/mcp_resources_en.js` - все ресурсы (lines 222, 236, 250, 266, 280, 294, 308)
- `src/examples/mcp_resources_en.js` - все ресурсы (аналогично)

---

### 4. ✅ Resource Contents Response

**Добавлены поля `name` и `title` в response:**

**Было:**
```javascript
{
  contents: [{
    uri: "resource://example/catalog",
    mimeType: "application/json",
    text: "..."
  }]
}
```

**Стало:**
```javascript
{
  contents: [{
    uri: "resource://example/product-catalog",
    name: "product-catalog",      // ← NEW
    title: "Product Catalog",     // ← NEW
    mimeType: "application/json",
    text: "..."                   // or blob: "base64..."
  }]
}
```

**Файл:**
- `src/lib/mcp_core.js` - `resources/read` handler (lines 257-258)

---

### 5. ✅ Binary Data Support

**Добавлена поддержка `blob` для бинарных данных:**

```javascript
// Определение типа данных в resources/read handler
if (typeof data === 'string') {
  content.text = data;
} else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
  // Binary data: encode as base64
  content.blob = btoa(String.fromCharCode(...new Uint8Array(data)));
} else {
  // Object/JSON: stringify
  content.text = JSON.stringify(data, null, 2);
}
```

**Файл:**
- `src/lib/mcp_core.js` - `resources/read` handler (lines 263-271)

---

### 6. ✅ Spec-Compliant Error Codes

**Обновлены коды ошибок по спеке:**

**Было:**
```javascript
throw { code: 4004, message: "Resource not found" };
```

**Стало:**
```javascript
throw { 
  code: -32002,                     // Spec error code
  message: "Resource not found", 
  data: { uri } 
};
```

**Файл:**
- `src/lib/mcp_core.js` - `resources/read` handler (lines 247-250, 276-279)

---

## 📊 Совместимость со спецификацией MCP 2025-06-18

### ✅ Полностью реализовано

| Фича | Статус | Детали |
|------|--------|--------|
| Capabilities format | ✅ | Правильный формат объекта с вложенными capabilities |
| Resource descriptor fields | ✅ | `uri`, `name`, `title`, `description`, `mimeType`, `size` |
| Resource contents | ✅ | `uri`, `name`, `title`, `mimeType`, `text`/`blob` |
| Annotations | ✅ | `audience`, `priority`, `lastModified` + кастомный `cachePolicy` |
| Text content support | ✅ | `text` field для текстовых данных |
| Binary content support | ✅ | `blob` field для бинарных данных (base64) |
| Error codes | ✅ | `-32002` (not found), `-32603` (internal error) |
| Legacy methods | ✅ | `mcp.resources.list` и `mcp.resources.read` |
| Spec methods | ✅ | `resources/list` и `resources/read` |

### ⚠️ Частично реализовано / Запланировано

| Фича | Статус | Детали |
|------|--------|--------|
| Pagination | ⚠️ | `cursor` и `nextCursor` не реализованы |
| Resource Templates | 📋 | `resources/templates/list` не реализовано |
| List Changed Notifications | 📋 | `notifications/resources/list_changed` не реализовано |
| Subscriptions | 📋 | `resources/subscribe`, `resources/unsubscribe` не реализованы |
| Update Notifications | 📋 | `notifications/resources/updated` не реализовано |

### 🎯 Кастомные расширения

| Расширение | Назначение | Совместимость |
|-----------|-----------|---------------|
| `cachePolicy` | Различение static/dynamic ресурсов | ✅ Не конфликтует со спекой |
| Legacy URIs | Поддержка `id_uri` для внешних серверов | ✅ Обратная совместимость |

---

## 📁 Измененные файлы

### Core Protocol
1. **`src/lib/mcp_core.js`**
   - Capabilities format (lines 169-176, 357-360)
   - Resource descriptor fields (lines 218, 221, 232, 235, 257-258, 343, 346)
   - Binary data support (lines 265-267)
   - Error codes (lines 247, 276)

### Hooks
2. **`src/lib/useMCPClient.js`**
   - Resource merge logic with `title` and `size` (lines 160, 163, 165)

3. **`src/lib/useMCPServer.js`**
   - Resource registration with all spec fields (lines 31, 34, 35)

### Example Resources
4. **`consumer/src/mcp_resources_en.js`**
   - Обновлены все 7 ресурсов (static + dynamic)
   - Добавлены `name`, `title`, `lastModified`

5. **`src/examples/mcp_resources_en.js`**
   - Обновлены все 7 ресурсов
   - Добавлены `name`, `title`, `lastModified`

---

## 🔧 Ключевые улучшения

### 1. Правильная семантика полей

**`name`** → ID/slug (machine-readable)  
**`title`** → Human-readable название для UI  
**`description`** → Подробное описание

**Пример:**
```javascript
{
  name: "product-catalog",           // для кода
  title: "Product Catalog",          // для UI
  description: "List of available products..."  // для AI
}
```

### 2. Правильная работа с annotations

Все три стандартных поля + наш кастомный:
- `audience` - для кого ресурс (user/assistant)
- `priority` - важность (0.0-1.0)
- `lastModified` - когда обновлен (ISO 8601)
- `cachePolicy` - как кешировать (static/dynamic) ← наш

### 3. Поддержка бинарных данных

Теперь ресурсы могут возвращать:
- **Текст:** `{ text: "..." }`
- **JSON:** `{ text: '{"key": "value"}' }`
- **Бинарные данные:** `{ blob: "base64encodeddata" }`

---

## ✅ Результат

Наша реализация **полностью соответствует** базовой спецификации MCP Resources 2025-06-18:

✅ Правильный format capabilities  
✅ Все обязательные поля ресурсов  
✅ Spec-compliant annotations  
✅ Поддержка text и blob contents  
✅ Правильные коды ошибок  
✅ Обратная совместимость с legacy методами  

📋 Расширенные фичи (templates, subscriptions, pagination) опциональны и могут быть добавлены в будущем.

---

## 📝 Миграция

Для обновления существующих ресурсов:

```javascript
// СТАРЫЙ формат (работал, но не по спеке)
{
  uri: "resource://app/catalog",
  name: "Product Catalog",  // использовалось как title
  description: "...",
  mimeType: "application/json",
  handler: getCatalog
}

// НОВЫЙ формат (spec-compliant)
{
  uri: "resource://app/product-catalog",
  name: "product-catalog",              // ← ID/slug
  title: "Product Catalog",             // ← Display name
  description: "...",
  mimeType: "application/json",
  size: undefined,                      // ← Optional
  annotations: {
    audience: ["user", "assistant"],
    priority: 0.8,
    cachePolicy: "static",
    lastModified: "2025-01-15T10:00:00Z"  // ← Required
  },
  handler: getCatalog
}
```

---

**Статус:** ✅ Все изменения применены и протестированы  
**Linter:** ✅ Нет ошибок  
**Обратная совместимость:** ✅ Сохранена

