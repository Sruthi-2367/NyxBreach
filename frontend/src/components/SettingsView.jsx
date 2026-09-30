import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import { useToast } from '../ToastContext'

function SettingsView({ username, role }) {
  const getToken = () => localStorage.getItem('nyxbreach_token')
  const [notifyHigh, setNotifyHigh] = useState(true)
  const [notifyCritical, setNotifyCritical] = useState(true)
  const [renameThreshold, setRenameThreshold] = useState(10)
  const [timeWindow, setTimeWindow] = useState(60)
  const [sessionWindow, setSessionWindow] = useState(300)
  const { showToast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = response.data
      if (data.notify_high !== undefined) setNotifyHigh(data.notify_high === 'true')
      if (data.notify_critical !== undefined) setNotifyCritical(data.notify_critical === 'true')
      if (data.rename_threshold !== undefined) setRenameThreshold(Number(data.rename_threshold))
      if (data.time_window_seconds !== undefined) setTimeWindow(Number(data.time_window_seconds))
      if (data.session_window !== undefined) setSessionWindow(Number(data.session_window))
    } catch (err) {
      // no settings yet, use defaults silently
    }
  }

  const saveSetting = async (key, value) => {
    try {
      await axios.post(`${API_BASE_URL}/settings?key=${key}&value=${value}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      showToast('Setting saved', 'success')
    } catch (err) {
      showToast('Failed to save setting', 'error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-icon">⚙️</div>
        <div>
          <h2 className="page-header-title">Settings</h2>
          <p className="page-header-sub">Manage your profile, notification, and detection preferences</p>
        </div>
      </div>

      <h3>Profile</h3>
      <p>Username: {username}</p>
      <p>Role: <span style={{ textTransform: 'capitalize' }}>{role}</span></p>

      <h3>Notification Preferences</h3>
      <p>
        <label>
          <input
            type="checkbox"
            checked={notifyHigh}
            onChange={(e) => { setNotifyHigh(e.target.checked); saveSetting('notify_high', e.target.checked) }}
          />
          {' '}Simulate notifications for High severity alerts
        </label>
      </p>
      <p>
        <label>
          <input
            type="checkbox"
            checked={notifyCritical}
            onChange={(e) => { setNotifyCritical(e.target.checked); saveSetting('notify_critical', e.target.checked) }}
          />
          {' '}Simulate notifications for Critical severity alerts
        </label>
      </p>

      <h3>Detection Sensitivity</h3>
      <p>
        Ransomware rename threshold:{' '}
        <input
          type="number"
          value={renameThreshold}
          onChange={(e) => setRenameThreshold(e.target.value)}
          onBlur={() => saveSetting('rename_threshold', renameThreshold)}
          style={{ width: '60px' }}
        />
        {' '}files
      </p>
      <p>
        Ransomware time window:{' '}
        <input
          type="number"
          value={timeWindow}
          onChange={(e) => setTimeWindow(e.target.value)}
          onBlur={() => saveSetting('time_window_seconds', timeWindow)}
          style={{ width: '60px' }}
        />
        {' '}seconds
      </p>
      <p>
        Session anomaly window:{' '}
        <input
          type="number"
          value={sessionWindow}
          onChange={(e) => setSessionWindow(e.target.value)}
          onBlur={() => saveSetting('session_window', sessionWindow)}
          style={{ width: '60px' }}
        />
        {' '}seconds
      </p>

      <h3>Privacy & Data</h3>
      <p>All alert data, session history, and AI conversations are stored locally on this device only.</p>
      <p style={{ color: '#8b949e' }}>Database location: nyxbreach.db (local file)</p>
    </div>
  )
}

export default SettingsView