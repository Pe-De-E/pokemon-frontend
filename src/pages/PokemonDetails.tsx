import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchPokemonDetail, type PokemonDetail } from '@/lib/pokeapi'

function formatLabel(name: string) {
  return name === 'hp' ? 'HP' : name.replaceAll('-', ' ')
}

function PokemonDetails() {
  const { id } = useParams()
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    fetchPokemonDetail(id)
      .then(setPokemon)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [id])

  return (
    <section id="center" className="mx-auto w-full max-w-2xl px-4 py-8">
      {isLoading && <p>Lädt…</p>}
      {error && <p className="text-destructive">{error}</p>}

      {pokemon && (
        <Card className="w-full text-left">
          <CardHeader className="items-center text-center">
            <div className="flex flex-col items-center gap-2">
              <img
                src={pokemon.spriteUrl}
                alt={pokemon.name}
                className="h-32 w-32"
              />
              <CardTitle className="text-2xl capitalize">
                {formatLabel(pokemon.name)}
              </CardTitle>
              <div className="flex flex-wrap justify-center gap-2">
                {pokemon.types.map((type) => (
                  <Badge key={type} variant="secondary" className="capitalize">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Fähigkeiten
              </h2>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map((ability) => (
                  <Badge key={ability} variant="outline" className="capitalize">
                    {formatLabel(ability)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Basiswerte
              </h2>
              <div className="flex flex-col gap-2">
                {pokemon.stats.map((stat) => (
                  <div key={stat.name} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-sm text-muted-foreground capitalize">
                      {formatLabel(stat.name)}
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.min(100, (stat.value / 150) * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-medium">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

export default PokemonDetails
