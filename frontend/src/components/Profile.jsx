function Profile({ username, role, onLogout, onViewFullProfile }) {
  return (
    <div style={{
      position: 'absolute',
      top: '3.5rem',
      right: '1.5rem',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '1rem',
      minWidth: '200px',
      zIndex: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
    }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>{username}</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 0 }}>
        Role: <span style={{ color: 'var(--accent-cyan)', textTransform: 'capitalize' }}>{role}</span>
      </p>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.75rem 0' }} />
      <button onClick={onViewFullProfile} style={{ width: '100%', marginBottom: '0.5rem' }}>View Full Profile</button>
      <button onClick={onLogout} style={{ width: '100%' }}>Logout</button>
    </div>
  )
}

export default Profile