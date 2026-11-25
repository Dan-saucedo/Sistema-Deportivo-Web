import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/dashboard.css';

const Navbar = () => {
  const { usuario, esAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        <span className="navbar-logo">UTR</span>
        <span className="navbar-title">Material Deportivo</span>
      </NavLink>

      <nav className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Inventario
        </NavLink>
        <NavLink
          to="/perfil"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Mis Préstamos
        </NavLink>
        {esAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Panel Admin
          </NavLink>
        )}
      </nav>

      <div className="navbar-user">
        <div className="user-chip">
          <span className="user-chip-name">{usuario?.nombre || 'Estudiante UTR'}</span>
          <span className="user-chip-role">
            {usuario?.matricula ? `${usuario.matricula} · ` : ''}
            {usuario?.rol}
          </span>
        </div>
        <button type="button" onClick={handleLogout} className="btn-logout">
          Salir
        </button>
      </div>
    </header>
  );
};

export default Navbar;