// Cliente HTTP genérico para inyección de doble JWT (x-api-token y Authorization)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://proyecto-idgs9-v1.onrender.com';
const APP_TOKEN = import.meta.env.VITE_API_APP_TOKEN || '';

export const apiFetch = async (endpoint, options = {}) => {
  const { method = 'GET', body = null, headers = {} } = options;

  const tokenDeUsuario = localStorage.getItem('utr_token');

  const requestHeaders = {
    'Content-Type': 'application/json',
    'x-api-token': APP_TOKEN,
    ...(tokenDeUsuario ? { Authorization: `Bearer ${tokenDeUsuario}` } : {}),
    ...headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await response.json().catch(() => ({}));

    // Manejo obligatorio de 401 Unauthorized (solo redirige si no estamos ya en /auth/login)
    if (response.status === 401) {
      if (!endpoint.includes('/auth/login')) {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      throw {
        status: 401,
        message: data.message || 'Credenciales inválidas o sesión expirada.',
      };
    }

    // Manejo obligatorio de 403 Forbidden: alerta de acceso restringido
    if (response.status === 403) {
      const errorMsg = data.message || 'Acceso restringido: No tienes permisos para esta acción.';
      alert(errorMsg);
      throw { status: 403, message: errorMsg };
    }

    //Si la solicitud falla tumba la petición 
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || `Error HTTP ${response.status} al procesar la solicitud.`,
      };
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    throw { status: 500, message: 'Error de conexión con el servidor. Verifica tu red o la URL de la API.' };
  }
};