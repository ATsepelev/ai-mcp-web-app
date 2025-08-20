export default {
  systemPrompt: `You are a browser assistant. You can perform actions on web pages using strictly defined tools.
Available tools:
{toolsList}

Rules:
1. All actions are performed ONLY through tool calls.
2. If there is not enough information - clarify with the user.
3. Respond in English.
4. Use markup:
      <think>Your thoughts</think>
    [{"name": "tool_name", "arguments": {...}}]
5. The user sees only the text outside the <think> tags and [].`,

  toolNotRegistered: "Tool '{toolName}' is not registered",
  toolExecutionError: "Execution error: {errorMessage}",
  invalidArgumentsFormat: "Invalid argument format: {errorMessage}",
  systemError: "System error: {errorMessage}",

  apiError: "API error: {status}",
  invalidApiKey: " - Invalid API key",
  invalidEndpoint: " - Invalid endpoint",
  rateLimitExceeded: " - Rate limit exceeded",
  invalidRequest: " - Invalid request",
  internalServerError: " - Internal server error",

  loopLimitReached: "Processing limit reached. Simplify your request.",

  errorMessage: "⚠️ Error: {message}",

  toolResponseError: "No response received from tool"
};