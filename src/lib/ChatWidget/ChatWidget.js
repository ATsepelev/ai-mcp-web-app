import {useEffect, useRef, useState, useMemo} from 'react';
import { useMCPClient } from '../useMCPClient';
import {useOpenAIChat} from '../useOpenAIChat';
import defaultLocales from './locales';
import './ChatWidget.css';

/**
 * Clean assistant content from service tags
 */
const cleanAssistantContent = (content) => {
  if (!content || typeof content !== 'string') {
    return content || '';
  }
  let cleanedContent = content.replace(/<think\b[^>]*>[\s\S]*?<\/think\b[^>]*>/gi, '').trim();
  cleanedContent = cleanedContent.replace(/^\s*\n|\n\s*$/g, '');
  return cleanedContent;
};

/**
 * Check if display content is empty
 */
const isDisplayContentEmpty = (content) => {
  if (!content || typeof content !== 'string') return true;
  const cleaned = cleanAssistantContent(content);
  if (!cleaned || cleaned.trim() === '') return true;

  const textOnly = cleaned.replace(/<[^>]*>/g, '').trim();
  return !textOnly || textOnly === '';
};

const ChatWidget = ({
                      position = 'bottom-right',
                      showComponents = 'both',
                      customComponent = null,
                      greeting = null,
                      chatTitle = 'AI Assistant Chat',
                      modelName = 'gpt-4o-mini',
                      baseUrl = 'http://127.0.0.1:1234/v1',
                      apiKey = null,
                      toolsSchema = [],
                      locale = 'en',
                  customLocales = {},
                  mcpServers = {},
                  envVars = {},
                  allowedTools = null,
                  blockedTools = [],
                  // Backward compatibility
                  externalServers = null,
                  // New: opt-in assistant response validation
                  validationOptions = null,
                  // Tools mode: 'api' (standard, via API parameter) or 'prompt' (legacy, in system prompt)
                  toolsMode = 'api'
                    }) => {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const tooltipTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isExpandedRef = useRef(false);
  const latestSendMessageRef = useRef(null);
  const isStartingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const hasGotResultRef = useRef(false);
  const hasRetriedStartRef = useRef(false);
  const lastMicActionAtRef = useRef(0);

  const mergedLocales = {
    ...defaultLocales,
    ...customLocales
  };

  const currentLocale = mergedLocales[locale] || mergedLocales.en;

  // Backward compatibility: convert externalServers array to mcpServers object
  const finalMcpServers = useMemo(() => {
    if (externalServers && Array.isArray(externalServers)) {
      console.warn('[ChatWidget] externalServers as array is deprecated. Use mcpServers object instead.');
      const converted = {};
      externalServers.forEach(server => {
        if (server.id) {
          converted[server.id] = {
            type: server.transport === 'ws' ? 'ws' : 'sse',
            url: server.url,
            headers: server.headers,
            protocols: server.protocols,
            withCredentials: server.withCredentials,
            postUrl: server.postUrl,
            timeoutMs: server.timeoutMs
          };
        }
      });
      return converted;
    }
    return mcpServers;
  }, [externalServers, mcpServers]);

  const { client, tools, status } = useMCPClient({ 
    mcpServers: finalMcpServers,
    envVars,
    allowedTools,
    blockedTools
  });

  const actualToolsSchema = toolsSchema.length > 0
  ? toolsSchema
  : tools.map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  } = useOpenAIChat(
    client,
    modelName,
    baseUrl,
    apiKey,
    actualToolsSchema,
    locale,
    validationOptions,
    toolsMode
  );

  // Determine if the assistant is currently calling a tool
  const isCallingTool = useMemo(() => {
    if (!Array.isArray(messages) || messages.length === 0) return false;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === 'assistant') {
        return !!(m.tool_calls && m.tool_calls.length > 0) && !!isLoading;
      }
      if (m.role === 'user') {
        break; // stop at last user message
      }
    }
    return false;
  }, [messages, isLoading]);

  useEffect(() => {
    // Keep refs in sync with latest values without re-initializing recognition
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  useEffect(() => {
    latestSendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = locale === 'en' ? 'en-US' :
                        locale === 'zh' ? 'zh-CN' : 'ru-RU';

      let buffer = '';

      const deliverTranscript = () => {
        const t = (buffer || '').trim();
        if (!t) return; // guard empty transcript
        if (isExpandedRef.current) {
          setInputValue(prev => prev + (prev ? ' ' : '') + t);
        } else if (typeof latestSendMessageRef.current === 'function') {
          latestSendMessageRef.current(t);
        }
        buffer = '';
      };

      recognition.onstart = () => {
        setRecognitionError(null);
        isStartingRef.current = false;
        hasStartedRef.current = true;
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        hasGotResultRef.current = true;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res[0] && res[0].transcript) {
            buffer += res[0].transcript;
            if (res.isFinal) {
              deliverTranscript();
            }
          }
        }
      };

      recognition.onend = () => {
        // If ended without final result, still attempt to deliver what we have
        deliverTranscript();
        // If Chrome ended immediately before actually starting, retry once
        if (!hasStartedRef.current && !hasGotResultRef.current && !hasRetriedStartRef.current) {
          hasRetriedStartRef.current = true;
          try {
            recognition.start();
            isStartingRef.current = true;
            return;
          } catch (e) {
            // fall through to reset state
          }
        }
        setIsRecording(false);
        isStartingRef.current = false;
      };

      recognition.onerror = (event) => {
        // Suppress noisy 'aborted' errors from rapid toggling
        if (event && event.error === 'aborted') {
          setIsRecording(false);
          return;
        }
        setRecognitionError(event?.error || 'unknown');
        setIsRecording(false);
      };

      recognition.onnomatch = () => {
        setRecognitionError('no-speech');
      };

      recognition.onspeechend = () => {
        try { recognition.stop(); } catch (e) {}
      };

      recognition.onaudioend = () => {
        // no-op, onend will handle delivery/state
      };

      recognitionRef.current = recognition;
    } else {
      setRecognitionError('not_supported');
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [locale]);

  const getErrorMessage = (error) => {
    switch (error) {
      case 'no-speech':
        return currentLocale.noSpeech;
      case 'audio-capture':
        return currentLocale.audioCapture;
      case 'not-allowed':
        return currentLocale.notAllowed;
      case 'not-supported':
        return currentLocale.notSupported;
      case 'network':
        return currentLocale.network;
      default:
        return currentLocale.unknown;
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const showTemporaryTooltip = (message) => {
    if (showComponents === 'chat') return;

    setTooltipMessage(message);
    setShowTooltip(true);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 2000);
  };

  const toggleVoiceRecording = () => {
    if (showComponents === 'chat') return;

    if (!recognitionRef.current) {
      showTemporaryTooltip(currentLocale.voiceNotSupported);
      return;
    }

    // Cooldown disabled per user request; keep timestamp for potential diagnostics
    lastMicActionAtRef.current = Date.now();

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        // Guard against overlapping starts
        if (isStartingRef.current) return;
        isStartingRef.current = true;
        hasStartedRef.current = false;
        hasGotResultRef.current = false;
        setRecognitionError(null);
        hasRetriedStartRef.current = false;
        // Start immediately; if Chrome ends immediately we auto-retry in onend
        try {
          recognitionRef.current.start();
        } catch (err) {
          isStartingRef.current = false;
          const code = (err && err.name) || 'start_failed';
          setRecognitionError(code);
          showTemporaryTooltip(getErrorMessage(code));
        }
      } catch (error) {
        console.error('Error starting recording:', error);
        const code = (error && error.name) || 'start_failed';
        setRecognitionError(code);
        showTemporaryTooltip(getErrorMessage(code));
      }
    }
  };

  useEffect(() => {
    if (recognitionError && recognitionError !== 'not_supported') {
      showTemporaryTooltip(getErrorMessage(recognitionError));
    }

    if (recognitionError === 'not_supported') {
      showTemporaryTooltip(currentLocale.voiceNotSupported);
    }
  }, [recognitionError, currentLocale]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});

    if (isExpanded && !isLoading && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isExpanded, isLoading]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isExpanded]);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 1000
    };

    switch (position) {
      case 'top-left':
        return {...baseStyles, top: '20px', left: '20px'};
      case 'top-right':
        return {...baseStyles, top: '20px', right: '20px'};
      case 'bottom-left':
        return {...baseStyles, bottom: '20px', left: '20px'};
      case 'bottom-right':
      default:
        return {...baseStyles, bottom: '20px', right: '20px'};
    }
  };

  const getTooltipPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 1001
    };

    switch (position) {
      case 'top-left':
        return {...baseStyles, top: '90px', left: '20px'};
      case 'top-right':
        return {...baseStyles, top: '90px', right: '20px'};
      case 'bottom-left':
        return {...baseStyles, bottom: '90px', left: '20px'};
      case 'bottom-right':
      default:
        return {...baseStyles, bottom: '90px', right: '20px'};
    }
  };

  const showChat = showComponents === 'both' || showComponents === 'chat';
  const showVoice = showComponents === 'both' || showComponents === 'voice';

  if (customComponent) {
    const customProps = {
      isExpanded,
      setIsExpanded,
      isRecording,
      toggleVoiceRecording,
      toggleExpand,
      showTooltip,
      tooltipMessage,
      position,
      showComponents,
      greeting,
      chatTitle,
      inputValue,
      setInputValue,
      messages,
      isLoading,
      error,
      sendMessage,
      clearChat,
      handleSend,
      handleKeyPress,
      modelName,
      baseUrl,
      apiKey,
      toolsSchema,
      locale,
      currentLocale,
      customLocales,
      mcpServers: finalMcpServers,
      envVars,
      allowedTools,
      blockedTools,
      inputRef,
      messagesEndRef,
      showTemporaryTooltip,
      getErrorMessage
    };

    return React.cloneElement(customComponent, customProps);
  }

  return (
    <div className="chat-widget-wrapper">
      {showTooltip && showVoice && (
        <div
          className="global-voice-tooltip"
          style={getTooltipPositionStyles()}
        >
          <div className="tooltip-content">
            {tooltipMessage}
          </div>
        </div>
      )}

      <div
        className={`chat-widget-container ${isExpanded ? 'expanded' : 'collapsed'}`}
        style={getPositionStyles()}
      >
        {!isExpanded ? (
          <div className="chat-collapsed">
            {showChat && (
              <button
                className={`chat-toggle-button main-button ${isLoading ? 'thinking' : ''}`}
                onClick={toggleExpand}
                title={currentLocale.openChat}
              >
                💬
              </button>
            )}
            {showVoice && (
              <button
                className={`chat-toggle-button voice-button ${isRecording ? 'recording' : ''}`}
                onClick={toggleVoiceRecording}
                title={isRecording ? currentLocale.stopRecording : currentLocale.voiceInput}
                disabled={recognitionError === 'not_supported'}
              >
                🎤
              </button>
            )}
          </div>
        ) : (
          <div className="chat-expanded">
            <div className="chat-header">
              <h3>{chatTitle}</h3>
              <div className="chat-header-buttons">
                {showVoice && (
                  <button
                    className={`voice-button-header ${isRecording ? 'recording' : ''}`}
                    onClick={toggleVoiceRecording}
                    title={isRecording ? currentLocale.stopRecording : currentLocale.voiceInput}
                    disabled={recognitionError === 'not_supported'}
                  >
                    🎤
                  </button>
                )}
                <button onClick={clearChat} title={currentLocale.clearChat}>🗑️</button>
                <button onClick={toggleExpand} title={currentLocale.collapseChat}>−</button>
              </div>
            </div>

            <div className="chat-messages">
              {greeting && (
                <div className="message message-greeting">
                  <strong>{currentLocale.greetingTitle}</strong>
                  <span dangerouslySetInnerHTML={{
                    __html: greeting.replace(/\n/g, '<br />')
                  }} />
                </div>
              )}

              {messages.map((msg, index) => {
                const shouldDisplayMessage = () => {
                  // Hide tool role messages entirely
                  if (msg.role === 'tool') return false;

                  // Suppress listing of tool calls as separate message; status bubble will reflect state
                  if (msg.tool_calls && msg.tool_calls.length > 0) return false;

                  if (msg.role === 'assistant') {
                    if (msg.content && !isDisplayContentEmpty(msg.content)) {
                      return true;
                    }
                    return false;
                  }

                  return !!msg.content;
                };

                if (!shouldDisplayMessage()) {
                  return null;
                }

                let displayContent = msg.content;
                if (msg.role === 'assistant') {
                  // During tool calls, suppress assistant content; status bubble shows action
                  if (msg.tool_calls && msg.tool_calls.length > 0) {
                    displayContent = '';
                  } else if (msg.content) {
                    displayContent = cleanAssistantContent(msg.content);
                  }
                } else if (msg.content) {
                  displayContent = cleanAssistantContent(msg.content);
                }

                return (
                  <div key={index} className={`message message-${msg.role}`}>
                    <strong>
                      {msg.role === 'user' ? currentLocale.user :
                        msg.role === 'assistant' ? currentLocale.ai :
                          msg.role === 'tool' ? currentLocale.tool : msg.role}
                    </strong>:
                    {displayContent ? (
                      <span dangerouslySetInnerHTML={{
                        __html: displayContent.replace(/\n/g, '<br />')
                      }}/>
                    ) : (
                      <span></span>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="message message-info">
                  <em>{isCallingTool ? currentLocale.callingToolGeneric : currentLocale.thinking}</em>
                </div>
              )}
              {error && <div className="message message-error"><strong>{currentLocale.error}:</strong> {error}</div>}
              <div ref={messagesEndRef}/>
            </div>

            <div className="chat-input-area">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRecording ? currentLocale.speaking : currentLocale.enterMessage}
                disabled={isLoading || isRecording}
                rows="2"
              />
              <button onClick={handleSend} disabled={isLoading || !inputValue.trim() || isRecording}>
                {isLoading ? '...' : '➤'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;