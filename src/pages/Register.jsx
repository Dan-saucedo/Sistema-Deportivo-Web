//Registro de usuarios

 import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { apiFetch } from '../services/apiClient.jsx';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    matricula: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.nombre.trim() ||
      !formData.matricula.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: {
          nombre: formData.nombre.trim(),
          matricula: formData.matricula.trim(),
          email: formData.email.trim(),
          password: formData.password,
          rol: 'USER',
        },
      });

      navigate('/login', {
        replace: true,
        state: { registeredMessage: 'Cuenta creada exitosamente. Ahora inicia sesión.' },
      });
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo completar el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <span className="auth-eyebrow">SÉ PARTE DEL EQUIPO</span>
      <h2 className="auth-title">Crea tu cuenta.</h2>
      <p className="auth-subtitle">Regístrate con tus datos de estudiante UTR.</p>

      {errorMsg && <div className="auth-alert-error">{errorMsg}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="nombre">
            Nombre completo
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            className="auth-input"
            placeholder="Tu nombre y apellidos"
            value={formData.nombre}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="matricula">
            Matrícula
          </label>
          <input
            id="matricula"
            name="matricula"
            type="text"
            className="auth-input"
            placeholder="Ej. 2558"
            value={formData.matricula}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

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
            placeholder="Crea una contraseña"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="confirmPassword">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="auth-input"
            placeholder="Repite tu contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <button type="submit" className="auth-btn-submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Crear cuenta →'}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta?
        <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;