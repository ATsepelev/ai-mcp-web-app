# Критическая проблема: Бесконечные попытки переподключения

## 🔴 Проблемы

### 1. Бесконечные попытки переподключения без остановки

**WebSocket (`mcp_core.js` строки 643-646):**
```javascript
this.ws.onclose = () => {
  this.connecting = false;
  setTimeout(() => this._connect(), this.backoffMs);  // ← БЕСКОНЕЧНО!
  this.backoffMs = Math.min(this.backoffMs * 2, this.maxBackoffMs);
};
```

**SSE (`mcp_core.js` строки 766-770):**
```javascript
this.eventSource.onerror = () => {
  try { this.eventSource.close(); } catch (e) { /* no-op */ }
  setTimeout(() => this._openEventStream(), this.backoffMs);  // ← БЕСКОНЕЧНО!
  this.backoffMs = Math.min(this.backoffMs * 2, this.maxBackoffMs);
};
```

**Проблема:** Нет флага `shouldReconnect` или метода `disconnect()` для остановки.

### 2. Нет cleanup в useEffect

**`useMCPClient.js` строки 249-251:**
```javascript
return () => {
  // Cleanup if needed  // ← ПУСТОЙ CLEANUP!
};
```

**Проблема:** При unmount компонента или изменении зависимостей:
- Старые клиенты не отключаются
- WebSocket/SSE продолжают переподключаться в фоне
- Создаются новые клиенты параллельно со старыми

### 3. useEffect перезапускается при изменении пропсов

**Зависимости (строка 252):**
```javascript
}, [mcpServers, envVars, allowedTools, blockedTools, externalServers]);
```

Если пропсы меняются (например, `allowedTools` обновляется при вводе текста из-за нестабильной ссылки):
1. Старый useEffect cleanup вызывается (но не делает ничего!)
2. Создаются НОВЫЕ клиенты
3. Старые клиенты продолжают переподключаться
4. **Результат:** Экспоненциальный рост числа активных клиентов

## 🔧 Решение

### Шаг 1: Добавить флаг и методы в клиенты

```javascript
class MCPWebSocketClient extends MCPExternalBaseClient {
  constructor(url, options = {}) {
    super(options);
    this.url = url;
    this.options = options;
    this.ws = null;
    this.connecting = false;
    this.shouldReconnect = true;  // ← НОВОЕ
    this.backoffMs = 500;
    this.maxBackoffMs = 8000;
    this.queue = [];
    this.sessionId = options.sessionId || null;
    this._connect();
  }

  disconnect() {  // ← НОВЫЙ МЕТОД
    this.shouldReconnect = false;
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) { /* no-op */ }
      this.ws = null;
    }
    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests.entries()) {
      pending.reject(new Error('Client disconnected'));
    }
    this.pendingRequests.clear();
  }

  _connect() {
    // Проверяем флаг перед переподключением
    if (!this.shouldReconnect) return;  // ← НОВОЕ
    
    if (this.connecting || (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING))) {
      return;
    }
    // ... остальной код
  }
}
```

### Шаг 2: Добавить cleanup в useEffect

```javascript
useEffect(() => {
  const initClient = async () => {
    // ... существующий код
  };

  if (!client) {
    initClient();
  }

  return () => {
    // ← НОВЫЙ CLEANUP
    // Disconnect all external clients
    for (const [id, ec] of externalClients.entries()) {
      if (ec && typeof ec.disconnect === 'function') {
        ec.disconnect();
      }
    }
    externalClients.clear();
  };
}, [mcpServers, envVars, allowedTools, blockedTools, externalServers]);
```

### Шаг 3: Стабилизировать зависимости (опционально)

Если `allowedTools` и `blockedTools` создаются каждый раз заново:

```javascript
// В компоненте, который использует useMCPClient:
const allowedTools = useMemo(() => ["tool1", "tool2"], []);
const blockedTools = useMemo(() => [], []);
```

## 📊 Сценарий бага

1. Компонент монтируется → создаются клиенты для 2 серверов
2. Один сервер недоступен → начинаются попытки переподключения (backoff: 500ms, 1s, 2s, 4s, 8s, 8s, ...)
3. Пользователь вводит текст → если это триггерит изменение пропсов
4. useEffect перезапускается → создаются ЕЩЕ 2 клиента
5. Старые клиенты продолжают переподключаться (cleanup пустой!)
6. Теперь 4 клиента пытаются переподключиться
7. Пользователь вводит еще букву → 6 клиентов
8. **Результат:** Полный freeze браузера через несколько секунд

## ⚠️ Как проверить

1. Добавить console.log в `_connect()`:
   ```javascript
   _connect() {
     console.log('[WS] Attempting to connect to', this.url);
     // ...
   }
   ```

2. Запустить с недоступным сервером
3. Печатать текст в чате
4. Смотреть консоль → увидите экспоненциальный рост попыток подключения

## ✅ Приоритет: КРИТИЧЕСКИЙ

Это блокер для production использования с внешними серверами.

