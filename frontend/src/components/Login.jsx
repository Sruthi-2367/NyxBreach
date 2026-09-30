import { useState } from 'react'
import axios from 'axios'
import logoDark from '../assets/logo.png'
import logoLight from '../assets/logo-light.png'
import { getTheme } from '../theme'
import { API_BASE_URL } from '../config'

function Login({ onLoginSuccess, onSwitchToRegister, onForgotPassword }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: username,
        password: password,
        ip_address: '127.0.0.1',
        device_info: navigator.userAgent
      })

      const token = response.data.access_token
      localStorage.setItem('nyxbreach_token', token)
      onLoginSuccess(token)
    } catch (err) {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="split-auth">
      <div className="split-auth-left">
        <div className="split-auth-content">
          <img src={getTheme() === 'light' ? logoLight : logoDark} alt="NyxBreach" style={{ width: '200px' }} />
          <h1 className="split-auth-headline">Welcome back to your security co-pilot.</h1>
          <p className="split-auth-sub">
            Sign in to see your live risk trend, active alerts, and everything
            NyxBreach has caught since your last visit — all processed on-device.
          </p>
          <div className="split-auth-feature-list">
            <div className="split-auth-feature">
              <span className="split-auth-feature-icon">🔑</span>
              <div>
                <p className="split-auth-feature-title">Credential Leak Detection</p>
                <p className="split-auth-feature-desc">Know the moment a password you use turns up in a breach.</p>
              </div>
            </div>
            <div className="split-auth-feature">
              <span className="split-auth-feature-icon">🛰️</span>
              <div>
                <p className="split-auth-feature-title">Session Anomaly Detection</p>
                <p className="split-auth-feature-desc">Catch stolen sessions logging in from a different place, fast.</p>
              </div>
            </div>
            <div className="split-auth-feature">
              <span className="split-auth-feature-icon">🗂️</span>
              <div>
                <p className="split-auth-feature-title">Ransomware Staging Alerts</p>
                <p className="split-auth-feature-desc">Spot the mass file-rename pattern before encryption starts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="split-auth-right">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <form onSubmit={handleLogin}>
            <div>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
                <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p style={{ textAlign: 'right', margin: '-0.5rem 0 0 0' }}>
                <button type="button" onClick={onForgotPassword} style={{ width: 'auto', background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', padding: 0 }}>
                  Forgot password?
                </button>
              </p>
            </div>
            {error && <p style={{ color: 'var(--accent-red)' }}>{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToRegister} style={{ width: 'auto', background: 'none', border: 'none', color: 'var(--accent-cyan)' }}>
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login