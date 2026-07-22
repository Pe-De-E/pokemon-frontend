const POKEAPI_URL = 'https://pokeapi.co/api/v2'

export type PokemonListItem = {
  id: number
  name: string
  spriteUrl: string
}

type PokeApiListResponse = {
  count: number
  results: { name: string; url: string }[]
}

function idFromUrl(url: string) {
  const match = url.match(/\/pokemon\/(\d+)\/?$/)
  return Number(match?.[1])
}

function spriteUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export async function fetchPokemonList(limit = 20, offset = 0) {
  const res = await fetch(`${POKEAPI_URL}/pokemon?limit=${limit}&offset=${offset}`)

  if (!res.ok) {
    throw new Error('Pokémon-Liste konnte nicht geladen werden.')
  }

  const data: PokeApiListResponse = await res.json()

  const items = data.results.map(({ name, url }): PokemonListItem => {
    const id = idFromUrl(url)
    return { id, name, spriteUrl: spriteUrl(id) }
  })

  return { items, count: data.count }
}
