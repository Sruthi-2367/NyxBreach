import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

function NotificationsView() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getToken = () => localStorage.getItem('nyxbreach_token')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setNotifications(response.data)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading notifications...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
        <div>
      <div className="page-header">
        <div className="page-header-icon">🔔</div>
        <div>
          <h2 className="page-header-title">Notification History</h2>
          <p className="page-header-sub">Simulated email/SMS alerts (no real messages are sent)</p>
        </div>
      </div>
      <button onClick={fetchNotifications}>Refresh</button>
      {notifications.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">📭</span>
          <p>No notifications yet.</p>
        </div>
      )}
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '1rem',
            margin: '0.5rem 0'
          }}
        >
          <p><strong>Channel:</strong> {n.channel}</p>
          <p><strong>To:</strong> {n.recipient}</p>
          <p>{n.message}</p>
          <p><em>{new Date(n.sent_at).toLocaleString()}</em></p>
        </div>
      ))}
    </div>
  )
}

export default NotificationsView