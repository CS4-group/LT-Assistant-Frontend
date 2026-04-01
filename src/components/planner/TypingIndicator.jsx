export default function TypingIndicator() {
  return (
    <div className="message bot-message typing-message">
      <div className="message-avatar">{'\ud83e\udd16'}</div>
      <div className="message-content">
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  )
}
