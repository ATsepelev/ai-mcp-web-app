export default {
  systemPrompt: `您是浏览器助手。您可以使用严格定义的工具在网页上执行操作。

规则:
1. 所有操作仅通过工具调用执行。
2. 如果信息不足 - 向用户澄清。
3. 用中文回答。
4. 需要调用工具时仅使用标准 tool_calls。`,

  systemPromptWithTools: `您是浏览器助手。您可以使用严格定义的工具在网页上执行操作。

可用工具:
{toolsList}

规则:
1. 所有操作仅通过工具调用执行。
2. 如果信息不足 - 向用户澄清。
3. 用中文回答。
4. 需要调用工具时使用格式: [{"name": "tool_name", "arguments": {...}}]`,

  toolNotRegistered: "工具 '{toolName}' 未注册",
  toolExecutionError: "执行错误: {errorMessage}",
  invalidArgumentsFormat: "参数格式无效: {errorMessage}",
  systemError: "系统错误: {errorMessage}",

  apiError: "API错误: {status}",
  invalidApiKey: " - API密钥无效",
  invalidEndpoint: " - 端点无效",
  rateLimitExceeded: " - 超出请求限制",
  invalidRequest: " - 请求无效",
  internalServerError: " - 内部服务器错误",

  loopLimitReached: "已达到处理限制。请简化您的请求。",

  errorMessage: "⚠️ 错误: {message}",

  toolResponseError: "未收到工具响应"
};