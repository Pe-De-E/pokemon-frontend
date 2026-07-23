const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
  } catch {
    throw new ApiError('Server nicht erreichbar. Bitte später erneut versuchen.', 0)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)

    // A 401 from an auth endpoint is a normal, inline-displayable error
    // (e.g. wrong password) — only expired/missing sessions on actual data
    // endpoints should force a trip back to the login page.
    if (res.status === 401 && !path.startsWith('/auth/')) {
      window.location.assign('/login')
    }

    throw new ApiError(body?.message ?? 'Etwas ist schiefgelaufen.', res.status)
  }

  return res.json()
}
