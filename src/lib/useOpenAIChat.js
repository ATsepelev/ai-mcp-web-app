import { useCallback, useRef, useState } from 'react';
import openaiLocales from './locales/openai';

// Generate unique IDs for tool calls
const generateToolCallId = () => `toolcall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
          console.error("JSON parse error:", e, "Content:", toolCallMatch[1]);
        }
      }
    } else if (assistantMsg.content) {
      // Convert to string if value exists
      displayContent = String(assistantMsg.content);
    }
  }

  return {
    think: thinkText,
    toolCallsJson: toolCallsJson,
    displayContent: displayContent
  };
}

export const useOpenAIChat = (mcpClient, modelName, baseUrl, apiKey, toolsSchema, locale = 'en') => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current localization
  const currentLocale = openaiLocales[locale] || openaiLocales.ru;

  // System prompt with localization
  const systemPrompt = currentLocale.systemPrompt.replace(
    '{toolsList}',
    toolsSchema.map(t => `• ${t.function.name}: ${t.function.description}`).join('\n')
  );

  const conversationHistoryRef = useRef([{ role: "system", content: systemPrompt }]);
  const isProcessingRef = useRef(false);

  // Use provided tools
  const availableTools = new Set((toolsSchema || []).map(t => t.function.name));

  const clearChat = useCallback(() => {
    setMessages([]);
    conversationHistoryRef.current = [{ role: "system", content: systemPrompt }];
    setError(null);
  }, []);

  const handleToolCalls = useCallback(async (toolCallsArray) => {
    const toolResponses = [];

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
        console.log(`[Tool] Calling ${funcName} with:`, funcArgs);
        const result = await mcpClient.callTool(funcName, funcArgs);

        return {
          role: "tool",
          tool_call_id: toolCallId,
          content: JSON.stringify(result)
        };
      } catch (error) {
        console.error(`[Tool] Error in ${funcName}:`, error);
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
        console.error('Tool processing error:', result.reason);
        toolResponses.push({
          role: "tool",
          tool_call_id: 'unknown',
          content: JSON.stringify({ error: currentLocale.systemError.replace('{errorMessage}', result.reason.message) })
        });
      }
    }

    return toolResponses;
  }, [mcpClient, toolsSchema, currentLocale]);

  const callOpenAI = useCallback(async (history) => {
    // Use provided parameters or defaults
    const actualModelName = modelName || 'gpt-4o-mini';
    const actualBaseUrl = baseUrl || 'http://127.0.0.1:1234/v1';
    const actualApiKey = apiKey;
    const actualToolsSchema = toolsSchema || [];

    const requestBody = {
      model: actualModelName,
      messages: history,
      tools: actualToolsSchema,
      tool_choice: "auto"
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    if (actualApiKey) {
      headers['Authorization'] = `Bearer ${actualApiKey}`;
    }

    console.log('Sending request to:', actualBaseUrl);

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
  }, [modelName, baseUrl, apiKey, toolsSchema, currentLocale]);

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

    try {
      // Add user message
      const userMsgObj = { role: "user", content: userMessage };
      setMessages(prev => [...prev, userMsgObj]);
      conversationHistoryRef.current.push(userMsgObj);

      let loopCount = 0;
      const MAX_LOOPS = 5;

      while (loopCount < MAX_LOOPS) {
        loopCount++;

        // Call OpenAI API
        const response = await callOpenAI(conversationHistoryRef.current);
        const assistantMsg = response.choices[0].message;

        // Parse response
        const parsed = parseAssistantResponse(assistantMsg);

        // Log internal thoughts
        if (parsed.think) {
          console.log("[Think]:", parsed.think);
        }

        // Add to history
        conversationHistoryRef.current.push(assistantMsg);

        // Add displayable content
        if (parsed.displayContent.trim()) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: parsed.displayContent
          }]);
        }

        // Process tool calls
        if (parsed.toolCallsJson?.length) {
          console.log("[Tools]:", parsed.toolCallsJson);

          // Execute tools
          const toolResponses = await handleToolCalls(parsed.toolCallsJson);
          console.log(toolResponses)

          // Check response count
          if (toolResponses.length !== parsed.toolCallsJson.length) {
            console.error("Response count doesn't match tool call count", {
              calls: parsed.toolCallsJson.length,
              responses: toolResponses.length
            });

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
          break;
        }
      }

      if (loopCount >= MAX_LOOPS) {
        throw new Error(currentLocale.loopLimitReached);
      }
    } catch (err) {
      console.error("Error handling:", err);
      setError(err.message);

      const errorMsg = {
        role: "assistant",
        content: currentLocale.errorMessage.replace('{message}', err.message)
      };

      setMessages(prev => [...prev, errorMsg]);
      conversationHistoryRef.current.push(errorMsg);
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, [isLoading, callOpenAI, handleToolCalls, toolsSchema, currentLocale]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  };
};