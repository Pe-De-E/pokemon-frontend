import { useParams } from 'react-router-dom'

function PokemonDetails() {
  const { id } = useParams()

  return (
    <section id="center">
      <h1>Pokémon Details</h1>
      <p>Details for #{id} coming soon.</p>
    </section>
  )
}

export default PokemonDetails
