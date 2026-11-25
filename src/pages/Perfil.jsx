import { useState, useEffect, useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';
import '../styles/admin.css';
import '../styles/auth.css';

const Perfil = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Garantiza tener siempre los datos completos del estudiante desde contexto o localStorage
  const currentUser = useMemo(() => {
    if (user?.nombre && user?.matricula) return user;
    try {
      const stored = JSON.parse(localStorage.getItem('utr_user') || '{}');
      return stored?.user ? stored.user : stored;
    } catch {
      return user || {};
    }
  }, [user]);

  const fetchMyLoans = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await apiFetch('/api/sports/loans');
      const rawList = Array.isArray(data) ? data : data.loans || data.data || [];

      const normalized = rawList.map((loan) => ({
        loanId: loan.loanId ?? loan.loanld ?? loan.id ?? loan._id,
        item: typeof loan.item === 'object' ? loan.item?.nombre : loan.item || 'Material deportivo',
        cantidad: Number(loan.cantidad ?? 1),
        canchaOActividad: loan.canchaOActividad || 'Campus UTR',
        estatus: (loan.estatus || 'ACTIVO').toUpperCase(),
        horaSalida: loan.horaSalida || loan.createdAt || null,
        userId: loan.userId ?? loan.usuarioId ?? null,
      }));

      const userLoans =
        currentUser?.rol === 'USER' && normalized.some((loan) => loan.userId !== null)
          ? normalized.filter((loan) => Number(loan.userId) === Number(currentUser.id))
          : normalized;

      setLoans(userLoans);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo cargar tu historial de préstamos.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMyLoans();
  }, [fetchMyLoans]);

  const handleSelect = (filter) => {
    setStatusFilter(filter);
  };

  const filteredLoans = loans.filter((loan) =>
    statusFilter === 'TODOS' ? true : loan.estatus === statusFilter
  );

  const formatDate = (isoString) => {
    if (!isoString) return 'Registrado hoy';
    const date = new Date(isoString);
    return Number.isNaN(date.getTime())
      ? isoString
      : date.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-container">
        {/* Tarjeta de datos del estudiante */}
        <section className="profile-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="profile-avatar">
              {(currentUser?.nombre || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="page-eyebrow">PERFIL DE ESTUDIANTE UTR</span>
              <h1 style={{ margin: '0.15rem 0', fontSize: '1.45rem', fontWeight: 800 }}>
                {currentUser?.nombre || 'Estudiante UTR'}
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Matrícula: <strong>{currentUser?.matricula || 'N/A'}</strong>
                {currentUser?.email ? ` · ${currentUser.email}` : ''}
              </p>
            </div>
          </div>

          <button type="button" className="btn-secondary" onClick={fetchMyLoans}>
            Actualizar lista
          </button>
        </section>

        <div className="page-header">
          <div>
            <span className="page-eyebrow">HISTORIAL Y PASES DIGITALES</span>
            <h2 className="page-title">Mis Préstamos Deportivos</h2>
          </div>

          <div className="sport-pills">
            {['TODOS', 'ACTIVO', 'FINALIZADO'].map((status) => (
              <button
                key={status}
                type="button"
                className={`pill-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => handleSelect(status)}
              >
                {status === 'TODOS' ? 'Todos' : status}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && <div className="auth-alert-error">{errorMsg}</div>}

        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Cargando tus préstamos...
          </p>
        ) : filteredLoans.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No tienes préstamos registrados en esta categoría.
          </p>
        ) : (
          <section className="loans-grid">
            {filteredLoans.map((loan) => {
              const isActive = loan.estatus === 'ACTIVO';
              const qrPayload = JSON.stringify({
                folio: loan.loanId,
                matricula: currentUser?.matricula || 'S/M',
                material: loan.item,
              });

              return (
                <article
                  key={loan.loanId}
                  className={`loan-card ${isActive ? 'active-loan' : ''}`}
                >
                  <div>
                    <div className="item-card-top">
                      <span className="item-code">Folio #{loan.loanId}</span>
                      <span className={`status-pill status-${loan.estatus}`}>
                        {loan.estatus}
                      </span>
                    </div>

                    <h3 className="item-name" style={{ marginBottom: '0.5rem' }}>
                      {loan.item}
                    </h3>

                    <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#475569' }}>
                      <strong>Cantidad:</strong> {loan.cantidad} unid.
                    </p>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#475569' }}>
                      <strong>Cancha / Actividad:</strong> {loan.canchaOActividad}
                    </p>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.82rem', color: '#64748b' }}>
                      <strong>Salida:</strong> {formatDate(loan.horaSalida)}
                    </p>
                  </div>

                  {isActive && (
                    <div className="qr-box">
                      <QRCodeSVG value={qrPayload} size={76} />
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: '#e11d48',
                          }}
                        >
                          PASE DE DEVOLUCIÓN · MAT. {currentUser?.matricula || 'S/M'}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#475569' }}>
                          Presenta este código en Coordinación Deportiva para recibir tu material.
                        </span>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default Perfil;