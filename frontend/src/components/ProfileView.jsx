import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import { useToast } from '../ToastContext'

function ProfileView() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()

  const getToken = () => localStorage.getItem('nyxbreach_token')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setProfile(response.data)
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePictureChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      setUploading(true)
      setError('')
      try {
        await axios.post(
          `${API_BASE_URL}/profile/me/picture`,
          { profile_image: reader.result },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        )
        showToast('Profile picture updated', 'success')
        fetchProfile()
      } catch (err) {
        showToast('Failed to upload picture', 'error')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) return <p>Loading profile...</p>
  if (error && !profile) return <p style={{ color: 'var(--accent-red)' }}>{error}</p>
  if (!profile) return null

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div>
      <h2>Profile</h2>

      <div className="profile-header-card">
        <div className="profile-picture-wrap">
          {profile.profile_image ? (
            <img src={profile.profile_image} alt="Profile" className="profile-picture" />
          ) : (
            <div className="profile-picture-fallback">
              {profile.username ? profile.username[0].toUpperCase() : '?'}
            </div>
          )}
          <label className="profile-picture-upload-btn">
            {uploading ? '...' : '✎'}
            <input type="file" accept="image/*" onChange={handlePictureChange} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>

        <div>
          <h3 style={{ margin: '0 0 0.25rem 0' }}>{profile.full_name || profile.username}</h3>
          <p style={{ margin: 0, textTransform: 'capitalize' }}>
            <span className="role-badge">{profile.role}</span>
          </p>
        </div>
      </div>

      {error && <p style={{ color: 'var(--accent-red)' }}>{error}</p>}

      <div className="profile-details-grid">
        <div className="profile-detail-item">
          <p className="profile-detail-label">Username</p>
          <p className="profile-detail-value">{profile.username}</p>
        </div>
        <div className="profile-detail-item">
          <p className="profile-detail-label">Email</p>
          <p className="profile-detail-value">{profile.email || '—'}</p>
        </div>
        <div className="profile-detail-item">
          <p className="profile-detail-label">Organization</p>
          <p className="profile-detail-value">{profile.organization || '—'}</p>
        </div>
        <div className="profile-detail-item">
          <p className="profile-detail-label">Member Since</p>
          <p className="profile-detail-value">{joinDate}</p>
        </div>
      </div>
    </div>
  )
}

export default ProfileView