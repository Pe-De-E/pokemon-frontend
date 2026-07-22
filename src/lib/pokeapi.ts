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

export type PokemonDetail = {
  id: number
  name: string
  spriteUrl: string
  types: string[]
  abilities: string[]
  stats: { name: string; value: number }[]
}

type PokeApiDetailResponse = {
  id: number
  name: string
  sprites: { front_default: string | null }
  types: { type: { name: string } }[]
  abilities: { ability: { name: string } }[]
  stats: { base_stat: number; stat: { name: string } }[]
}

export async function fetchPokemonDetail(id: string | number) {
  const res = await fetch(`${POKEAPI_URL}/pokemon/${id}`)

  if (!res.ok) {
    throw new Error('Pokémon konnte nicht geladen werden.')
  }

  const data: PokeApiDetailResponse = await res.json()

  const detail: PokemonDetail = {
    id: data.id,
    name: data.name,
    spriteUrl: data.sprites.front_default ?? spriteUrl(data.id),
    types: data.types.map((t) => t.type.name),
    abilities: data.abilities.map((a) => a.ability.name),
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  }

  return detail
}
