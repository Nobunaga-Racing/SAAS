export const saveAuth = (token: string, user: unknown) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getUser = () => {
  if (typeof window === 'undefined') return null
  const u = localStorage.getItem('user')
  if (!u || u === 'undefined' || u === 'null') return null
  try { return JSON.parse(u) } catch { return null }
}

export const isLoggedIn = () =>
  typeof window !== 'undefined' && !!localStorage.getItem('token')
