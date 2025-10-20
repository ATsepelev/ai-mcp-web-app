import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import openaiLocales from './locales/openai';

// Generate unique IDs for tool calls
const generateToolCallId = () => `toolcall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Try to import tiktoken (optional dependency)
let encodingForModel = null;
try {
  const tiktoken = require('js-tiktoken');
  encodingForModel = tiktoken.encodingForModel;
} catch (e) {
  // js-tiktoken not installed - will use approximate counting
  console.info('js-tiktoken not installed. Using approximate token counting (4 chars ≈ 1 token). Install js-tiktoken for accurate counting.');
}

// Initialize tokenizer (cl100k_base encoding used by gpt-4, gpt-3.5-turbo)
let tokenizer = null;
const getTokenizer = () => {
  if (!encodingForModel) return null; // tiktoken not available
  
  if (!tokenizer) {
    try {
      // Try to get encoding for gpt-4 (cl100k_base)
      tokenizer = encodingForModel('gpt-4');
    } catch (e) {
      console.warn('Failed to initialize tokenizer for gpt-4:', e);
      // Tokenizer initialization failed - return null
      // Will fall back to approximate counting
    }
  }
  return tokenizer;
};

/**
 * Approximate token count based on character length
 * Rule of thumb: ~4 characters per token for English, ~2 for other languages
 * This is less accurate but doesn't require tiktoken library
 */
const approximateTokenCount = (text) => {
  if (!text || typeof text !== 'string') return 0;
  // Use 3.5 as average (between English and other languages)
  return Math.ceil(text.length / 3.5);
};

/**
 * Count tokens in a single message
 * Uses tiktoken if available, otherwise falls back to approximate counting
 */
const countMessageTokens = (message) => {
  const enc = getTokenizer();
  
  if (enc) {
    // Use accurate tiktoken counting
    let tokens = 0;
    
    // Count role tokens
    if (message.role) {
      tokens += enc.encode(message.role).length;
    }
    
    // Count content tokens
    if (message.content && typeof message.content === 'string') {
      tokens += enc.encode(message.content).length;
    }
    
    // Count tool_calls tokens if present
    if (message.tool_calls && Array.isArray(message.tool_calls)) {
      for (const tc of message.tool_calls) {
        if (tc.function) {
          if (tc.function.name) {
            tokens += enc.encode(tc.function.name).length;
          }
          if (tc.function.arguments) {
            const argsStr = typeof tc.function.arguments === 'string' 
              ? tc.function.arguments 
              : JSON.stringify(tc.function.arguments);
            tokens += enc.encode(argsStr).length;
          }
        }
      }
    }
    
    // Count tool response tokens
    if (message.tool_call_id) {
      tokens += enc.encode(message.tool_call_id).length;
    }
    
    // Add overhead tokens per message (empirically ~4 tokens per message for formatting)
    tokens += 4;
    
    return tokens;
  } else {
    // Use approximate counting (fallback)
    let tokens = 0;
    
    // Count role tokens
    if (message.role) {
      tokens += approximateTokenCount(message.role);
    }
    
    // Count content tokens
    if (message.content && typeof message.content === 'string') {
      tokens += approximateTokenCount(message.content);
    }
    
    // Count tool_calls tokens if present
    if (message.tool_calls && Array.isArray(message.tool_calls)) {
      for (const tc of message.tool_calls) {
        if (tc.function) {
          if (tc.function.name) {
            tokens += approximateTokenCount(tc.function.name);
          }
          if (tc.function.arguments) {
            const argsStr = typeof tc.function.arguments === 'string' 
              ? tc.function.arguments 
              : JSON.stringify(tc.function.arguments);
            tokens += approximateTokenCount(argsStr);
          }
        }
      }
    }
    
    // Count tool response tokens
    if (message.tool_call_id) {
      tokens += approximateTokenCount(message.tool_call_id);
    }
    
    // Add overhead tokens per message (empirically ~4 tokens per message for formatting)
    tokens += 4;
    
    return tokens;
  }
};

/**
 * Count total tokens in an array of messages
 */
const countTotalTokens = (messages) => {
  return messages.reduce((sum, msg) => sum + countMessageTokens(msg), 0);
};

/**
 * Filter messages to fit within maxTokens context size
 * Always keeps system message (first message)
 * Removes oldest messages first until within limit
 * Marks excluded messages with excludedFromContext flag
 */
const filterMessagesByContext = (messages, maxTokens) => {
  if (!messages || messages.length === 0) {
    return { filtered: [], allMessages: [] };
  }
  
  const totalTokens = countTotalTokens(messages);
  
  // If within limit, return all messages
  if (totalTokens <= maxTokens) {
    return { 
      filtered: messages,
      allMessages: messages
    };
  }
  
  // Always keep system message (first message)
  const systemMessage = messages[0];
  const otherMessages = messages.slice(1);
  
  // Start with system message tokens
  let currentTokens = countMessageTokens(systemMessage);
  
  // Collect messages from most recent backwards until we hit the limit
  const reversedOthers = [...otherMessages].reverse();
  const keptIndices = new Set();
  const keptMessages = [];
  
  for (let i = 0; i < reversedOthers.length; i++) {
    const msg = reversedOthers[i];
    const msgTokens = countMessageTokens(msg);
    
    if (currentTokens + msgTokens <= maxTokens) {
      keptMessages.unshift(msg); // Add to beginning of kept messages (to maintain chronological order)
      currentTokens += msgTokens;
      keptIndices.add(otherMessages.length - 1 - i); // Original index in otherMessages
    } else {
      break;
    }
  }
  
  // Build filtered array: system message first, then kept messages in chronological order
  const filtered = [systemMessage, ...keptMessages];
  
  // Mark excluded messages
  const allMessages = messages.map((msg, index) => {
    if (index === 0) {
      // System message is always included
      return msg;
    }
    
    const otherIndex = index - 1;
    if (keptIndices.has(otherIndex)) {
      // This message is included
      return { ...msg, excludedFromContext: false };
    } else {
      // This message is excluded
      return { ...msg, excludedFromContext: true };
    }
  });
  
  return {
    filtered: filtered.map(msg => {
      const { excludedFromContext, ...rest } = msg;
      return rest;
    }),
    allMessages
  };
};

/**
 * Parses assistant response, supporting both formats
 */
function parseAssistantResponse(assistantMsg) {
  let thinkText = null;
  let toolCallsJson = null;
  let displayContent = "";

  // New format: tool_calls is present directly
  if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
    const toolCalls = assistantMsg.tool_calls.map(tc => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments
    }));

    toolCallsJson = toolCalls;

    // Process content: remove <think>...</think>
    if (typeof assistantMsg.content === 'string') {
      displayContent = assistantMsg.content;
      const thinkMatch = displayContent.match(/<think>([\s\S]*?)<\/think>/i);
      if (thinkMatch) {
        thinkText = thinkMatch[1].trim();
        displayContent = displayContent.replace(thinkMatch[0], '').trim();
      }
    }
  } else {
    // Old format: parse from content
    if (typeof assistantMsg.content === 'string') {
      displayContent = assistantMsg.content;

      const thinkMatch = displayContent.match(/<think>([\s\S]*?)<\/think>/i);
      if (thinkMatch) {
        thinkText = thinkMatch[1].trim();
        displayContent = displayContent.replace(thinkMatch[0], '').trim();
      }

      // gpt-oss control tags formats:
      // 1) <|constrain|>func=functions.name ... <|message|>{json}
      // 2) <|constrain|>functions.name ... <|message|>{json}
      let funcNameFromTag = null;
      const ossFuncMatchLegacy = displayContent.match(/<\|constrain\|>\s*func=([\w.\-]+)/i);
      const ossFuncMatchNoAttr = displayContent.match(/<\|constrain\|>\s*functions\.([\w.\-]+)/i);
      if (ossFuncMatchLegacy) {
        funcNameFromTag = (ossFuncMatchLegacy[1] || '').replace(/^functions\./, '');
      } else if (ossFuncMatchNoAttr) {
        funcNameFromTag = (ossFuncMatchNoAttr[1] || '').replace(/^functions\./, '');
      }
      const ossMsgIndex = displayContent.lastIndexOf('<|message|>');
      if (funcNameFromTag && ossMsgIndex !== -1) {
        try {
          const jsonText = displayContent.slice(ossMsgIndex + '<|message|>'.length).trim();
          let funcArgs = {};
          if (jsonText) {
            try {
              funcArgs = JSON.parse(jsonText);
            } catch (e) {
              // pass as string; will be parsed downstream
              funcArgs = jsonText;
            }
          }
          // Normalize shape like { name, arguments } to arguments only
          if (funcArgs && typeof funcArgs === 'object' && 'arguments' in funcArgs && Object.keys(funcArgs).length <= 2) {
            funcArgs = funcArgs.arguments;
          }

          toolCallsJson = [{
            id: generateToolCallId(),
            name: funcNameFromTag,
            arguments: funcArgs
          }];

          // Remove JSON payload from display and strip all gpt-oss control tags
          displayContent = displayContent
            .slice(0, ossMsgIndex)
            .replace(/<\|channel\|>[^<]*?/gi, '')
            .replace(/<\|constrain\|>[^<]*?/gi, '')
            .replace(/<\|message\|>/gi, '')
            .trim();
        } catch (e) {
          // Parsing error, continue with original content
        }
      }

      // Try to parse entire content as JSON array of tool calls
      if (!toolCallsJson) {
        try {
          const trimmedContent = displayContent.trim();
          if (trimmedContent.startsWith('[') && trimmedContent.endsWith(']')) {
            const parsedJson = JSON.parse(trimmedContent);
            
            // Validate format - should be array of tool call objects
            if (Array.isArray(parsedJson) && parsedJson.length > 0) {
              const isValidToolCalls = parsedJson.every(tc => 
                tc && typeof tc === 'object' && 
                typeof tc.name === 'string' && 
                tc.arguments !== undefined
              );
              
              if (isValidToolCalls) {
                toolCallsJson = parsedJson.map(tc => ({
                  id: generateToolCallId(),
                  name: tc.name,
                  arguments: tc.arguments
                }));
                displayContent = ''; // Clear content since it's all tool calls
              }
            }
          }
        } catch (e) {
          // Not valid JSON, continue to bracketed format fallback
        }
      }

      // Legacy bracketed JSON format fallback
      if (!toolCallsJson) {
        const toolCallMatch = displayContent.match(/\[([\s\S]*?)\]/i);
        if (toolCallMatch) {
          try {
            const parsedJson = JSON.parse(toolCallMatch[1]);

            // Validate format
            if (typeof parsedJson !== 'object' || parsedJson === null) {
              throw new Error("Parsed JSON is not an object");
            }

            toolCallsJson = (Array.isArray(parsedJson) ? parsedJson : [parsedJson]).map(tc => ({
              id: generateToolCallId(),
              name: tc.name,
              arguments: tc.arguments
            }));
            displayContent = displayContent.replace(toolCallMatch[0], '').trim();
          } catch (e) {
            // JSON parse error, continue without tool calls
          }
        }
      }
    } else if (assistantMsg.content) {
      // Convert to string if value exists
      displayContent = String(assistantMsg.content);
    }
  }

  // Map provider-specific reasoning field if present (e.g., gpt-oss)
  if (!thinkText && typeof assistantMsg.reasoning === 'string' && assistantMsg.reasoning.trim()) {
    thinkText = assistantMsg.reasoning.trim();
  }

  return {
    think: thinkText,
    toolCallsJson: toolCallsJson,
    displayContent: displayContent
  };
}

export const useOpenAIChat = (mcpClient, modelName, baseUrl, apiKey, actualToolsSchema, locale = 'en', validationOptions = null, toolsMode = 'api', maxContextSize = 32000, maxToolLoops = 5) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [isExecutingTools, setIsExecutingTools] = useState(false);

  // Get current localization
  const currentLocale = openaiLocales[locale] || openaiLocales.ru;

  // System prompt with localization (recomputed when tools or locale/mode change)
  // toolsMode: 'api' = tools passed via API parameter only (standard)
  // toolsMode: 'prompt' = tools passed via API parameter AND described in system prompt (legacy)
  const systemPrompt = useMemo(() => {
    if (toolsMode === 'prompt') {
      const toolsList = (actualToolsSchema || [])
        .map(t => `• ${t.function.name}: ${t.function.description}`)
        .join('\n');
      return (currentLocale.systemPromptWithTools || currentLocale.systemPrompt)
        .replace('{toolsList}', toolsList);
    }
    return currentLocale.systemPrompt;
  }, [currentLocale, toolsMode, actualToolsSchema]);


  const conversationHistoryRef = useRef([{ role: "system", content: systemPrompt }]);

  // Keep the first system message in sync when the computed systemPrompt changes
  useEffect(() => {
    if (
      Array.isArray(conversationHistoryRef.current) &&
      conversationHistoryRef.current.length > 0 &&
      conversationHistoryRef.current[0] &&
      conversationHistoryRef.current[0].role === 'system'
    ) {
      conversationHistoryRef.current[0] = { role: 'system', content: systemPrompt };
    }
  }, [systemPrompt]);
  const isProcessingRef = useRef(false);
  const usedFollowUpRef = useRef(false);

  // Use provided tools
  const availableTools = new Set((actualToolsSchema || []).map(t => t.function.name));

  const clearChat = useCallback(() => {
    setMessages([]);
    conversationHistoryRef.current = [{ role: "system", content: systemPrompt }];
    setError(null);
    setIsStreaming(false);
    setStreamingMessage(null);
  }, [systemPrompt]);

  const handleToolCalls = useCallback(async (toolCallsArray) => {
    setIsExecutingTools(true);
    const toolResponses = [];

    try {
    // Create array of promises for parallel tool execution
    const toolPromises = toolCallsArray.map(async (toolCall) => {
      const funcName = toolCall.name;
      const toolCallId = toolCall.id;
      let funcArgs = toolCall.arguments;

      // Parse arguments from string to object
      if (typeof funcArgs === 'string') {
        try {
          funcArgs = JSON.parse(funcArgs);
        } catch (e) {
          return {
            role: "tool",
            tool_call_id: toolCallId,
            content: JSON.stringify({ error: currentLocale.invalidArgumentsFormat.replace('{errorMessage}', e.message) })
          };
        }
      }

      // Normalize shape like { name, arguments } -> arguments
      if (funcArgs && typeof funcArgs === 'object' && 'arguments' in funcArgs && Object.keys(funcArgs).length <= 2) {
        funcArgs = funcArgs.arguments;
      }

      // Check tool availability
      if (!availableTools.has(funcName)) {
        return {
          role: "tool",
          tool_call_id: toolCallId,
          content: JSON.stringify({
            error: currentLocale.toolNotRegistered.replace('{toolName}', funcName)
          })
        };
      }

      try {
        const result = await mcpClient.callTool(funcName, funcArgs);

        return {
          role: "tool",
          tool_call_id: toolCallId,
          content: JSON.stringify(result)
        };
      } catch (error) {
        return {
          role: "tool",
          tool_call_id: toolCallId,
          content: JSON.stringify({ error: currentLocale.toolExecutionError.replace('{errorMessage}', error.message) })
        };
      }
    });

    // Execute all tools in parallel
    const results = await Promise.allSettled(toolPromises);

    // Process results
    for (const result of results) {
      if (result.status === 'fulfilled') {
        toolResponses.push(result.value);
      } else {
        toolResponses.push({
          role: "tool",
          tool_call_id: 'unknown',
          content: JSON.stringify({ error: currentLocale.systemError.replace('{errorMessage}', result.reason.message) })
        });
      }
    }

    return toolResponses;
    } finally {
      setIsExecutingTools(false);
    }
  }, [mcpClient, actualToolsSchema, currentLocale]);

  const callOpenAI = useCallback(async (history, options = {}) => {
    // Use provided parameters or defaults
    const actualModelName = modelName || 'gpt-4o-mini';
    const actualBaseUrl = baseUrl || 'http://127.0.0.1:1234/v1';
    const actualApiKey = apiKey;
    const toolsSchema = options.toolsOverride !== undefined ? options.toolsOverride : (actualToolsSchema || []);
    const actualToolChoice = options.toolChoiceOverride !== undefined ? options.toolChoiceOverride : 'auto';

    const requestBody = {
      model: actualModelName,
      messages: history
    };

    // Always include tools in API request when available
    if (toolsSchema.length > 0) {
      requestBody.tools = toolsSchema;
      requestBody.tool_choice = actualToolChoice;
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    if (actualApiKey) {
      headers['Authorization'] = `Bearer ${actualApiKey}`;
    }

    const response = await fetch(`${actualBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;

      let errorMsg = currentLocale.apiError.replace('{status}', status);
      if (status === 401) {
        errorMsg += currentLocale.invalidApiKey;
      } else if (status === 404) {
        errorMsg += currentLocale.invalidEndpoint;
      } else if (status === 429) {
        errorMsg += currentLocale.rateLimitExceeded;
      } else if (status === 400) {
        // Try to extract error details
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMsg += ` - ${errorData.error.message}`;
          }
        } catch {
          errorMsg += currentLocale.invalidRequest;
        }
      } else if (status === 500) {
        errorMsg += currentLocale.internalServerError;
      }

      throw new Error(`${errorMsg}`);
    }

    return await response.json();
  }, [modelName, baseUrl, apiKey, actualToolsSchema, currentLocale, toolsMode]);

  // Streaming version of OpenAI API call
  const callOpenAIStream = useCallback(async (history, options = {}, onChunk) => {
    // Use provided parameters or defaults
    const actualModelName = modelName || 'gpt-4o-mini';
    const actualBaseUrl = baseUrl || 'http://127.0.0.1:1234/v1';
    const actualApiKey = apiKey;
    const toolsSchema = options.toolsOverride !== undefined ? options.toolsOverride : (actualToolsSchema || []);
    const actualToolChoice = options.toolChoiceOverride !== undefined ? options.toolChoiceOverride : 'auto';

    const requestBody = {
      model: actualModelName,
      messages: history,
      stream: true
    };

    // Always include tools in API request when available
    if (toolsSchema.length > 0) {
      requestBody.tools = toolsSchema;
      requestBody.tool_choice = actualToolChoice;
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    if (actualApiKey) {
      headers['Authorization'] = `Bearer ${actualApiKey}`;
    }

    const response = await fetch(`${actualBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;

      let errorMsg = currentLocale.apiError.replace('{status}', status);
      if (status === 401) {
        errorMsg += currentLocale.invalidApiKey;
      } else if (status === 404) {
        errorMsg += currentLocale.invalidEndpoint;
      } else if (status === 429) {
        errorMsg += currentLocale.rateLimitExceeded;
      } else if (status === 400) {
        // Try to extract error details
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMsg += ` - ${errorData.error.message}`;
          }
        } catch {
          errorMsg += currentLocale.invalidRequest;
        }
      } else if (status === 500) {
        errorMsg += currentLocale.internalServerError;
      }

      throw new Error(`${errorMsg}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                onChunk(parsed.choices[0].delta);
              }
            } catch (e) {
              // Failed to parse chunk, continue
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }, [modelName, baseUrl, apiKey, actualToolsSchema, currentLocale, toolsMode]);

  // Optional validator: checks assistant display content and can warn or request a revision
  const validateAssistantContent = useCallback(async (assistantText) => {
    try {
      if (!validationOptions || !validationOptions.enabled) return { valid: true };
      const mode = validationOptions.mode === 'revise' ? 'revise' : 'warn';
      const customPrompt = validationOptions.validatorPrompt;
      const sysPrompt = customPrompt || (
        locale === 'ru'
          ? 'Ты валидатор ответа. Проверь последний ответ ассистента на пустоту/мусор и очевидные ошибки разметки JSON. Ответь строго в JSON: {"valid": true|false, "note": "кратко", "revision": "если не валидно – исправленный текст или пусто"}. Без пояснений.'
          : (locale === 'zh'
            ? '你是回答验证器。检查助手上个回复是否为空/无意义以及JSON标记是否明显错误。只用JSON回复：{"valid": true|false, "note": "简要", "revision": "若无效给出修正文本或留空"}。不要解释。'
            : 'You are an answer validator. Check the last assistant reply for emptiness/noise and obvious JSON markup issues. Reply strictly as JSON: {"valid": true|false, "note": "short", "revision": "if invalid – corrected text or empty"}. No explanations.'));

      const validationHistory = [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: `Assistant reply to validate:\n\n\n${assistantText}` }
      ];

      const res = await callOpenAI(validationHistory, { toolsOverride: [], toolChoiceOverride: 'none' });
      const msg = res.choices?.[0]?.message;
      const raw = msg?.content || '';
      let verdict;
      try {
        verdict = JSON.parse(raw);
      } catch (_) {
        // If the model did not return JSON, treat as valid to avoid accidental loops
        return { valid: true };
      }
      if (verdict && verdict.valid === false) {
        if (mode === 'warn') {
          const note = typeof verdict.note === 'string' ? verdict.note : 'Validation failed.';
          const warnText = locale === 'ru' ? `⚠️ Проверка ответа: ${note}` : (locale === 'zh' ? `⚠️ 校验提示：${note}` : `⚠️ Validation: ${note}`);
          setMessages(prev => [...prev, { role: 'assistant', content: warnText }]);
          conversationHistoryRef.current.push({ role: 'assistant', content: warnText });
          return { valid: false, warned: true };
        }
        // revise mode: append a revised assistant response when provided
        if (typeof verdict.revision === 'string' && verdict.revision.trim()) {
          const revised = verdict.revision.trim();
          setMessages(prev => [...prev, { role: 'assistant', content: revised }]);
          conversationHistoryRef.current.push({ role: 'assistant', content: revised });
          return { valid: false, revised: true };
        }
        return { valid: false };
      }
      return { valid: true };
    } catch (_) {
      return { valid: true };
    }
  }, [validationOptions, locale, callOpenAI]);

  const sendMessage = useCallback(async (userMessage) => {
    // Check if tools are loaded
    /*if (!toolsSchema || toolsSchema.length === 0) {
      setError("Tools not loaded. Please try again later.");
      setIsLoading(false);
      isProcessingRef.current = false;
      return;
    }*/

    if (!userMessage.trim() || isLoading || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsLoading(true);
    setError(null);

    let uiMessages; // Declare once for reuse throughout the function

    try {
      // Add user message
      const userMsgObj = { role: "user", content: userMessage };
      conversationHistoryRef.current.push(userMsgObj);
      
      // Update UI messages with exclusion flags
      const { allMessages: initialMessages } = filterMessagesByContext(conversationHistoryRef.current, maxContextSize);
      // Filter out all system messages from UI (they should not be displayed to user)
      uiMessages = initialMessages.filter(msg => msg.role !== 'system');
      setMessages(uiMessages);
      
      usedFollowUpRef.current = false;

      let loopCount = 0;
      const MAX_LOOPS = maxToolLoops;

      // One-shot retry for control-tag responses
      const usedControlTagRetryRef = { current: false };
      // One-shot retry for invalid empty-key JSON like {"": {}}
      const usedEmptyJsonRetryRef = { current: false };

      while (loopCount < MAX_LOOPS) {
        loopCount++;

        // Filter messages by context size for API call
        const { filtered } = filterMessagesByContext(conversationHistoryRef.current, maxContextSize);

        // Call OpenAI API with filtered messages only
        const response = await callOpenAI(filtered);
        const assistantMsg = response.choices[0].message;

        // Detect invalid content: { "": {} }
        let isEmptyKeyEmptyObject = false;
        try {
          const raw = typeof assistantMsg.content === 'string' ? assistantMsg.content.trim() : '';
          if (raw.startsWith('{') && raw.endsWith('}')) {
            const obj = JSON.parse(raw);
            if (obj && typeof obj === 'object') {
              const keys = Object.keys(obj);
              if (keys.length === 1 && keys[0] === '' && obj[''] && typeof obj[''] === 'object' && Object.keys(obj['']).length === 0) {
                isEmptyKeyEmptyObject = true;
              }
            }
          }
        } catch (_) {}

        if (isEmptyKeyEmptyObject && !usedEmptyJsonRetryRef.current) {
          usedEmptyJsonRetryRef.current = true;
          const retryInstruction = locale === 'ru'
            ? 'Предыдущий ответ содержал неверный JSON вида {"": {}}. Сформируй корректный ответ: либо понятный текст для пользователя, либо корректные tool_calls.'
            : (locale === 'zh'
              ? '上一次回复包含无效的 JSON（{"": {}}）。请生成正确的回复：要么是用户可读的文本，要么是标准的 tool_calls。'
              : 'Previous reply contained invalid JSON of the form {"": {}}. Generate a correct reply: either a user-facing message or proper tool_calls.');
          const retryMsg = { role: 'system', content: retryInstruction };
          conversationHistoryRef.current.push(retryMsg);
          const retryRes = await callOpenAI(conversationHistoryRef.current);
          const retryAssistant = retryRes.choices?.[0]?.message || { role: 'assistant', content: '' };
          conversationHistoryRef.current.push(retryAssistant);
          const retryParsed = parseAssistantResponse(retryAssistant);
          // If we obtained tool calls, process them and continue loop
          if (retryParsed.toolCallsJson?.length) {
            const toolResponses = await handleToolCalls(retryParsed.toolCallsJson);
            if (toolResponses.length !== retryParsed.toolCallsJson.length) {
              const forcedResponses = retryParsed.toolCallsJson.map((call, index) => {
                if (index < toolResponses.length) return toolResponses[index];
                return { role: 'tool', tool_call_id: call.id, content: JSON.stringify({ error: currentLocale.toolResponseError }) };
              });
              conversationHistoryRef.current.push(...forcedResponses);
            } else {
              conversationHistoryRef.current.push(...toolResponses);
            }
            continue;
          }
          // Otherwise, if we got displayable content, show it and validate, then break
          if ((retryParsed.displayContent || '').trim()) {
            setMessages(prev => [...prev, { role: 'assistant', content: retryParsed.displayContent }]);
            await validateAssistantContent(retryParsed.displayContent);
            break;
          }
          // If still nothing useful, continue loop to try again (bounded by MAX_LOOPS)
          continue;
        }

        // Parse response
        const parsed = parseAssistantResponse(assistantMsg);

        // Add to history
        conversationHistoryRef.current.push(assistantMsg);

        // Add displayable content or tool-calls placeholder for UI
        if (parsed.displayContent.trim()) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: parsed.displayContent
          }]);
          // Optionally validate the assistant display content
          await validateAssistantContent(parsed.displayContent);
        } else if (parsed.toolCallsJson?.length) {
          // Show that assistant is calling tools (UI renders list from tool_calls)
          const uiToolCalls = parsed.toolCallsJson.map(tc => ({
            function: { name: tc.name }
          }));
          setMessages(prev => [...prev, {
            role: "assistant",
            tool_calls: uiToolCalls
          }]);
        }

        // Process tool calls
        if (parsed.toolCallsJson?.length) {
          // Execute tools
          const toolResponses = await handleToolCalls(parsed.toolCallsJson);

          // Check response count
          if (toolResponses.length !== parsed.toolCallsJson.length) {
            // Force responses for each call
            const forcedResponses = parsed.toolCallsJson.map((call, index) => {
              if (index < toolResponses.length) {
                return toolResponses[index];
              }
              return {
                role: "tool",
                tool_call_id: call.id,
                content: JSON.stringify({ error: currentLocale.toolResponseError })
              };
            });

            // Add forced responses
            conversationHistoryRef.current.push(...forcedResponses);
          } else {
            // Add tool responses to history
            conversationHistoryRef.current.push(...toolResponses);
          }
        } else {
          // If model returned gpt-oss control tags without parsed tool calls, request conversion once
          const contentStr = typeof assistantMsg.content === 'string' ? assistantMsg.content : '';
          const hasControlTags = /<\|constrain\|>|<\|message\|>|<\|channel\|>/i.test(contentStr);
          if (hasControlTags && !usedControlTagRetryRef.current) {
            usedControlTagRetryRef.current = true;
            const convertInstruction = locale === 'ru'
              ? 'Преобразуй свой предыдущий ответ в корректный формат tool_calls OpenAI без <|...|> тегов. Верни только tool_calls.'
              : (locale === 'zh'
                ? '将你之前的回复转换为没有 <|...|> 标签的标准 OpenAI tool_calls 格式。只返回 tool_calls。'
                : 'Convert your previous reply into proper OpenAI tool_calls format without <|...|> tags. Return tool_calls only.');
            const convertMsg = { role: 'system', content: convertInstruction };
            conversationHistoryRef.current.push(convertMsg);
            const convertRes = await callOpenAI(conversationHistoryRef.current);
            const convertAssistant = convertRes.choices?.[0]?.message || { role: 'assistant', content: '' };
            conversationHistoryRef.current.push(convertAssistant);
            const convParsed = parseAssistantResponse(convertAssistant);
            if (convParsed.toolCallsJson?.length) {
              // Execute tools obtained from conversion
              const toolResponses = await handleToolCalls(convParsed.toolCallsJson);
              if (toolResponses.length !== convParsed.toolCallsJson.length) {
                const forcedResponses = convParsed.toolCallsJson.map((call, index) => {
                  if (index < toolResponses.length) {
                    return toolResponses[index];
                  }
                  return {
                    role: 'tool',
                    tool_call_id: call.id,
                    content: JSON.stringify({ error: currentLocale.toolResponseError })
                  };
                });
                conversationHistoryRef.current.push(...forcedResponses);
              } else {
                conversationHistoryRef.current.push(...toolResponses);
              }
              // Continue loop to let model use tool results
              continue;
            }
          }
          // No tool calls. If there is no displayable content either, ask model to formulate a user-facing question once.
          if (!parsed.displayContent || !parsed.displayContent.trim()) {
            if (!usedFollowUpRef.current) {
              usedFollowUpRef.current = true;
              const followupInstruction = locale === 'ru'
                ? 'Сформулируй краткий, конкретный вопрос пользователю о недостающих данных/доступах, необходимых для продолжения. Без тегов <think> и без кода. Одна короткая фраза.'
                : 'Write a brief, specific question to the user asking for the exact missing info or access required to proceed. No <think> tags, no code. One concise sentence.';

              const followupMsg = { role: 'system', content: followupInstruction };
              conversationHistoryRef.current.push(followupMsg);
              const followupRes = await callOpenAI(conversationHistoryRef.current);
              const followupAssistant = followupRes.choices?.[0]?.message || { role: 'assistant', content: '' };
              conversationHistoryRef.current.push(followupAssistant);
              const followParsed = parseAssistantResponse(followupAssistant);
              const followText = (followParsed.displayContent || '').trim();
              if (followText) {
                setMessages(prev => [...prev, { role: 'assistant', content: followText }]);
              }
            }
          }
          break;
        }
      }

      if (loopCount >= MAX_LOOPS) {
        throw new Error(currentLocale.loopLimitReached);
      }
      
      // Update UI messages with exclusion flags after loop completes
      const { allMessages } = filterMessagesByContext(conversationHistoryRef.current, maxContextSize);
      // Filter out all system messages from UI (they should not be displayed to user)
      uiMessages = allMessages.filter(msg => msg.role !== 'system');
      setMessages(uiMessages);
    } catch (err) {
      setError(err.message);

      const errorMsg = {
        role: "assistant",
        content: currentLocale.errorMessage.replace('{message}', err.message)
      };

      conversationHistoryRef.current.push(errorMsg);
      
      // Update UI messages with exclusion flags after error
      const { allMessages } = filterMessagesByContext(conversationHistoryRef.current, maxContextSize);
      // Filter out all system messages from UI (they should not be displayed to user)
      uiMessages = allMessages.filter(msg => msg.role !== 'system');
      setMessages(uiMessages);
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, [isLoading, callOpenAI, handleToolCalls, actualToolsSchema, currentLocale, maxContextSize]);

  // Streaming version of sendMessage
  const sendMessageStream = useCallback(async (userMessage) => {
    if (!userMessage.trim() || isLoading || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);
    setStreamingMessage(null);

    let uiMessages; // Declare once for reuse throughout the function

    try {
      // Add user message
      const userMsgObj = { role: "user", content: userMessage };
      conversationHistoryRef.current.push(userMsgObj);
      
      // Update UI messages with exclusion flags
      const { allMessages: initialMessages } = filterMessagesByContext(conversationHistoryRef.current, maxContextSize);
      // Filter out all system messages from UI (they should not be displayed to user)
      uiMessages = initialMessages.filter(msg => msg.role !== 'system');
      setMessages(uiMessages);
      
      usedFollowUpRef.current = false;

      let loopCount = 0;
      const MAX_LOOPS = maxToolLoops;

      // One-shot retry for control-tag responses
      const usedControlTagRetryRef = { current: false };
      // One-shot retry for invalid empty-key JSON like {"": {}}
      const usedEmptyJsonRetryRef = { current: false };

      while (loopCount < MAX_LOOPS) {
        loopCount++;

        // Filter messages by context size for API call
        const { filtered } = filterMessagesByContext(conversationHistoryRef.current, maxContextSize);

        // Initialize streaming message for this iteration
        const initialStreamingMsg = { role: "assistant", content: "" };
        setStreamingMessage(initialStreamingMsg);

        // Handle streaming response
        let accumulatedContent = "";
        let toolCalls = null;

        await callOpenAIStream(filtered, {}, (delta) => {
          if (delta.content) {
            accumulatedContent += delta.content;
            setStreamingMessage(prev => ({
              ...prev,
              content: accumulatedContent
            }));
          }
          
          if (delta.tool_calls) {
            if (!toolCalls) toolCalls = [];
            delta.tool_calls.forEach(tc => {
              const existingIndex = toolCalls.findIndex(t => t.index === tc.index);
              if (existingIndex >= 0) {
                // Update existing tool call
                if (tc.function) {
                  if (!toolCalls[existingIndex].function) {
                    toolCalls[existingIndex].function = {};
                  }
                  // Accumulate name
                  if (tc.function.name) {
                    toolCalls[existingIndex].function.name = tc.function.name;
                  }
                  // Accumulate arguments as string (streaming comes in parts)
                  if (tc.function.arguments) {
                    toolCalls[existingIndex].function.arguments = 
                      (toolCalls[existingIndex].function.arguments || '') + tc.function.arguments;
                  }
                }
                // Add id if provided
                if (tc.id) {
                  toolCalls[existingIndex].id = tc.id;
                }
                // Ensure type is set
                if (!toolCalls[existingIndex].type) {
                  toolCalls[existingIndex].type = "function";
                }
              } else {
                // Create new tool call
                toolCalls.push({
                  type: "function",
                  index: tc.index,
                  id: tc.id || generateToolCallId(),
                  function: tc.function || {}
                });
              }
            });
          }
        });

        // Finalize the message
        const finalMessage = {
          role: "assistant",
          content: accumulatedContent,
          ...(toolCalls && { tool_calls: toolCalls })
        };

        // Detect invalid content: { "": {} }
        let isEmptyKeyEmptyObject = false;
        try {
          const raw = typeof finalMessage.content === 'string' ? finalMessage.content.trim() : '';
          if (raw.startsWith('{') && raw.endsWith('}')) {
            const obj = JSON.parse(raw);
            if (obj && typeof obj === 'object') {
              const keys = Object.keys(obj);
              if (keys.length === 1 && keys[0] === '' && obj[''] && typeof obj[''] === 'object' && Object.keys(obj['']).length === 0) {
                isEmptyKeyEmptyObject = true;
              }
            }
          }
        } catch (_) {}

        if (isEmptyKeyEmptyObject && !usedEmptyJsonRetryRef.current) {
          usedEmptyJsonRetryRef.current = true;
          const retryInstruction = locale === 'ru'
            ? 'Предыдущий ответ содержал неверный JSON вида {"": {}}. Сформируй корректный ответ: либо понятный текст для пользователя, либо корректные tool_calls.'
            : (locale === 'zh'
              ? '上一次回复包含无效的 JSON（{"": {}}）。请生成正确的回复：要么是用户可读的文本，要么是标准的 tool_calls。'
              : 'Previous reply contained invalid JSON of the form {"": {}}. Generate a correct reply: either a user-facing message or proper tool_calls.');
          const retryMsg = { role: 'system', content: retryInstruction };
          conversationHistoryRef.current.push(retryMsg);
          continue; // Retry with the instruction
        }

        // Parse the message to handle tool calls properly
        const parsed = parseAssistantResponse(finalMessage);

        // Add to conversation history
        conversationHistoryRef.current.push(finalMessage);

        // Process tool calls first
        if (parsed.toolCallsJson?.length) {
          // Execute tools
          const toolResponses = await handleToolCalls(parsed.toolCallsJson);

          // Check response count
          if (toolResponses.length !== parsed.toolCallsJson.length) {
            // Force responses for each call
            const forcedResponses = parsed.toolCallsJson.map((call, index) => {
              if (index < toolResponses.length) {
                return toolResponses[index];
              }
              return {
                role: "tool",
                tool_call_id: call.id,
                content: JSON.stringify({ error: currentLocale.toolResponseError })
              };
            });

            // Add forced responses
            conversationHistoryRef.current.push(...forcedResponses);
          } else {
            // Add tool responses to history
            conversationHistoryRef.current.push(...toolResponses);
          }

          // Show tool calls in UI (for user feedback)
          const uiToolCalls = parsed.toolCallsJson.map(tc => ({
            type: "function",
            function: { name: tc.name }
          }));
          setMessages(prev => [...prev, {
            role: "assistant",
            tool_calls: uiToolCalls
          }]);

          // Continue loop to let model use tool results
          continue;
        } else {
          // No tool calls - add displayable content to UI
          if (parsed.displayContent.trim()) {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: parsed.displayContent
            }]);
            // Optionally validate the assistant display content
            await validateAssistantContent(parsed.displayContent);
          }
          // If model returned gpt-oss control tags without parsed tool calls, request conversion once
          const contentStr = typeof finalMessage.content === 'string' ? finalMessage.content : '';
          const hasControlTags = /<\|constrain\|>|<\|message\|>|<\|channel\|>/i.test(contentStr);
          if (hasControlTags && !usedControlTagRetryRef.current) {
            usedControlTagRetryRef.current = true;
            const convertInstruction = locale === 'ru'
              ? 'Преобразуй свой предыдущий ответ в корректный формат tool_calls OpenAI без <|...|> тегов. Верни только tool_calls.'
              : (locale === 'zh'
                ? '将你之前的回复转换为没有 <|...|> 标签的标准 OpenAI tool_calls 格式。只返回 tool_calls。'
                : 'Convert your previous reply into proper OpenAI tool_calls format without <|...|> tags. Return tool_calls only.');
            const convertMsg = { role: 'system', content: convertInstruction };
            conversationHistoryRef.current.push(convertMsg);
            continue; // Retry with the instruction
          }
          
          // No tool calls. If there is no displayable content either, ask model to formulate a user-facing question once.
          if (!parsed.displayContent || !parsed.displayContent.trim()) {
            if (!usedFollowUpRef.current) {
              usedFollowUpRef.current = true;
              const followupInstruction = locale === 'ru'
                ? 'Сформулируй краткий, конкретный вопрос пользователю о недостающих данных/доступах, необходимых для продолжения. Без тегов <think> и без кода. Одна короткая фраза.'
                : 'Write a brief, specific question to the user asking for the exact missing info or access required to proceed. No <think> tags, no code. One concise sentence.';

              const followupMsg = { role: 'system', content: followupInstruction };
              conversationHistoryRef.current.push(followupMsg);
              continue; // Retry with the instruction
            }
          }
          break;
        }
      }

      if (loopCount >= MAX_LOOPS) {
        throw new Error(currentLocale.loopLimitReached);
      }
      
      // Update UI messages with exclusion flags after loop completes
      const { allMessages } = filterMessagesByContext(conversationHistoryRef.current, maxContextSize);
      // Filter out all system messages from UI (they should not be displayed to user)
      uiMessages = allMessages.filter(msg => msg.role !== 'system');
      setMessages(uiMessages);

    } catch (err) {
      setError(err.message);

      const errorMsg = {
        role: "assistant",
        content: currentLocale.errorMessage.replace('{message}', err.message)
      };

      conversationHistoryRef.current.push(errorMsg);
      
      // Update UI messages with exclusion flags after error
      const { allMessages } = filterMessagesByContext(conversationHistoryRef.current, maxContextSize);
      // Filter out all system messages from UI (they should not be displayed to user)
      uiMessages = allMessages.filter(msg => msg.role !== 'system');
      setMessages(uiMessages);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage(null);
      isProcessingRef.current = false;
    }
  }, [isLoading, callOpenAIStream, handleToolCalls, currentLocale, locale, validateAssistantContent, maxContextSize]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    sendMessageStream,
    isStreaming,
    streamingMessage,
    isExecutingTools,
    clearChat
  };
};