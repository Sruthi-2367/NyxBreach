import logoDark from '../assets/logo.png'
import logoLight from '../assets/logo-light.png'
import { getTheme } from '../theme'

function LandingPage({ onGetStarted, onSignIn }) {
  return (
    <div className="landing-screen">
      <div className="landing-content">
        <img src={getTheme() === 'light' ? logoLight : logoDark} alt="NyxBreach" style={{ width: '340px', marginBottom: '1rem' }} />

        <p style={{ textAlign: 'center', fontSize: '1.15rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
          Your digital security, under one intelligence layer — detecting the three
          silent stages of a breach before they become one, entirely on your own device.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
          <button
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)',
              color: '#070A12', fontWeight: 700, border: 'none',
              padding: '0.9rem 2.5rem', borderRadius: '8px', fontSize: '1rem'
            }}
          >
            Get Started
          </button>
          <button
            onClick={onSignIn}
            style={{
              background: 'transparent', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', padding: '0.9rem 2.5rem',
              borderRadius: '8px', fontSize: '1rem'
            }}
          >
            Sign In
          </button>
        </div>

        <div className="feature-pills">
          <span className="feature-pill">🔒 100% On-Device</span>
          <span className="feature-pill">⚡ Real-Time Detection</span>
          <span className="feature-pill">🤖 AI-Powered Co-Pilot</span>
          <span className="feature-pill">🛡️ Snapdragon Optimized</span>
        </div>
      </div>
    </div>
  )
}

export default LandingPage