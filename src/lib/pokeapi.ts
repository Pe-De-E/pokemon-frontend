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

let pokemonIdsPromise: Promise<number[]> | null = null

// PokeAPI's `count` includes alternate forms (Mega, Gmax, ...) whose ids
// aren't contiguous with the base range, so guessing a random id in
// [1, count] frequently 404s. Fetch the real list once and pick from it.
function getAllPokemonIds() {
  if (!pokemonIdsPromise) {
    pokemonIdsPromise = fetchPokemonList(1, 0)
      .then(({ count }) =>
        fetchPokemonList(count, 0).then(({ items }) => items.map((item) => item.id))
      )
      .catch((err: unknown) => {
        pokemonIdsPromise = null
        throw err
      })
  }

  return pokemonIdsPromise
}

export async function fetchRandomPokemonId() {
  const ids = await getAllPokemonIds()
  return ids[Math.floor(Math.random() * ids.length)]
}

export type MoveRef = {
  name: string
  url: string
}

export type PokemonDetail = {
  id: number
  name: string
  spriteUrl: string
  types: string[]
  abilities: string[]
  stats: { name: string; value: number }[]
  moveRefs: MoveRef[]
}

type PokeApiDetailResponse = {
  id: number
  name: string
  sprites: { front_default: string | null }
  types: { type: { name: string } }[]
  abilities: { ability: { name: string } }[]
  stats: { base_stat: number; stat: { name: string } }[]
  moves: { move: MoveRef }[]
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
    moveRefs: data.moves.map((m) => m.move),
  }

  return detail
}

export type Move = {
  name: string
  power: number
  type: string
  accuracy: number | null
}

type PokeApiMoveResponse = {
  name: string
  power: number | null
  accuracy: number | null
  type: { name: string }
}

async function fetchMove(url: string): Promise<Move | null> {
  const res = await fetch(url)
  if (!res.ok) return null

  const data: PokeApiMoveResponse = await res.json()
  if (!data.power) return null

  return {
    name: data.name,
    power: data.power,
    type: data.type.name,
    accuracy: data.accuracy,
  }
}

export async function fetchDamagingMoves(moveRefs: MoveRef[], count = 4) {
  const moves: Move[] = []

  for (const ref of moveRefs) {
    if (moves.length >= count) break
    const move = await fetchMove(ref.url)
    if (move) moves.push(move)
  }

  return moves
}

type PokeApiTypeResponse = {
  damage_relations: {
    double_damage_to: { name: string }[]
    half_damage_to: { name: string }[]
    no_damage_to: { name: string }[]
  }
}

export async function fetchTypeEffectiveness(
  attackType: string,
  defenderTypes: string[]
) {
  const res = await fetch(`${POKEAPI_URL}/type/${attackType}`)
  if (!res.ok) return 1

  const data: PokeApiTypeResponse = await res.json()
  const { double_damage_to, half_damage_to, no_damage_to } = data.damage_relations

  let multiplier = 1
  for (const type of defenderTypes) {
    if (no_damage_to.some((t) => t.name === type)) multiplier *= 0
    else if (double_damage_to.some((t) => t.name === type)) multiplier *= 2
    else if (half_damage_to.some((t) => t.name === type)) multiplier *= 0.5
  }

  return multiplier
}
