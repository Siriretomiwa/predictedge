import { createContext, useContext, useState } from 'react'

const NavCtx = createContext(null)

export function NavProvider({ children }) {
  const [page, setPage] = useState('home')
  const navigate = (p) => { setPage(p); window.scrollTo(0, 0) }
  return <NavCtx.Provider value={{ page, navigate }}>{children}</NavCtx.Provider>
}

export function useNav() {
  const ctx = useContext(NavCtx)
  if (!ctx) throw new Error('useNav must be inside NavProvider')
  return ctx
}
