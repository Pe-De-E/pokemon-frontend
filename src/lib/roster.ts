export type RosterEntry = {
  id: number
  name: string
  spriteUrl: string
}

const ROSTER_KEY = 'roster'
export const MAX_ROSTER_SIZE = 6

export function getRoster(): RosterEntry[] {
  const raw = localStorage.getItem(ROSTER_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as RosterEntry[]
  } catch {
    return []
  }
}

function saveRoster(roster: RosterEntry[]) {
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster))
  return roster
}

export function addToRoster(entry: RosterEntry) {
  const roster = getRoster()
  if (roster.some((p) => p.id === entry.id)) return roster
  if (roster.length >= MAX_ROSTER_SIZE) return roster
  return saveRoster([...roster, entry])
}

export function removeFromRoster(id: number) {
  return saveRoster(getRoster().filter((p) => p.id !== id))
}

export function isInRoster(id: number) {
  return getRoster().some((p) => p.id === id)
}

export function clearRoster() {
  localStorage.removeItem(ROSTER_KEY)
}
