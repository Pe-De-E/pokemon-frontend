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
    throw new ApiError(body?.message ?? 'Etwas ist schiefgelaufen.', res.status)
  }

  return res.json()
}
