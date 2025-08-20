import React from 'react';

const SimpleCustomWidget = ({
  isExpanded,
  toggleExpand,
  isRecording,
  toggleVoiceRecording,
  showComponents,
  position,
  // Данные чата
  inputValue,
  setInputValue,
  messages,
  isLoading,
  error,
  handleSend,
  handleKeyPress,
  showTooltip,
  tooltipMessage
}) => {
  // Функция для получения стилей позиционирования
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

  // Стили для тултипа
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

  if (!isExpanded) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
        {/* Тултип */}
        {showTooltip && (
          <div
            style={{
              ...getTooltipPositionStyles(),
              background: 'white',
              color: '#333',
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              maxWidth: '250px',
              fontSize: '13px',
              border: '1px solid #e2e8f0',
              pointerEvents: 'auto'
            }}
          >
            {tooltipMessage}
          </div>
        )}

        {/* Кнопки виджета */}
        <div style={{ ...getPositionStyles(), pointerEvents: 'auto' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {(showComponents === 'both' || showComponents === 'chat') && (
              <button
                onClick={toggleExpand}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
                title="Открыть чат"
              >
                💬
              </button>
            )}

            {(showComponents === 'both' || showComponents === 'voice') && (
              <button
                onClick={toggleVoiceRecording}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: isRecording ? '#dc3545' : '#28a745',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                }}
                title={isRecording ? "Остановить запись" : "Голосовой ввод"}
              >
                🎤
              </button>
            )}
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
      <div style={{ ...getPositionStyles(), pointerEvents: 'auto' }}>
        <div style={{
          width: '350px',
          height: '400px',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{
            background: '#007bff',
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{margin: 0, fontSize: '16px'}}>Кастомный чат</h3>
            <div style={{display: 'flex', gap: '8px'}}>
              <button
                onClick={toggleVoiceRecording}
                style={{
                  background: isRecording ? '#dc3545' : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                title={isRecording ? "Остановить запись" : "Голосовой ввод"}
              >
                🎤
              </button>
              <button
                onClick={toggleExpand}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                title="Свернуть чат"
              >
                ×
              </button>
            </div>
          </div>

          <div style={{flex: 1, padding: '15px', overflowY: 'auto', background: '#f8f9fa'}}>
            {messages.map((msg, index) => (
              <div key={index} style={{marginBottom: '10px', padding: '8px', background: 'white', borderRadius: '5px', fontSize: '14px'}}>
                <strong>{msg.role === 'user' ? 'Вы' : msg.role === 'assistant' ? 'AI' : msg.role}:</strong> {msg.content}
              </div>
            ))}
            {isLoading && <div style={{padding: '8px', background: '#e9ecef', borderRadius: '5px', fontSize: '14px'}}>AI думает...</div>}
            {error && <div style={{padding: '8px', background: '#f8d7da', color: '#721c24', borderRadius: '5px', fontSize: '14px'}}>Ошибка: {error}</div>}
          </div>

          <div style={{padding: '15px', borderTop: '1px solid #ccc'}}>
            <div style={{display: 'flex', gap: '10px'}}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRecording ? "Говорите..." : "Введите сообщение..."}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}
                disabled={isLoading || isRecording}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim() || isRecording}
                style={{
                  padding: '10px 15px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {isLoading ? '...' : '➤'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCustomWidget;