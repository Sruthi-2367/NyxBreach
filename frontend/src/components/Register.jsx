import { useState } from 'react'
import axios from 'axios'
import logoDark from '../assets/logo.png'
import logoLight from '../assets/logo-light.png'
import { getTheme } from '../theme'
import { API_BASE_URL } from '../config'

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [accountType, setAccountType] = useState('individual') // 'individual' | 'team'
  const [teamRole, setTeamRole] = useState('analyst') // 'admin' | 'analyst' — only used when accountType === 'team'
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (accountType === 'team' && !organization.trim()) {
      setError('Organization name is required for a Team account')
      return
    }

    // Individual accounts always get full (admin-equivalent) access to their own data.
    // Team accounts use whatever role the person selected (Admin or Team Member).
    const finalRole = accountType === 'individual' ? 'admin' : teamRole

    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        username: username,
        password: password,
        role: finalRole,
        full_name: fullName,
        email: email,
        organization: accountType === 'team' ? organization : null
      })

      const token = response.data.access_token
      localStorage.setItem('nyxbreach_token', token)
      onRegisterSuccess(token)
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError('Username already exists')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="split-auth">
      <div className="split-auth-left">
        <div className="split-auth-content">
          <img src={getTheme() === 'light' ? logoLight : logoDark} alt="NyxBreach" style={{ width: '200px' }} />
          <h1 className="split-auth-headline">One intelligence layer. Three silent breach stages.</h1>
          <p className="split-auth-sub">
            NyxBreach watches for credential leaks, hijacked sessions, and ransomware
            staging — entirely on your own device, before an attacker gets the upper hand.
          </p>
          <div className="split-auth-feature-list">
            <div className="split-auth-feature">
              <span className="split-auth-feature-icon">🔒</span>
              <div>
                <p className="split-auth-feature-title">100% On-Device</p>
                <p className="split-auth-feature-desc">Nothing about your credentials or files leaves your machine.</p>
              </div>
            </div>
            <div className="split-auth-feature">
              <span className="split-auth-feature-icon">⚡</span>
              <div>
                <p className="split-auth-feature-title">Real-Time Detection</p>
                <p className="split-auth-feature-desc">Alerts fire the moment a suspicious pattern is caught.</p>
              </div>
            </div>
            <div className="split-auth-feature">
              <span className="split-auth-feature-icon">🤖</span>
              <div>
                <p className="split-auth-feature-title">AI-Powered Co-Pilot</p>
                <p className="split-auth-feature-desc">Ask questions about your own alerts, in plain English.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="split-auth-right">
        <div className="auth-card" style={{ width: '420px' }}>
          <h2>Create Account</h2>

          <div className="account-type-toggle">
            <div
              className={`account-type-card ${accountType === 'individual' ? 'active' : ''}`}
              onClick={() => setAccountType('individual')}
            >
              <span className="account-type-icon">👤</span>
              <p className="account-type-title">Individual</p>
              <p className="account-type-desc">Personal protection, just for you</p>
            </div>
            <div
              className={`account-type-card ${accountType === 'team' ? 'active' : ''}`}
              onClick={() => setAccountType('team')}
            >
              <span className="account-type-icon">🏢</span>
              <p className="account-type-title">Team</p>
              <p className="account-type-desc">Shared account for your organization</p>
            </div>
          </div>

          <form onSubmit={handleRegister}>
            <div>
              <label>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {accountType === 'team' && (
              <>
                <div>
                  <label>Organization</label>
                  <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} required />
                </div>
                <div>
                  <label>Your Role</label>
                  <select value={teamRole} onChange={(e) => setTeamRole(e.target.value)}>
                    <option value="analyst">Team Member — standard access</option>
                    <option value="admin">Admin — full access, including audit logs</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            {error && <p style={{ color: 'var(--accent-red)' }}>{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : `Create ${accountType === 'team' ? 'Team' : 'Individual'} Account`}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} style={{ width: 'auto', background: 'none', border: 'none', color: 'var(--accent-cyan)' }}>
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register