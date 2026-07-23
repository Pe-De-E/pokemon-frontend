import { apiFetch } from '@/lib/api'

export type LeaderboardEntry = {
  _id: string
  userId: { _id: string; name: string }
  score: number
  date: string
}

export function fetchLeaderboard() {
  return apiFetch<LeaderboardEntry[]>('/leaderboard')
}

export function postScore(score: number) {
  return apiFetch<LeaderboardEntry>('/leaderboard', {
    method: 'POST',
    body: JSON.stringify({ score }),
  })
}
