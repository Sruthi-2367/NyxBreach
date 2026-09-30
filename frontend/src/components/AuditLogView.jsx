import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

function AuditLogView() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('nyxbreach_token')
      const response = await axios.get(`${API_BASE_URL}/audit-log`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setLogs(response.data)
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Access denied — admin role required')
      } else {
        setError('Failed to load audit log')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading audit log...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
        <div>
      <div className="page-header">
        <div className="page-header-icon">📜</div>
        <div>
          <h2 className="page-header-title">Audit Log</h2>
          <p className="page-header-sub">Admin-only: tracks all significant account and security actions</p>
        </div>
      </div>
      <button onClick={fetchLogs}>Refresh</button>
      {logs.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">📭</span>
          <p>No audit entries yet.</p>
        </div>
      )}
      {logs.map((log, index) => (
        <div
          key={index}
          style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '0.75rem',
            margin: '0.5rem 0'
          }}
        >
          <p><strong>{log.action}</strong></p>
          <p>{log.details}</p>
          <p><em>{new Date(log.timestamp).toLocaleString()}</em></p>
        </div>
      ))}
    </div>
  )
}

export default AuditLogView