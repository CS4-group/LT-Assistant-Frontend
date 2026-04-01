export default function ChatMessage({ message }) {
  const { sender, text } = message
  return (
    <div className={`message ${sender}-message`}>
      <div className="message-avatar">{sender === 'bot' ? '\ud83e\udd16' : '\ud83d\udc64'}</div>
      <div className="message-content" dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  )
}
