import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/auth'
import './Layout.css'

const links = [
  { to: '/', label: 'Home' },
  { to: '/roster', label: 'My Roster' },
  { to: '/battle', label: 'Battle' },
  { to: '/leaderboard', label: 'Leaderboard' },
]

function Layout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

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
        <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </header>
      <Outlet />
    </>
  )
}

export default Layout
