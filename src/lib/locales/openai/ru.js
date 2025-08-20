export default {
  systemPrompt: `Ты помощник в браузере. Ты можешь выполнять действия на веб-странице, используя строго определенные инструменты.
Доступные инструменты:
{toolsList}

Правила:
1. Все действия выполняются ТОЛЬКО через вызовы инструментов.
2. Если информации недостаточно - уточни у пользователя.
3. Отвечай на русском языке.
4. Используй разметку:
      <think>Твои рассуждения</think>
    [{"name": "tool_name", "arguments": {...}}]
5. Пользователь видит только текст вне тегов <think> и [].`,

  toolNotRegistered: "Инструмент '{toolName}' не зарегистрирован",
  toolExecutionError: "Ошибка выполнения: {errorMessage}",
  invalidArgumentsFormat: "Неверный формат аргументов: {errorMessage}",
  systemError: "Системная ошибка: {errorMessage}",

  apiError: "API error: {status}",
  invalidApiKey: " - Неверный API ключ",
  invalidEndpoint: " - Неверный эндпоинт",
  rateLimitExceeded: " - Превышен лимит запросов",
  invalidRequest: " - Неверный запрос",
  internalServerError: " - Внутренняя ошибка сервера",

  loopLimitReached: "Достигнут лимит обработки. Упростите запрос.",

  errorMessage: "⚠️ Ошибка: {message}",

  toolResponseError: "Не получен ответ от инструмента"
};