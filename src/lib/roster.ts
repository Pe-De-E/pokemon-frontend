import { apiFetch } from '@/lib/api'

export const MAX_ROSTER_SIZE = 6

type RosterResponse = {
  pokemonIds: number[]
}

export function fetchRosterIds() {
  return apiFetch<RosterResponse>('/roster').then((res) => res.pokemonIds)
}

export function addToRoster(pokemonId: number) {
  return apiFetch<RosterResponse>('/roster', {
    method: 'POST',
    body: JSON.stringify({ pokemonId }),
  }).then((res) => res.pokemonIds)
}

export function removeFromRoster(pokemonId: number) {
  return apiFetch<RosterResponse>(`/roster/${pokemonId}`, {
    method: 'DELETE',
  }).then((res) => res.pokemonIds)
}
