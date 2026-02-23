import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthCtx = createContext(null)

const STORAGE_KEY = 'pe_user_v1'
const SAVES_KEY   = 'pe_saved_picks'

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)   // null = not logged in
  const [authModal, setAuthModal] = useState(false) // show signup/login modal
  const [savedPicks, setSavedPicks] = useState([])
  const [loading, setLoading]   = useState(true)

  // Load from storage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
      const saves = localStorage.getItem(SAVES_KEY)
      if (saves) setSavedPicks(JSON.parse(saves))
    } catch {}
    setLoading(false)
  }, [])

  const signUp = useCallback(({ name, email }) => {
    const u = {
      id:        `u_${Date.now()}`,
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      joinedAt:  new Date().toISOString(),
      avatar:    name.trim()[0].toUpperCase(),
      // Everyone gets full access — premiums are "coming soon"
      plan:      'FREE',
      streak:    0,
      totalPicks: 0,
      points:    0,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
    setAuthModal(false)
    return u
  }, [])

  const logOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev
      const next = { ...prev, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const savePick = useCallback((pick) => {
    setSavedPicks(prev => {
      const exists = prev.find(p => p.id === pick.id)
      const next = exists ? prev.filter(p => p.id !== pick.id) : [...prev, { ...pick, savedAt: new Date().toISOString() }]
      localStorage.setItem(SAVES_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isPickSaved = useCallback((id) => savedPicks.some(p => p.id === id), [savedPicks])

  return (
    <AuthCtx.Provider value={{ user, loading, authModal, setAuthModal, signUp, logOut, updateUser, savedPicks, savePick, isPickSaved }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
