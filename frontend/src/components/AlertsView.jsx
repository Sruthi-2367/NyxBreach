import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import { useToast } from '../ToastContext'

function AlertsView({ isAdmin }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [testPassword, setTestPassword] = useState('password123')
  const [triggering, setTriggering] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [teamMode, setTeamMode] = useState(false)
  const { showToast } = useToast()

  const getToken = () => localStorage.getItem('nyxbreach_token')

  useEffect(() => {
    fetchAlerts()
  }, [teamMode])

  const fetchAlerts = async () => {
    setLoading(true)
    setError('')
    try {
      const url = teamMode
        ? `${API_BASE_URL}/alerts/all`
        : `${API_BASE_URL}/alerts`
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setAlerts(response.data)
    } catch (err) {
      setError('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

    const updateStatus = async (alertId, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/alerts/${alertId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      )
      showToast(`Alert marked as ${newStatus}`, 'success')
      fetchAlerts()
    } catch (err) {
      showToast('Failed to update alert status', 'error')
    }
  }

    const triggerCredentialCheck = async () => {
    setTriggering(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/check-credential`, {
        user_id: 1,
        password: testPassword
      })
      if (response.data.breached) {
        showToast(`Breach found — password seen in ${response.data.count} leaks. Alert created.`, 'error')
      } else {
        showToast('No breach found for this password', 'success')
      }
      await fetchAlerts()
    } catch (err) {
      showToast('Credential check failed', 'error')
    } finally {
      setTriggering(false)
    }
  }

    const triggerRansomwareCheck = async () => {
    setTriggering(true)
    try {
      const baseTime = new Date()
      const events = []
      for (let i = 0; i < 12; i++) {
        const t = new Date(baseTime.getTime() + i * 2000)
        events.push({ filename: `file_${i}.docx`, action: 'rename', timestamp: t.toISOString() })
      }
      const response = await axios.post(`${API_BASE_URL}/check-file-activity`, { user_id: 1, events })
      if (response.data.staging_detected) {
        showToast('Ransomware staging pattern detected — alert created', 'error')
      } else {
        showToast('No staging pattern detected', 'success')
      }
      await fetchAlerts()
    } catch (err) {
      showToast('Ransomware check failed', 'error')
    } finally {
      setTriggering(false)
    }
  }

  const exportCSV = () => {
    const headers = ['ID', 'Type', 'Severity', 'Status', 'Title', 'Description', 'Created At']
    const rows = filteredAlerts.map(a => [
      a.id, a.alert_type, a.severity, a.status, a.title, a.description, a.created_at
    ])
    const csvContent = [headers, ...rows].map(row =>
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'nyxbreach_alerts.csv'
    link.click()
  }

  const filteredAlerts = alerts.filter(a => {
    const severityMatch = filterSeverity === 'all' || a.severity === filterSeverity
    const typeMatch = filterType === 'all' || a.alert_type === filterType
    return severityMatch && typeMatch
  })

  if (loading) return <p>Loading alerts...</p>

  return (
        <div>
      <div className="page-header">
        <div className="page-header-icon">🚨</div>
        <div>
          <h2 className="page-header-title">Security Alerts</h2>
          <p className="page-header-sub">Live detection results and manual test triggers</p>
        </div>
      </div>

      <div style={{ border: '1px solid #666', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
        <h3>Live Detection Demo</h3>
        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="text"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            placeholder="Password to check"
          />
          <button onClick={triggerCredentialCheck} disabled={triggering}>
            Check Credential Breach
          </button>
        </div>
        <div>
          <button onClick={triggerRansomwareCheck} disabled={triggering}>
            Simulate Ransomware Staging
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="credential_leak">Credential Leak</option>
          <option value="session_theft">Session Theft</option>
          <option value="ransomware_staging">Ransomware Staging</option>
        </select>
        {isAdmin && (
          <label style={{ color: '#8b949e' }}>
            <input
              type="checkbox"
              checked={teamMode}
              onChange={(e) => setTeamMode(e.target.checked)}
            />
            {' '}Team Mode (view all users)
          </label>
        )}
        <button onClick={fetchAlerts}>Refresh</button>
        <button onClick={exportCSV}>Export CSV</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {filteredAlerts.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">🕊️</span>
          <p>No alerts found.</p>
        </div>
      )}

      {filteredAlerts.map((alert) => (
        <div
          key={alert.id}
          style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '1rem', margin: '0.5rem 0' }}
        >
          <h3>{alert.title}</h3>
          <p><strong>Type:</strong> {alert.alert_type}</p>
          <p><strong>Severity:</strong> {alert.severity}</p>
          <p><strong>Status:</strong> {alert.status}</p>
          <p><strong>Description:</strong> {alert.description}</p>
          <p><strong>Why it fired:</strong> {alert.explanation}</p>
          <p><strong>Recommended action:</strong> {alert.recommended_action}</p>
          <p><em>{new Date(alert.created_at).toLocaleString()}</em></p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => updateStatus(alert.id, 'acknowledged')} disabled={alert.status === 'acknowledged'}>
              Acknowledge
            </button>
            <button onClick={() => updateStatus(alert.id, 'resolved')} disabled={alert.status === 'resolved'}>
              Resolve
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AlertsView