import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import {
  addToRoster,
  fetchRosterIds,
  MAX_ROSTER_SIZE,
  removeFromRoster,
} from '@/lib/roster'

type RosterContextValue = {
  rosterIds: number[]
  isLoading: boolean
  isInRoster: (id: number) => boolean
  add: (id: number) => Promise<boolean>
  remove: (id: number) => Promise<void>
}

const RosterContext = createContext<RosterContextValue | null>(null)

export function RosterProvider({ children }: { children: ReactNode }) {
  const [rosterIds, setRosterIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRosterIds()
      .then(setRosterIds)
      .catch(() => toast.error('Roster konnte nicht geladen werden.'))
      .finally(() => setIsLoading(false))
  }, [])

  const isInRoster = useCallback(
    (id: number) => rosterIds.includes(id),
    [rosterIds]
  )

  const add = useCallback(
    async (id: number) => {
      if (rosterIds.length >= MAX_ROSTER_SIZE) {
        toast.warning(`Roster ist voll (max. ${MAX_ROSTER_SIZE} Pokémon).`)
        return false
      }

      try {
        const updated = await addToRoster(id)
        setRosterIds(updated)
        return true
      } catch {
        toast.error('Konnte nicht zum Roster hinzugefügt werden.')
        return false
      }
    },
    [rosterIds]
  )

  const remove = useCallback(async (id: number) => {
    try {
      const updated = await removeFromRoster(id)
      setRosterIds(updated)
    } catch {
      toast.error('Konnte nicht aus dem Roster entfernt werden.')
    }
  }, [])

  return (
    <RosterContext.Provider value={{ rosterIds, isLoading, isInRoster, add, remove }}>
      {children}
    </RosterContext.Provider>
  )
}

export function useRoster() {
  const ctx = useContext(RosterContext)
  if (!ctx) throw new Error('useRoster must be used within a RosterProvider')
  return ctx
}
