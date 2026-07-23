import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useRoster } from '@/context/RosterContext'
import { MAX_ROSTER_SIZE } from '@/lib/roster'
import {
  fetchDamagingMoves,
  fetchPokemonDetail,
  fetchRandomPokemonId,
  fetchTypeEffectiveness,
  type Move,
  type PokemonDetail,
} from '@/lib/pokeapi'
import { postScore } from '@/lib/leaderboard'

const POINTS_PER_KO = 100
const WIN_BONUS = 200

function calculateScore(defeatedCount: number, won: boolean) {
  return defeatedCount * POINTS_PER_KO + (won ? WIN_BONUS : 0)
}

function formatLabel(name: string) {
  return name.replaceAll('-', ' ')
}

function capitalizeLabel(name: string) {
  return formatLabel(name)
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStat(pokemon: PokemonDetail, name: string) {
  return pokemon.stats.find((s) => s.name === name)?.value ?? 50
}

function calculateDamage(
  move: Move,
  attacker: PokemonDetail,
  defender: PokemonDetail,
  typeMultiplier: number
) {
  if (typeMultiplier === 0) return 0
  const atk = getStat(attacker, 'attack')
  const def = getStat(defender, 'defense')
  return Math.max(1, Math.round(move.power * (atk / def) * typeMultiplier * 0.4))
}

function effectivenessLabel(multiplier: number) {
  if (multiplier === 0) return 'Keine Wirkung'
  if (multiplier > 1) return 'Sehr effektiv!'
  if (multiplier < 1) return 'Nicht sehr effektiv'
  return null
}

function effectivenessColor(multiplier: number) {
  if (multiplier === 0) return 'text-muted-foreground'
  if (multiplier > 1) return 'text-red-600 dark:text-red-400'
  if (multiplier < 1) return 'text-blue-600 dark:text-blue-400'
  return ''
}

type Side = 'player' | 'opponent'

type LogEntry =
  | {
      type: 'attack'
      side: Side
      attacker: string
      move: string
      damage: number
      multiplier: number
    }
  | { type: 'faint'; side: Side; name: string }
  | { type: 'switch'; side: Side; from: string; to: string }

function LogLine({ entry }: { entry: LogEntry }) {
  const alignment =
    entry.side === 'player'
      ? 'self-start text-left'
      : 'self-end text-right'

  if (entry.type === 'faint') {
    return (
      <p className={cn('max-w-[85%] font-medium text-destructive', alignment)}>
        {capitalizeLabel(entry.name)} wurde besiegt!
      </p>
    )
  }

  if (entry.type === 'switch') {
    return (
      <p className={cn('max-w-[85%] text-muted-foreground', alignment)}>
        Wechsel: <span className="font-medium">{capitalizeLabel(entry.from)}</span>{' '}
        → <span className="font-medium">{capitalizeLabel(entry.to)}</span>
      </p>
    )
  }

  const label = effectivenessLabel(entry.multiplier)

  return (
    <p className={cn('max-w-[85%]', alignment)}>
      <span className="font-medium">{capitalizeLabel(entry.attacker)}</span>{' '}
      setzt <span className="italic">{capitalizeLabel(entry.move)}</span> ein –{' '}
      <span className="font-semibold text-orange-600 dark:text-orange-400">
        {entry.damage} Schaden
      </span>
      {label && (
        <>
          {' '}
          <span className={cn('font-medium', effectivenessColor(entry.multiplier))}>
            ({label})
          </span>
        </>
      )}
    </p>
  )
}

type TeamSlot = {
  id: number
  spriteUrl: string | null
  fainted: boolean
}

function TeamRow({
  slots,
  activeIndex,
  onSelect,
  selectDisabled,
}: {
  slots: TeamSlot[]
  activeIndex: number
  onSelect?: (index: number) => void
  selectDisabled?: boolean
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {slots.map((slot, i) => {
        const disabled =
          !onSelect || selectDisabled || slot.fainted || i === activeIndex
        return (
          <button
            key={`${slot.id}-${i}`}
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(i)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border bg-muted transition-colors',
              i === activeIndex && !slot.fainted && 'border-primary',
              slot.fainted && 'opacity-30 grayscale',
              !disabled && 'cursor-pointer hover:border-primary/50',
              disabled && 'cursor-default'
            )}
          >
            {slot.spriteUrl ? (
              <img src={slot.spriteUrl} alt="" className="h-8 w-8" />
            ) : (
              <span className="text-muted-foreground">?</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

type FighterCardProps = {
  pokemon: PokemonDetail | null
  moves: Move[] | null
  hp: number
  maxHp: number
  onSelectMove?: (move: Move) => void
  movesDisabled?: boolean
}

function FighterCard({
  pokemon,
  moves,
  hp,
  maxHp,
  onSelectMove,
  movesDisabled,
}: FighterCardProps) {
  if (!pokemon) return <p>Lädt…</p>

  return (
    <Card className="w-full items-center text-center">
      <CardContent className="flex w-full flex-col items-center gap-2">
        <img src={pokemon.spriteUrl} alt={pokemon.name} className="h-28 w-28" />
        <CardTitle className="capitalize">{formatLabel(pokemon.name)}</CardTitle>
        <div className="flex flex-wrap justify-center gap-2">
          {pokemon.types.map((type) => (
            <Badge key={type} variant="secondary" className="capitalize">
              {type}
            </Badge>
          ))}
        </div>

        <div className="flex w-full items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-muted">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                hp / maxHp > 0.5
                  ? 'bg-primary'
                  : hp / maxHp > 0.2
                    ? 'bg-yellow-500'
                    : 'bg-destructive'
              )}
              style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-sm font-medium">
            {Math.max(0, hp)}/{maxHp}
          </span>
        </div>

        <div className="mt-2 flex w-full flex-col gap-1.5">
          {moves === null && (
            <p className="text-sm text-muted-foreground">Attacken laden…</p>
          )}
          {moves?.map((move) =>
            onSelectMove ? (
              <button
                key={move.name}
                type="button"
                disabled={movesDisabled}
                onClick={() => onSelectMove(move)}
                className="flex items-center justify-between rounded-md border px-2 py-1 text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="capitalize">{formatLabel(move.name)}</span>
                <span className="flex items-center gap-1.5">
                  <Badge variant="outline" className="capitalize">
                    {move.type}
                  </Badge>
                  <span className="text-muted-foreground">{move.power} DMG</span>
                </span>
              </button>
            ) : (
              <div
                key={move.name}
                className="flex items-center justify-between rounded-md border px-2 py-1 text-sm"
              >
                <span className="capitalize">{formatLabel(move.name)}</span>
                <span className="flex items-center gap-1.5">
                  <Badge variant="outline" className="capitalize">
                    {move.type}
                  </Badge>
                  <span className="text-muted-foreground">{move.power} DMG</span>
                </span>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function randomTeamSize() {
  return Math.floor(Math.random() * MAX_ROSTER_SIZE) + 1
}

function Battle() {
  const { rosterIds: playerIds, isLoading: isRosterLoading } = useRoster()
  const [playerIndex, setPlayerIndex] = useState(0)
  const [playerRevealed, setPlayerRevealed] = useState<
    (PokemonDetail | null)[]
  >([])
  const [opponentIds, setOpponentIds] = useState<number[]>([])
  const [opponentIndex, setOpponentIndex] = useState(0)
  const [opponentRevealed, setOpponentRevealed] = useState<
    (PokemonDetail | null)[]
  >([])

  const [fighter, setFighter] = useState<PokemonDetail | null>(null)
  const [fighterMoves, setFighterMoves] = useState<Move[] | null>(null)
  const [opponent, setOpponent] = useState<PokemonDetail | null>(null)
  const [opponentMoves, setOpponentMoves] = useState<Move[] | null>(null)

  const [fighterHp, setFighterHp] = useState(0)
  const [opponentHp, setOpponentHp] = useState(0)
  const [turn, setTurn] = useState<'player' | 'opponent'>('player')
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [isResolving, setIsResolving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [faintedIndices, setFaintedIndices] = useState<Set<number>>(new Set())

  // Persists each team member's HP across voluntary switches (indexed by
  // roster position), so switching back in doesn't heal them to full.
  const playerHpRef = useRef<Record<number, number>>({})

  const loadFighter = (index: number) => {
    const id = playerIds[index]
    setFighter(null)
    setFighterMoves(null)
    return fetchPokemonDetail(id)
      .then((detail) => {
        const maxHp = getStat(detail, 'hp')
        const hp = playerHpRef.current[index] ?? maxHp
        playerHpRef.current[index] = hp
        setFighter(detail)
        setFighterHp(hp)
        setPlayerRevealed((prev) => prev.map((p, i) => (i === index ? detail : p)))
        fetchDamagingMoves(detail.moveRefs).then(setFighterMoves)
        return { detail, hp }
      })
      .catch(() => {
        setLoadError('Dein Pokémon konnte nicht geladen werden.')
        return null
      })
  }

  const loadOpponent = (id: number, index: number) => {
    setOpponent(null)
    setOpponentMoves(null)
    fetchPokemonDetail(id)
      .then((detail) => {
        setOpponent(detail)
        setOpponentHp(getStat(detail, 'hp'))
        setOpponentRevealed((prev) => prev.map((p, i) => (i === index ? detail : p)))
        fetchDamagingMoves(detail.moveRefs).then(setOpponentMoves)
      })
      .catch(() => setLoadError('Das gegnerische Pokémon konnte nicht geladen werden.'))
  }

  const startNewBattle = useCallback(() => {
    setPlayerIndex(0)
    setOpponentIndex(0)
    setWinner(null)
    setLog([])
    setLoadError(null)
    setFaintedIndices(new Set())
    setPlayerRevealed(playerIds.map(() => null))
    playerHpRef.current = {}

    if (playerIds[0]) loadFighter(0)

    const size = randomTeamSize()
    Promise.all(Array.from({ length: size }, () => fetchRandomPokemonId()))
      .then((ids) => {
        setOpponentIds(ids)
        setOpponentRevealed(ids.map(() => null))
        loadOpponent(ids[0], 0)
      })
      .catch(() => setLoadError('Der Gegner konnte nicht geladen werden.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerIds])

  useEffect(() => {
    startNewBattle()
  }, [startNewBattle])

  // Guards against posting the same result twice (e.g. React StrictMode's
  // double effect invocation in dev).
  const scorePostedRef = useRef(false)

  useEffect(() => {
    if (!winner) {
      scorePostedRef.current = false
      return
    }
    if (scorePostedRef.current) return
    scorePostedRef.current = true

    const defeatedCount = winner === 'player' ? opponentIds.length : opponentIndex
    const score = calculateScore(defeatedCount, winner === 'player')

    postScore(score)
      .then(() => toast.success(`Score gespeichert: ${score} Punkte`))
      .catch(() => toast.error('Score konnte nicht gespeichert werden.'))
  }, [winner, opponentIds.length, opponentIndex])

  const handleAttack = async (move: Move) => {
    if (!fighter || !opponent || turn !== 'player' || isResolving || winner) return
    setIsResolving(true)

    const playerMultiplier = await fetchTypeEffectiveness(move.type, opponent.types)
    const playerDamage = calculateDamage(move, fighter, opponent, playerMultiplier)
    const newOpponentHp = Math.max(0, opponentHp - playerDamage)
    setOpponentHp(newOpponentHp)
    setLog((prev) => [
      ...prev,
      {
        type: 'attack',
        side: 'player',
        attacker: fighter.name,
        move: move.name,
        damage: playerDamage,
        multiplier: playerMultiplier,
      },
    ])

    if (newOpponentHp <= 0) {
      setLog((prev) => [
        ...prev,
        { type: 'faint', side: 'opponent', name: opponent.name },
      ])
      const nextOpponentIndex = opponentIndex + 1
      if (nextOpponentIndex < opponentIds.length) {
        setOpponentIndex(nextOpponentIndex)
        loadOpponent(opponentIds[nextOpponentIndex], nextOpponentIndex)
        setTurn('player')
      } else {
        setWinner('player')
      }
      setIsResolving(false)
      return
    }

    setTurn('opponent')
    await resolveOpponentTurn(fighter, playerIndex, fighterHp)
    setIsResolving(false)
  }

  // Runs the opponent's counter-attack against whichever player Pokémon is
  // currently active (used both after a player attack and after a switch).
  const resolveOpponentTurn = async (
    activeFighter: PokemonDetail,
    activeIndex: number,
    activeHp: number
  ) => {
    if (!opponent) return

    const opponentMove = opponentMoves?.[Math.floor(Math.random() * opponentMoves.length)]
    if (!opponentMove) {
      setTurn('player')
      return
    }

    const opponentMultiplier = await fetchTypeEffectiveness(
      opponentMove.type,
      activeFighter.types
    )
    const opponentDamage = calculateDamage(
      opponentMove,
      opponent,
      activeFighter,
      opponentMultiplier
    )
    const newFighterHp = Math.max(0, activeHp - opponentDamage)
    setFighterHp(newFighterHp)
    playerHpRef.current[activeIndex] = newFighterHp
    setLog((prev) => [
      ...prev,
      {
        type: 'attack',
        side: 'opponent',
        attacker: opponent.name,
        move: opponentMove.name,
        damage: opponentDamage,
        multiplier: opponentMultiplier,
      },
    ])

    if (newFighterHp <= 0) {
      setLog((prev) => [
        ...prev,
        { type: 'faint', side: 'player', name: activeFighter.name },
      ])
      const updatedFainted = new Set(faintedIndices)
      updatedFainted.add(activeIndex)
      setFaintedIndices(updatedFainted)

      const nextIndex = playerIds.findIndex((_, i) => !updatedFainted.has(i))
      if (nextIndex !== -1) {
        setPlayerIndex(nextIndex)
        loadFighter(nextIndex)
        setTurn('player')
      } else {
        setWinner('opponent')
      }
    } else {
      setTurn('player')
    }
  }

  const handleSwitch = async (index: number) => {
    if (!opponent || turn !== 'player' || isResolving || winner) return
    if (index === playerIndex || faintedIndices.has(index)) return

    setIsResolving(true)
    const fromName = fighter?.name
    setPlayerIndex(index)

    const result = await loadFighter(index)
    if (!result) {
      setIsResolving(false)
      return
    }

    if (fromName) {
      setLog((prev) => [
        ...prev,
        { type: 'switch', side: 'player', from: fromName, to: result.detail.name },
      ])
    }

    setTurn('opponent')
    await resolveOpponentTurn(result.detail, index, result.hp)
    setIsResolving(false)
  }

  if (isRosterLoading) {
    return (
      <section id="center">
        <p>Lädt…</p>
      </section>
    )
  }

  if (playerIds.length === 0) {
    return (
      <section id="center" className="mx-auto w-full max-w-sm px-4 text-center">
        <h1>Battle</h1>
        <p>
          Du brauchst mindestens ein Pokémon in deinem Roster, um antreten zu
          können.
        </p>
        <Link to="/" className={cn('mt-2', 'underline')}>
          Zur Pokémon-Liste
        </Link>
      </section>
    )
  }

  const playerSlots: TeamSlot[] = playerIds.map((id, i) => ({
    id,
    spriteUrl: playerRevealed[i]?.spriteUrl ?? null,
    fainted: faintedIndices.has(i),
  }))

  const opponentSlots: TeamSlot[] = opponentIds.map((id, i) => ({
    id,
    spriteUrl: opponentRevealed[i]?.spriteUrl ?? null,
    fainted: i < opponentIndex,
  }))

  return (
    <section id="center" className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1>Battle</h1>

      {loadError && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-destructive">{loadError}</p>
          <Button type="button" variant="outline" onClick={startNewBattle}>
            Erneut versuchen
          </Button>
        </div>
      )}

      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">
            Dein Team ({playerIds.length})
          </span>
          <TeamRow
            slots={playerSlots}
            activeIndex={playerIndex}
            onSelect={handleSwitch}
            selectDisabled={turn !== 'player' || isResolving || Boolean(winner)}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">
            Gegner-Team ({opponentIds.length || '…'})
          </span>
          <TeamRow slots={opponentSlots} activeIndex={opponentIndex} />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <FighterCard
          pokemon={fighter}
          moves={fighterMoves}
          hp={fighterHp}
          maxHp={fighter ? getStat(fighter, 'hp') : 1}
          onSelectMove={handleAttack}
          movesDisabled={turn !== 'player' || isResolving || Boolean(winner)}
        />
        <span className="mt-8 text-sm font-semibold text-muted-foreground">
          VS
        </span>
        <FighterCard
          pokemon={opponent}
          moves={opponentMoves}
          hp={opponentHp}
          maxHp={opponent ? getStat(opponent, 'hp') : 1}
        />
      </div>

      {winner && (
        <div className="flex flex-col items-center gap-3">
          <p
            className={cn(
              'text-lg font-semibold',
              winner === 'player'
                ? 'text-green-600 dark:text-green-400'
                : 'text-destructive'
            )}
          >
            {winner === 'player' ? 'Du hast gewonnen! 🎉' : 'Du hast verloren.'}
          </p>
          <Button type="button" onClick={startNewBattle}>
            Nochmal spielen
          </Button>
        </div>
      )}

      {log.length > 0 && (
        <div className="flex w-full flex-col gap-1 text-left text-sm">
          {[...log].reverse().map((entry, i) => (
            <LogLine key={log.length - 1 - i} entry={entry} />
          ))}
        </div>
      )}

      <Button type="button" variant="outline" onClick={startNewBattle}>
        Neuer Kampf
      </Button>
    </section>
  )
}

export default Battle
