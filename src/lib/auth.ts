import { apiFetch } from '@/lib/api'
import { clearRoster } from '@/lib/roster'

export async function checkSession() {
  try {
    await apiFetch('/auth/me')
    return true
  } catch {
    return false
  }
}

export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' })
  } catch {
    // Cookie is HttpOnly and expires server-side either way; nothing more
    // we can do client-side if this request fails.
  }
  clearRoster()
}
