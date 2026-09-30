import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

function ChatView() {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    const userMessage = { role: 'user', text: question }
    setMessages((prev) => [...prev, userMessage])
    setQuestion('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        user_id: 1,
        question: question
      })
      const botMessage = { role: 'bot', text: response.data.answer }
      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, something went wrong.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
        <div>
      <div className="page-header">
        <div className="page-header-icon">🤖</div>
        <div>
          <h2 className="page-header-title">AI Security Co-Pilot</h2>
          <p className="page-header-sub">Running fully on-device — your data never leaves this machine</p>
        </div>
      </div>

      <div style={{
        border: '1px solid #ccc',
        borderRadius: '6px',
        padding: '1rem',
        height: '400px',
        overflowY: 'auto',
        marginBottom: '1rem'
      }}>
        {messages.length === 0 && (
          <p style={{ color: '#888' }}>Ask me about your security alerts...</p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              margin: '0.5rem 0'
            }}
          >
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              backgroundColor: msg.role === 'user' ? '#1976d2' : '#333',
              color: '#fff',
              maxWidth: '80%'
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <p style={{ color: '#888' }}>Thinking...</p>}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your alerts..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  )
}

export default ChatView