import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { fetchPokemonList, type PokemonListItem } from '@/lib/pokeapi'

const PAGE_SIZE = 20

function formatName(name: string) {
  return name.replaceAll('-', ' ')
}

function Home() {
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPokemonList(PAGE_SIZE, 0)
      .then(({ items, count }) => {
        setPokemon(items)
        setCount(count)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  const loadMore = () => {
    setIsLoadingMore(true)
    fetchPokemonList(PAGE_SIZE, pokemon.length)
      .then(({ items }) => setPokemon((prev) => [...prev, ...items]))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoadingMore(false))
  }

  const hasMore = pokemon.length < count

  return (
    <section id="center" className="w-full px-4 py-8">
      <h1>Home</h1>

      {isLoading && <p>Lädt…</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {pokemon.map((p) => (
              <Link key={p.id} to={`/pokemon/${p.id}`}>
                <Card className="items-center text-center transition-shadow hover:shadow-md">
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

          {hasMore && (
            <Button onClick={loadMore} disabled={isLoadingMore} className="mt-6">
              {isLoadingMore ? 'Lädt…' : 'Mehr laden'}
            </Button>
          )}
        </>
      )}
    </section>
  )
}

export default Home
