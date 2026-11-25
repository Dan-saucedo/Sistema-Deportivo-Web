//Aquí comenzamos nuestro componente core 
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { apiFetch } from '../services/apiClient.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, estaAutenticado, esAdmin  } = useAuth();

  useEffect(()=> {
    if(estaAutenticado){
      navigate(esAdmin ? '/admin' : '/dashboard', {replace: true})
    }
  }, [estaAutenticado, esAdmin, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const successMsg = location.state?.registeredMessage || '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Por favor completa tu correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: formData.email.trim(),
          password: formData.password,
        },
      });

      const normalizedUser = {
        ...response.user,
        rol: response.user?.rol || response.user?.role || 'USER',
      };

      login(response.token, normalizedUser);

      if (normalizedUser.rol === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <span className="auth-eyebrow">BIENVENIDO DE NUEVO</span>
      <h2 className="auth-title">Entra al juego.</h2>
      <p className="auth-subtitle">Tu material deportivo, a unos clics.</p>

      {successMsg && <div className="auth-alert-success">{successMsg}</div>}
      {errorMsg && <div className="auth-alert-error">{errorMsg}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="auth-input"
            placeholder="nombre@utr.edu.mx"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="auth-input"
            placeholder="*********"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <button type="submit" className="auth-btn-submit" disabled={isLoading}>
          {isLoading ? 'Conectando...' : 'Iniciar sesión →'}
        </button>
      </form>

      <p className="auth-switch">
        ¿Aún no tienes cuenta?
        <Link to="/register">Regístrate</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;