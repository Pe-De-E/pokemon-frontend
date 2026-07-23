import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import RosterButton from '@/components/RosterButton'
import { useRoster } from '@/context/RosterContext'
import { fetchPokemonDetail, type PokemonDetail } from '@/lib/pokeapi'

function formatName(name: string) {
  return name.replaceAll('-', ' ')
}

function MyRoster() {
  const { rosterIds, isLoading } = useRoster()
  const [pokemon, setPokemon] = useState<PokemonDetail[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (rosterIds.length === 0) {
      setPokemon([])
      setIsLoadingDetails(false)
      return
    }

    setIsLoadingDetails(true)
    Promise.all(rosterIds.map((id) => fetchPokemonDetail(id)))
      .then(setPokemon)
      .finally(() => setIsLoadingDetails(false))
  }, [rosterIds, isLoading])

  const showEmpty = !isLoading && !isLoadingDetails && pokemon.length === 0

  return (
    <section id="center" className="mx-auto w-full px-4 py-8">
      <h1>My Roster</h1>

      {(isLoading || isLoadingDetails) && <p>Lädt…</p>}
      {showEmpty && <p>Noch keine Pokémon im Roster.</p>}

      {!isLoadingDetails && pokemon.length > 0 && (
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pokemon.map((p) => (
            <Link key={p.id} to={`/pokemon/${p.id}`}>
              <Card className="relative items-center text-center transition-shadow hover:shadow-md">
                <RosterButton pokemonId={p.id} className="absolute top-2 right-2" />
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
