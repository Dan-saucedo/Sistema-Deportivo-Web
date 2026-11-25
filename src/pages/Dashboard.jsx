//PANTALLAS B1 + B2 (Inventario + Solicitar prestamo)
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { apiFetch } from '../services/apiClient.jsx';
import '../styles/dashboard.css';
import '../styles/auth.css';

const CANCHAS_SUGERIDAS = [
  'Cancha Fútbol 7',
  'Cancha Básquetbol Techada',
  'Cancha Voleibol',
  'Torneo Interno UTR',
  'Clase Educación Física',
];

const Dashboard = () => {
  const navigate = useNavigate();

  // Estados de inventario (Pantalla B1)
  const [items, setItems] = useState([]);
  const [selectedSport, setSelectedSport] = useState('TODOS');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Estados del modal de préstamo (Pantalla B2)
  const [selectedItem, setSelectedItem] = useState(null);
  const [loanForm, setLoanForm] = useState({
    cantidad: 1,
    canchaOActividad: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (selectedSport !== 'TODOS') params.append('deporte', selectedSport);
      if (onlyAvailable) params.append('disponible', 'true');

      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await apiFetch(`/api/sports/items${query}`);

      const listaInicial = Array.isArray(data) ? data : data.items || data.data || [];
      const normalizada = listaInicial.map((item) => ({
        id: item.id ?? item._id,
        codigo: item.codigo || 'S/C',
        nombre: item.nombre || 'Artículo deportivo',
        deporte: item.deporte || 'General',
        estadoFisico: item.estadoFisico || item['estado Fisico'] || 'BUENO',
        disponibles: Number(item.disponibles ?? item.cantidadDisponible ?? 0),
      }));

      setItems(normalizada);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo cargar el inventario deportivo.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSport, onlyAvailable]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Obtener disciplinas dinámicas + base
  const sportsList = ['TODOS', ...new Set(['Fútbol', 'Básquetbol', 'Voleibol', ...items.map((i) => i.deporte)])];

  // Manejador estandarizado: selección de filtro o de artículo para préstamo
  const handleSelect = (item) => {
    setSelectedItem(item);
    setLoanForm({ cantidad: 1, canchaOActividad: '' });
    setModalError('');
  };

  // Manejador estandarizado: inputs controlados del modal
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoanForm((prev) => ({
      ...prev,
      [name]: name === 'cantidad' ? Number(value) : value,
    }));
    if (modalError) setModalError('');
  };

  // Manejador estandarizado: envío de solicitud POST /api/sports/loans
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (loanForm.cantidad < 1 || loanForm.cantidad > selectedItem.disponibles) {
      setModalError(`La cantidad debe estar entre 1 y ${selectedItem.disponibles}.`);
      return;
    }

    if (!loanForm.canchaOActividad.trim()) {
      setModalError('Indica la cancha o actividad donde usarás el material.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      await apiFetch('/api/sports/loans', {
        method: 'POST',
        body: {
          itemId: selectedItem.id,
          cantidad: Number(loanForm.cantidad),
          canchaOActividad: loanForm.canchaOActividad.trim(),
        },
      });

      setSelectedItem(null);
      setSuccessToast('Préstamo registrado correctamente. Consulta tu Pase QR en "Mis Préstamos".');
      fetchItems();
    } catch (err) {
      setModalError(err.message || 'Error al registrar la solicitud de préstamo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-container">
        <div className="page-header">
          <div>
            <span className="page-eyebrow">COORDINACIÓN DEPORTIVA UTR</span>
            <h1 className="page-title">Inventario de Material Deportivo</h1>
          </div>
          <button type="button" className="btn-secondary" onClick={() => navigate('/perfil')}>
            Ver mis préstamos activos →
          </button>
        </div>

        {successToast && (
          <div className="auth-alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{successToast}</span>
            <button type="button" onClick={() => setSuccessToast('')} style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
        )}

        {errorMsg && <div className="auth-alert-error">{errorMsg}</div>}

        {/* Filtros por disciplina y disponibilidad */}
        <section className="filters-bar">
          <div className="sport-pills">
            {sportsList.map((sport) => (
              <button
                key={sport}
                type="button"
                className={`pill-btn ${selectedSport === sport ? 'active' : ''}`}
                onClick={() => setSelectedSport(sport)}
              >
                {sport === 'TODOS' ? 'Todas las disciplinas' : sport}
              </button>
            ))}
          </div>

          <label className="checkbox-filter">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            Solo disponibles
          </label>
        </section>

        {/* Listado de artículos */}
        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Cargando catálogo deportivo...
          </p>
        ) : items.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No hay artículos disponibles con los filtros seleccionados.
          </p>
        ) : (
          <section className="items-grid">
            {items.map((item) => (
              <article key={item.id} className="item-card">
                <div>
                  <div className="item-card-top">
                    <span className="item-code">{item.codigo}</span>
                    <span className={`badge-condition cond-${item.estadoFisico}`}>
                      {item.estadoFisico}
                    </span>
                  </div>
                  <div className="item-sport">{item.deporte}</div>
                  <h2 className="item-name">{item.nombre}</h2>
                </div>

                <div className="item-footer">
                  <div className="stock-label">
                    Disponibles
                    <span className={`stock-value ${item.disponibles === 0 ? 'stock-zero' : ''}`}>
                      {item.disponibles} unid.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    disabled={item.disponibles <= 0}
                    onClick={() => handleSelect(item)}
                  >
                    {item.disponibles > 0 ? 'Solicitar' : 'Agotado'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {/* Modal Pantalla B2: Solicitar Préstamo Deportivo */}
      {/* Aqui comienzan las tarjetas de articulos (prestamo) */}
      {selectedItem && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <span className="page-eyebrow">SOLICITUD DE PRÉSTAMO</span>
            <h2 style={{ margin: '0.25rem 0 0.35rem 0', fontSize: '1.35rem' }}>
              {selectedItem.nombre}
            </h2>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748b' }}>
              Código: <strong>{selectedItem.codigo}</strong> · Disponibles:{' '}
              <strong>{selectedItem.disponibles}</strong>
            </p>

            {modalError && <div className="auth-alert-error">{modalError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="cantidad">
                  Cantidad a solicitar
                </label>
                <input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  min={1}
                  max={selectedItem.disponibles}
                  className="auth-input"
                  value={loanForm.cantidad}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="canchaOActividad">
                  Cancha o actividad
                </label>
                <div className="quick-chips">
                  {CANCHAS_SUGERIDAS.map((lugar) => (
                    <button
                      key={lugar}
                      type="button"
                      className="chip-suggestion"
                      onClick={() => setLoanForm((prev) => ({ ...prev, canchaOActividad: lugar }))}
                    >
                      {lugar}
                    </button>
                  ))}
                </div>
                <input
                  id="canchaOActividad"
                  name="canchaOActividad"
                  type="text"
                  className="auth-input"
                  placeholder="Ej. Cancha 2 Torneo"
                  value={loanForm.canchaOActividad}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedItem(null)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Confirmar préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;