import { useEffect, useState } from 'react'
import { ApiError } from '@/lib/api'
import { fetchLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
      .then(setEntries)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : 'Leaderboard konnte nicht geladen werden.'
        )
      )
  }, [])

  return (
    <section id="center" className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1>Leaderboard</h1>

      {!entries && !error && <p>Lädt…</p>}
      {error && <p className="text-destructive">{error}</p>}
      {entries && entries.length === 0 && <p>Noch keine Einträge.</p>}

      {entries && entries.length > 0 && (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 font-medium text-muted-foreground">#</th>
                <th className="py-2 pr-4 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="py-2 pr-4 font-medium text-muted-foreground">
                  Score
                </th>
                <th className="py-2 font-medium text-muted-foreground">
                  Datum
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={entry._id} className="border-b last:border-0">
                  <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                  <td className="py-2 pr-4">{entry.userId.name}</td>
                  <td className="py-2 pr-4 font-semibold">{entry.score}</td>
                  <td className="py-2 text-muted-foreground">
                    {formatDate(entry.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Leaderboard
