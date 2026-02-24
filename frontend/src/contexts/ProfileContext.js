import React, { createContext, useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const ProfileContext = createContext(null)

const getProfileUrl = () => {
  const base = process.env.REACT_APP_CHAT_API_URL || ''
  if (!base.trim()) return ''
  return `${base.replace(/\/$/, '')}/api/profile`
}

const emptyProfile = {
  header: { homepage: '', title: 'SM' },
  about: { name: '', role: '', role2: '', role3: '', description: '', social: {} },
  journey: { intro: '', yoe: 0, numProjects: 0, numOrganizations: 0 },
  projects: [],
  skills: [],
  contact: {},
}

const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const url = getProfileUrl()
    if (!url) {
      setLoading(false)
      return
    }
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => {
        setProfile(data)
        setError(null)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load profile')
        setProfile(emptyProfile)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProfileContext.Provider value={{ profile, loading, error }}>
      {children}
    </ProfileContext.Provider>
  )
}

ProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) return { profile: emptyProfile, loading: false, error: null }
  return ctx
}

export { ProfileProvider, useProfile, emptyProfile }
