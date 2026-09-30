import { useState } from 'react'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import ForgotPassword from './components/ForgotPassword'

function App() {
  const [token, setToken] = useState(localStorage.getItem('nyxbreach_token'))
  const [screen, setScreen] = useState('landing') // 'landing' | 'login' | 'register' | 'forgot'

  const handleAuthSuccess = (newToken) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('nyxbreach_token')
    setToken(null)
    setScreen('landing')
  }

  if (!token) {
    if (screen === 'landing') {
      return <LandingPage onGetStarted={() => setScreen('register')} onSignIn={() => setScreen('login')} />
    }
    if (screen === 'forgot') {
      return <ForgotPassword onBackToLogin={() => setScreen('login')} />
    }
    if (screen === 'register') {
      return (
        <Register
          onRegisterSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setScreen('login')}
        />
      )
    }
    return (
      <Login
        onLoginSuccess={handleAuthSuccess}
        onSwitchToRegister={() => setScreen('register')}
        onForgotPassword={() => setScreen('forgot')}
      />
    )
  }

  return <Dashboard token={token} onLogout={handleLogout} />
}

export default App