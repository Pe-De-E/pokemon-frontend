import { type MouseEvent } from 'react'
import { Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRoster } from '@/context/RosterContext'

type RosterButtonProps = {
  pokemonId: number
  className?: string
}

function RosterButton({ pokemonId, className }: RosterButtonProps) {
  const { isInRoster, isLoading, add, remove } = useRoster()
  const inRoster = isInRoster(pokemonId)

  const toggle = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (inRoster) {
      await remove(pokemonId)
    } else {
      await add(pokemonId)
    }
  }

  return (
    <Button
      type="button"
      variant={inRoster ? 'default' : 'outline'}
      size="icon-sm"
      onClick={toggle}
      disabled={isLoading}
      aria-label={inRoster ? 'Aus Roster entfernen' : 'Zum Roster hinzufügen'}
      aria-pressed={inRoster}
      className={className}
    >
      <Swords className="size-4" />
    </Button>
  )
}

export default RosterButton
