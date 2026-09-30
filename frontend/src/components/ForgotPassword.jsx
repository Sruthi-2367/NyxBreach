import { useState } from 'react'
import axios from 'axios'
import logo from '../assets/logo.png'
import { API_BASE_URL } from '../config'

function ForgotPassword({ onBackToLogin }) {
  const [stage, setStage] = useState('request') // 'request' | 'reset' | 'done'
  const [username, setUsername] = useState('')
  const [simulatedToken, setSimulatedToken] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, { username })
      setSimulatedToken(response.data.simulated_token)
      setStage('reset')
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('No account found with that username')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/reset-password`, {
        token: token,
        new_password: newPassword
      })
      setStage('done')
    } catch (err) {
      setError('Invalid or expired reset code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <img src={logo} alt="NyxBreach" style={{ width: '260px', marginBottom: '1.5rem', mixBlendMode: 'lighten' }} />
      <div className="auth-card">

        {stage === 'request' && (
          <>
            <h2>Reset Password</h2>
            <p style={{ fontSize: '0.85rem', marginTop: '-0.5rem' }}>
              Enter your username and we'll generate a reset code.
            </p>
            <form onSubmit={handleRequestReset}>
              <div>
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              {error && <p style={{ color: 'var(--accent-red)' }}>{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          </>
        )}

        {stage === 'reset' && (
          <>
            <h2>Enter Reset Code</h2>
            <div className="simulated-notice">
              📧 In a production deployment, this code would be emailed to you.
              For this on-device demo, it's shown directly:
              <div className="simulated-token">{simulatedToken}</div>
            </div>
            <form onSubmit={handleResetPassword}>
              <div>
                <label>Reset Code</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="e.g. A1B2C3D4"
                  required
                />
              </div>
              <div>
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p style={{ color: 'var(--accent-red)' }}>{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {stage === 'done' && (
          <>
            <h2>Password Reset</h2>
            <p>Your password has been changed successfully. You can now sign in with your new password.</p>
            <button type="button" onClick={onBackToLogin} style={{ width: '100%' }}>
              Back to Login
            </button>
          </>
        )}

        {stage !== 'done' && (
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="button" onClick={onBackToLogin} style={{ width: 'auto', background: 'none', border: 'none', color: 'var(--accent-cyan)' }}>
              ← Back to Login
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword