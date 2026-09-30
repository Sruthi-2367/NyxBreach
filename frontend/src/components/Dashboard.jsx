import { useState, useEffect } from 'react'
import AlertsView from './AlertsView'
import RiskTrendView from './RiskTrendView'
import ChatView from './ChatView'
import NotificationsView from './NotificationsView'
import AuditLogView from './AuditLogView'
import AboutView from './AboutView'
import SettingsView from './SettingsView'
import OverviewView from './OverviewView'
import Profile from './Profile'
import ProfileView from './ProfileView'
import logoDark from '../assets/logo.png'
import logoLight from '../assets/logo-light.png'
import { toggleTheme, getTheme } from '../theme'

function Dashboard({ token, onLogout }) {
  const [activeView, setActiveView] = useState('overview')
  const [isAdmin, setIsAdmin] = useState(false)
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [theme, setTheme] = useState(getTheme())

  const handleThemeToggle = () => {
    const next = toggleTheme()
    setTheme(next)
  }

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setIsAdmin(payload.role === 'admin')
      setUsername(payload.sub)
      setRole(payload.role)
    }
  }, [token])

  const NavButton = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`nav-btn ${activeView === view ? 'nav-active' : ''}`}
    >
      <span className="nav-icon">{icon}</span>
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav className="dashboard-sidebar">
                <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src={theme === 'light' ? logoLight : logoDark} alt="NyxBreach" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: '1.05rem',
                letterSpacing: '1px',
                background: 'linear-gradient(135deg, #A78BFA, #22D3EE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                NYX
              </span>
              <span style={{
                fontWeight: 600,
                fontSize: '0.95rem',
                letterSpacing: '2.5px',
                color: 'var(--text-primary)'
              }}>
                BREACH
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0, letterSpacing: '1px' }}>
            DETECT · EXPLAIN · DEFEND
          </p>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li><NavButton view="overview" label="Overview" icon="🏠" /></li>
          <li><NavButton view="alerts" label="Alerts" icon="🚨" /></li>
          <li><NavButton view="trend" label="Risk Trend" icon="📈" /></li>
          <li><NavButton view="chat" label="AI Co-Pilot" icon="🤖" /></li>
          <li><NavButton view="notifications" label="Notifications" icon="🔔" /></li>
          <li><NavButton view="audit" label="Audit Log" icon="📜" /></li>
        </ul>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <NavButton view="about" label="About" icon="ℹ️" />
          <NavButton view="settings" label="Settings" icon="⚙️" />
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', position: 'relative'
        }}>
          <button onClick={handleThemeToggle} className="theme-toggle-btn" title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setShowProfile(!showProfile)} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: '#070A12'
            }}>
              {username ? username[0].toUpperCase() : '?'}
            </span>
            {username}
          </button>
          {showProfile && (
            <Profile
              username={username}
              role={role}
              onLogout={onLogout}
              onViewFullProfile={() => { setActiveView('profile'); setShowProfile(false) }}
            />
          )}
        </header>

        <main className="dashboard-main">
          <div className="dashboard-main-inner">
            {activeView === 'overview' && <OverviewView username={username} />}
            {activeView === 'alerts' && <AlertsView isAdmin={isAdmin} />}
            {activeView === 'trend' && <RiskTrendView />}
            {activeView === 'chat' && <ChatView />}
            {activeView === 'notifications' && <NotificationsView />}
            {activeView === 'audit' && <AuditLogView />}
            {activeView === 'about' && <AboutView />}
            {activeView === 'settings' && <SettingsView username={username} role={role} />}
            {activeView === 'profile' && <ProfileView />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard