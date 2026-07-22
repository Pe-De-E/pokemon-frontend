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

    if (inRoster) {
      removeFromRoster(pokemon.id)
      setInRoster(false)
      onToggle?.(false)
      return
    }

    const updated = addToRoster(pokemon)
    const added = updated.some((p) => p.id === pokemon.id)
    setInRoster(added)
    onToggle?.(added)
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
