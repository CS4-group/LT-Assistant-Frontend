import { useState, useRef, useEffect } from 'react'
import { usePlanner } from '../../contexts/PlannerContext'
import API_BASE_URL from '../../config'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'

export default function ChatbotSection() {
  const { courseNames, fetchCourseNames } = usePlanner()
  const [messages, setMessages] = useState([
    {
      id: 'initial',
      sender: 'bot',
      text: `<p>Hi! I'm your AI course planning assistant. Tell me what courses you'd like to add to your schedule, and I'll help you place them in the right year and term.</p><p><strong>Example:</strong> "Add AP Biology to Junior Fall" or "I want to take Spanish 2 in Sophomore Spring"</p>`
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState('')
  const messagesRef = useRef(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return

    setMessages(prev => [...prev, { id: `user-${Date.now()}`, sender: 'user', text }])
    setInput('')
    setIsTyping(true)

    // Ensure course names are loaded
    let names = courseNames
    if (names.length === 0) {
      names = await fetchCourseNames()
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, availableCourses: names })
      })

      if (!response.ok) throw new Error(`API request failed: ${response.status}`)

      const result = await response.json()
      setIsTyping(false)

      let botText
      if (result.success && result.data && result.data.response) {
        botText = result.data.response
      } else if (result.data && typeof result.data === 'string') {
        botText = result.data
      } else if (result.response) {
        botText = result.response
      } else {
        botText = 'I received your message. How else can I help you with your course planning?'
      }

      setMessages(prev => [...prev, { id: `bot-${Date.now()}`, sender: 'bot', text: botText }])
    } catch (error) {
      setIsTyping(false)
      console.error('Chatbot API error:', error)
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '\u26a0\ufe0f Sorry, I encountered an error connecting to the AI assistant. Please try again in a moment.'
      }])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="chatbot-section">
      <h3>AI Course Assistant</h3>
      <div className="chatbot-container">
        <div className="chatbot-messages" ref={messagesRef}>
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
        <div className="chatbot-input-area">
          <div className="input-container">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Type your course request here..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="btn btn-primary chatbot-send-btn" onClick={sendMessage}>
              Send <span className="send-arrow">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
