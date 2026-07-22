import { useEffect, useState, type MouseEvent } from 'react'
import { Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addToRoster, isInRoster, removeFromRoster, type RosterEntry } from '@/lib/roster'

type RosterButtonProps = {
  pokemon: RosterEntry
  className?: string
  onToggle?: (inRoster: boolean) => void
}

function RosterButton({ pokemon, className, onToggle }: RosterButtonProps) {
  const [inRoster, setInRoster] = useState(false)

  useEffect(() => {
    setInRoster(isInRoster(pokemon.id))
  }, [pokemon.id])

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const nextInRoster = !inRoster
    if (nextInRoster) {
      addToRoster(pokemon)
    } else {
      removeFromRoster(pokemon.id)
    }
    setInRoster(nextInRoster)
    onToggle?.(nextInRoster)
  }

  return (
    <Button
      type="button"
      variant={inRoster ? 'default' : 'outline'}
      size="icon-sm"
      onClick={toggle}
      aria-label={inRoster ? 'Aus Roster entfernen' : 'Zum Roster hinzufügen'}
      aria-pressed={inRoster}
      className={className}
    >
      <Swords className="size-4" />
    </Button>
  )
}

export default RosterButton
