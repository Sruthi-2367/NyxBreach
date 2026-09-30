import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

function OverviewView({ username }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('nyxbreach_token')
      const response = await axios.get(`${API_BASE_URL}/alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAlerts(response.data)
    } catch (err) {
      // silently fail, show zeros
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading overview...</p>

  const counts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  }
  const openCount = alerts.filter(a => a.status === 'open').length
  const lastAlert = alerts[0]

  const StatCard = ({ icon, label, value, color }) => (
    <div className="stat-card">
      <span className="stat-card-icon">{icon}</span>
      <div className="stat-card-value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-header-icon">🛡️</div>
        <div>
          <h2 className="page-header-title">Welcome back{username ? `, ${username}` : ''}</h2>
          <p className="page-header-sub">Real-time summary of your NyxBreach security posture</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
        <StatCard icon="🔴" label="Critical" value={counts.critical} color="#f85149" />
        <StatCard icon="🟠" label="High" value={counts.high} color="#d29922" />
        <StatCard icon="🔵" label="Medium" value={counts.medium} color="#58a6ff" />
        <StatCard icon="🟢" label="Low" value={counts.low} color="#3fb950" />
        <StatCard icon="📂" label="Open Alerts" value={openCount} />
        <StatCard icon="📊" label="Total Alerts" value={alerts.length} />
      </div>

      <h3 style={{ marginTop: '2rem' }}>Most Recent Alert</h3>
      {lastAlert ? (
        <div className="stat-card" style={{ textAlign: 'left' }}>
          <p style={{ margin: '0 0 0.4rem 0', fontWeight: 700 }}>{lastAlert.title}</p>
          <p style={{ margin: '0 0 0.4rem 0', color: 'var(--text-secondary)' }}>
            Severity: <span style={{ textTransform: 'capitalize' }}>{lastAlert.severity}</span> · Status: <span style={{ textTransform: 'capitalize' }}>{lastAlert.status}</span>
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {new Date(lastAlert.created_at).toLocaleString()}
          </p>
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon">✅</span>
          <p>No alerts recorded yet. Your system is clean.</p>
        </div>
      )}
    </div>
  )
}

export default OverviewView