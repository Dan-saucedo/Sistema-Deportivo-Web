import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Restaura la sesión persistida en localStorage al cargar o recargar la página
  useEffect(() => {
    try {
      const tokenGuardado = localStorage.getItem('utr_token');
      const usuarioGuardado = localStorage.getItem('utr_user');

      //Si el usuario cuenta con sus credenciales entonces no lo bota 
      if (tokenGuardado && usuarioGuardado && usuarioGuardado !== 'undefined') {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      }
    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      localStorage.removeItem('utr_token');
      localStorage.removeItem('utr_user');
    } finally {
      setCargando(false);
    }
  }, []);

  //Guarda el usuario en localStorage con su token y sus credenciales
  const login = (tokenNuevo, userData) => {
    localStorage.setItem('utr_token', tokenNuevo);
    localStorage.setItem('utr_user', JSON.stringify(userData));
    setToken(tokenNuevo);
    setUsuario(userData);
  };

  const logout = () => {
    localStorage.removeItem('utr_token');
    localStorage.removeItem('utr_user');
    setToken(null);
    setUsuario(null);
  };

  // Manejo automático de 401 Unauthorized disparado desde apiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const isAuthenticated = Boolean(token && usuario);
  const isAdmin = usuario?.rol === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{ usuario, token, cargando, isAuthenticated, isAdmin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};