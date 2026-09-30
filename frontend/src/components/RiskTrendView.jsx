import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { API_BASE_URL } from '../config'

function RiskTrendView() {
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getToken = () => localStorage.getItem('nyxbreach_token')

  useEffect(() => {
    fetchTrend()
  }, [])

  const fetchTrend = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_BASE_URL}/risk-trend`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setTrend(response.data.trend)
    } catch (err) {
      setError('Failed to load risk trend')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading risk trend...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
        <div>
      <div className="page-header">
        <div className="page-header-icon">📈</div>
        <div>
          <h2 className="page-header-title">Risk Score Trend</h2>
          <p className="page-header-sub">Daily risk score based on alert severity over time</p>
        </div>
      </div>
      <button onClick={fetchTrend}>Refresh</button>
      {trend.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📉</span>
          <p>No risk data yet.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="risk_score" stroke="#d32f2f" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default RiskTrendView