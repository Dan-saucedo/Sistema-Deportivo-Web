import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Perfil from './pages/Perfil.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Login/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/perfil' element={<Perfil />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App