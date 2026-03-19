const BASE_URL = 'http://localhost:4000/api'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let message = `Erreur ${res.status}`
    try {
      const data = await res.json()
      message = data?.error?.message ?? data?.message ?? message
    } catch {}
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  const json = await res.json()
  // Unwrap API envelope { data: ... }
  return (json?.data !== undefined ? json.data : json) as T
}

export const api = {
  get<T>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: 'GET' })
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) })
  },
  put<T>(path: string, body: unknown): Promise<T> {
    return apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) })
  },
  delete(path: string): Promise<void> {
    return apiFetch<void>(path, { method: 'DELETE' })
  },
  patch<T>(path: string, body: unknown): Promise<T> {
    return apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  },
}
