import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

const links = [
  { to: '/', label: 'Home' },
  { to: '/roster', label: 'My Roster' },
  { to: '/battle', label: 'Battle' },
  { to: '/leaderboard', label: 'Leaderboard' },
]

function Layout() {
  return (
    <>
      <header id="nav">
        <span id="nav-brand">Pokémon</span>
        <nav>
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
    </>
  )
}

export default Layout
