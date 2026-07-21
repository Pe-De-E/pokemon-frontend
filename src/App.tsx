import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Register from '@/pages/Register'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import PokemonDetails from '@/pages/PokemonDetails'
import MyRoster from '@/pages/MyRoster'
import Battle from '@/pages/Battle'
import Leaderboard from '@/pages/Leaderboard'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon/:id" element={<PokemonDetails />} />
            <Route path="/roster" element={<MyRoster />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
