import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import RosterButton from '@/components/RosterButton'
import { getRoster, type RosterEntry } from '@/lib/roster'

function formatName(name: string) {
  return name.replaceAll('-', ' ')
}

function MyRoster() {
  const [roster, setRoster] = useState<RosterEntry[]>([])

  useEffect(() => {
    setRoster(getRoster())
  }, [])

  return (
    <section id="center" className="mx-auto w-full px-4 py-8">
      <h1>My Roster</h1>

      {roster.length === 0 && <p>Noch keine Pokémon im Roster.</p>}

      {roster.length > 0 && (
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {roster.map((p) => (
            <Link key={p.id} to={`/pokemon/${p.id}`}>
              <Card className="relative items-center text-center transition-shadow hover:shadow-md">
                <RosterButton
                  pokemon={p}
                  className="absolute top-2 right-2"
                  onToggle={(inRoster) => {
                    if (!inRoster) {
                      setRoster((prev) => prev.filter((entry) => entry.id !== p.id))
                    }
                  }}
                />
                <CardContent className="flex flex-col items-center gap-2">
                  <img
                    src={p.spriteUrl}
                    alt={p.name}
                    loading="lazy"
                    className="h-20 w-20"
                  />
                  <CardTitle className="capitalize">
                    {formatName(p.name)}
                  </CardTitle>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default MyRoster
