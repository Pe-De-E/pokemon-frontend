import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section id="center">
      <h1>404</h1>
      <p>
        Page not found. <Link to="/">Back to home</Link>
      </p>
    </section>
  )
}

export default NotFound
