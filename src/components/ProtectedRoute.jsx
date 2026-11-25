import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { usuario, token, cargando, estaAutenticado, esAdmin } = useAuth();

  //Si la sesión tarda en refrescar salta un mensaje para verificar la sesión
  if(cargando){
    return(
        <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: '#64748b',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        Verificando sesión...
      </div>
    )
  }

  const tieneSesion = Boolean(estaAutenticado || (token && usuario));
  const usuarioEsAdmin = Boolean(esAdmin || usuario?.rol === 'ADMIN');

  if (!tieneSesion) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !usuarioEsAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;