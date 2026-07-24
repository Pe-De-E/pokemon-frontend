import { LogOut } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { RosterProvider } from '@/context/RosterContext'
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
    <RosterProvider>
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut />
          Logout
        </Button>
      </header>
      <Outlet />
    </RosterProvider>
  )
}

export default Layout
