import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Perfil from './pages/Perfil.jsx'
import NotFound from './pages/NotFound.jsx'
import Register from './pages/Register.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Login/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/register' element={<Register/>} />

      //Protegemos las rutas de perfil y dashboard, donde se va la inyeccion de JWT 
      <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path='/perfil' element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App