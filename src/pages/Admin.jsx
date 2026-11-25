//PANTALLA B4 (Panel admin + usuarios)

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../services/apiClient';
import '../styles/dashboard.css';
import '../styles/admin.css';
import '../styles/auth.css';

const INITIAL_ITEM_FORM = {
  codigo: '',
  nombre: '',
  deporte: 'Fútbol',
  estadoFisico: 'NUEVO',
  cantidadTotal: 1,
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState('INVENTARIO');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Datos globales del panel
  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);

  // Sección 1: Alta y Edición de Items
  const [itemForm, setItemForm] = useState(INITIAL_ITEM_FORM);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Sección 2: Recepción de Material (Modal de devolución)
  const [returningLoan, setReturningLoan] = useState(null);
  const [returnForm, setReturnForm] = useState({
    estadoDevolucion: 'BUENO',
    notas: '',
  });

  const [isReturning, setIsReturning] = useState(false);

  // Sección 3: Gestión de Usuarios (Buscador)
  const [userSearch, setUserSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [itemsRes, loansRes, usersRes] = await Promise.all([
        apiFetch('/api/sports/items'),
        apiFetch('/api/sports/loans'),
        apiFetch('/api/users'),
      ]);

      //filtramos los items, sus caracteristicas, estado y disponibilidad
      const rawItems = Array.isArray(itemsRes) ? itemsRes : itemsRes.items || itemsRes.data || [];
      setItems(
        rawItems.map((item) => ({
          id: item.id ?? item._id,
          codigo: item.codigo || 'S/C',
          nombre: item.nombre || '',
          deporte: item.deporte || 'General',
          estadoFisico: item.estadoFisico || item['estado Fisico'] || 'BUENO',
          cantidadTotal: Number(item.cantidadTotal ?? item.disponibles ?? 0),
          disponibles: Number(item.disponibles ?? 0),
        }))
      );

      const rawLoans = Array.isArray(loansRes) ? loansRes : loansRes.loans || loansRes.data || [];
      setLoans(
        rawLoans.map((loan) => ({
          loanId: loan.loanId ?? l.loanld ?? l.id ?? l._id,
          item: typeof loan.item === 'object' ? loan.item?.nombre : loan.item || 'Artículo',
          cantidad: Number(loan.cantidad ?? 1),
          usuario: typeof loan.usuario === 'object' ? loan.usuario?.nombre : loan.usuario || 'Estudiante',
          canchaOActividad: loan.canchaOActividad || 'Campus UTR',
          estatus: (loan.estatus || 'ACTIVO').toUpperCase(),
        }))
      );

      const rawUsers = Array.isArray(usersRes) ? usersRes : usersRes.users || usersRes.data || [];
      setUsers(
        rawUsers.map((u) => ({
          id: u.id ?? u._id,
          nombre: u.nombre || '',
          matricula: u.matricula || u['matrícula'] || 'S/M',
          email: u.email || '',
          rol: u.rol || u.role || 'USER',
          activo: u.activo !== undefined ? Boolean(u.activo) : true,
        }))
      );
    } catch (err) {
      setErrorMsg(err.message || 'Error al cargar datos del panel administrativo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // --- SECCIÓN 1: ALTA Y EDICIÓN DE ITEMS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemForm((prev) => ({
      ...prev,
      [name]: name === 'cantidadTotal' ? Number(value) : value,
    }));
  };

  const handleSelectItemToEdit = (item) => {
    setEditingItemId(item.id);
    setItemForm({
      codigo: item.codigo,
      nombre: item.nombre,
      deporte: item.deporte,
      estadoFisico: item.estadoFisico,
      cantidadTotal: item.cantidadTotal || item.disponibles || 1,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemForm.codigo.trim() || !itemForm.nombre.trim() || itemForm.cantidadTotal < 1) {
      setErrorMsg('Completa código, nombre y una cantidad total válida.');
      return;
    }

    setIsSavingItem(true);
    setErrorMsg('');

    try {
      if (editingItemId) {
        await apiFetch(`/api/sports/items/${editingItemId}`, {
          method: 'PATCH',
          body: {
            codigo: itemForm.codigo.trim(),
            nombre: itemForm.nombre.trim(),
            deporte: itemForm.deporte.trim(),
            estadoFisico: itemForm.estadoFisico,
            cantidadTotal: Number(itemForm.cantidadTotal),
          },
        });
        setToastMsg('Material actualizado correctamente.');
      } else {
        await apiFetch('/api/sports/items', {
          method: 'POST',
          body: {
            codigo: itemForm.codigo.trim(),
            nombre: itemForm.nombre.trim(),
            deporte: itemForm.deporte.trim(),
            estadoFisico: itemForm.estadoFisico,
            cantidadTotal: Number(itemForm.cantidadTotal),
          },
        });
        setToastMsg('Nuevo material registrado en inventario.');
      }

      setEditingItemId(null);
      setItemForm(INITIAL_ITEM_FORM);
      loadAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo guardar el artículo.');
    } finally {
      setIsSavingItem(false);
    }
  };

  // --- SECCIÓN 2: RECEPCIÓN DE MATERIAL (handleReturn) ---
  const handleReturn = async (e) => {
    e.preventDefault();
    if (!returningLoan) return;

    setIsReturning(true);
    setErrorMsg('');

    try {
      await apiFetch(`/api/sports/loans/${returningLoan.loanId}/return`, {
        method: 'PATCH',
        body: {
          estadoDevolucion: returnForm.estadoDevolucion,
          notas: returnForm.notas.trim() || 'Sin observaciones',
        },
      });

      setToastMsg(`Devolución del folio #${returningLoan.loanId} registrada.`);
      setReturningLoan(null);
      setReturnForm({ estadoDevolucion: 'BUENO', notas: '' });
      loadAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar la recepción del material.');
    } finally {
      setIsReturning(false);
    }
  };

  // --- SECCIÓN 3: GESTIÓN DE USUARIOS (handleSelect) ---
  const handleSelect = async (userId, newRole) => {
    setUpdatingUserId(userId);
    setErrorMsg('');
    try {
      await apiFetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        body: { rol: newRole },
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, rol: newRole } : u))
      );
      setToastMsg(`Rol actualizado a ${newRole}.`);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo actualizar el rol del usuario.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Cálculos de KPIs
  const activeLoans = loans.filter((l) => l.estatus === 'ACTIVO');
  const totalStock = items.reduce((acc, item) => acc + item.disponibles, 0);
  const wornItems = items.filter((item) => item.estadoFisico === 'DESGASTADO').length;

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(q) ||
      String(u.matricula).toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-container">
        <div className="page-header">
          <div>
            <span className="page-eyebrow">COORDINACIÓN DEPORTIVA · ADMIN</span>
            <h1 className="page-title">Panel de Administración</h1>
          </div>
          <button type="button" className="btn-secondary" onClick={loadAdminData}>
            Sincronizar datos
          </button>
        </div>

        {/* KPIs Operativos */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Catálogo Registrado</span>
            <span className="kpi-number">{items.length} ítems</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Unidades Disponibles</span>
            <span className="kpi-number">{totalStock} unid.</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Préstamos Activos</span>
            <span className="kpi-number" style={{ color: '#e11d48' }}>
              {activeLoans.length}
            </span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Material Desgastado</span>
            <span className="kpi-number" style={{ color: '#b45309' }}>
              {wornItems}
            </span>
          </div>
        </section>

        {toastMsg && (
          <div
            className="auth-alert-success"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{toastMsg}</span>
            <button
              type="button"
              onClick={() => setToastMsg('')}
              style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        {errorMsg && <div className="auth-alert-error">{errorMsg}</div>}

        {/* Navegación de las 3 Secciones */}
        <div className="admin-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'INVENTARIO' ? 'active' : ''}`}
            onClick={() => setActiveTab('INVENTARIO')}
          >
            1. Alta y Edición de Items
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'RECEPCION' ? 'active' : ''}`}
            onClick={() => setActiveTab('RECEPCION')}
          >
            2. Recepción de Material ({activeLoans.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'USUARIOS' ? 'active' : ''}`}
            onClick={() => setActiveTab('USUARIOS')}
          >
            3. Gestión de Usuarios ({users.length})
          </button>
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Cargando información administrativa...
          </p>
        ) : (
          <>
            {/* SECCIÓN 1: ALTA Y EDICIÓN DE ITEMS */}
            {activeTab === 'INVENTARIO' && (
              <>
                <section className="admin-panel-card">
                  <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem' }}>
                    {editingItemId ? 'Editar Artículo Deportivo' : 'Registrar Nuevo Artículo'}
                  </h2>

                  <form onSubmit={handleSubmit} className="form-grid-inline">
                    <div>
                      <label className="auth-label">Código</label>
                      <input
                        name="codigo"
                        type="text"
                        className="auth-input"
                        placeholder="Ej. DEP-15"
                        value={itemForm.codigo}
                        onChange={handleChange}
                        disabled={isSavingItem || Boolean(editingItemId)}
                        required
                      />
                    </div>

                    <div>
                      <label className="auth-label">Nombre del artículo</label>
                      <input
                        name="nombre"
                        type="text"
                        className="auth-input"
                        placeholder="Ej. Balón Fútbol #5"
                        value={itemForm.nombre}
                        onChange={handleChange}
                        disabled={isSavingItem}
                        required
                      />
                    </div>

                    <div>
                      <label className="auth-label">Deporte</label>
                      <input
                        name="deporte"
                        type="text"
                        className="auth-input"
                        placeholder="Fútbol, Básquetbol..."
                        value={itemForm.deporte}
                        onChange={handleChange}
                        disabled={isSavingItem}
                        required
                      />
                    </div>

                    <div>
                      <label className="auth-label">Estado Físico</label>
                      <select
                        name="estadoFisico"
                        className="auth-input"
                        value={itemForm.estadoFisico}
                        onChange={handleChange}
                        disabled={isSavingItem}
                      >
                        <option value="NUEVO">NUEVO</option>
                        <option value="BUENO">BUENO</option>
                        <option value="DESGASTADO">DESGASTADO</option>
                      </select>
                    </div>

                    <div>
                      <label className="auth-label">Cantidad Total</label>
                      <input
                        name="cantidadTotal"
                        type="number"
                        min={1}
                        className="auth-input"
                        value={itemForm.cantidadTotal}
                        onChange={handleChange}
                        disabled={isSavingItem}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn-primary" disabled={isSavingItem}>
                        {isSavingItem
                          ? 'Guardando...'
                          : editingItemId
                          ? 'Actualizar'
                          : 'Agregar Ítem'}
                      </button>
                      {editingItemId && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setEditingItemId(null);
                            setItemForm(INITIAL_ITEM_FORM);
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                <section className="admin-panel-card">
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Artículo</th>
                          <th>Deporte</th>
                          <th>Estado Físico</th>
                          <th>Disponibles</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.codigo}</strong>
                            </td>
                            <td>{item.nombre}</td>
                            <td>{item.deporte}</td>
                            <td>
                              <span className={`badge-condition cond-${item.estadoFisico}`}>
                                {item.estadoFisico}
                              </span>
                            </td>
                            <td>{item.disponibles} unid.</td>
                            <td>
                              <button
                                type="button"
                                className="btn-secondary btn-sm"
                                onClick={() => handleSelectItemToEdit(item)}
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {/* SECCIÓN 2: RECEPCIÓN DE MATERIAL */}
            {activeTab === 'RECEPCION' && (
              <section className="admin-panel-card">
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem' }}>
                  Préstamos Activos Pendientes de Devolución
                </h2>

                {activeLoans.length === 0 ? (
                  <p style={{ color: '#64748b', padding: '1.5rem 0' }}>
                    No hay material prestado en cancha en este momento.
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Folio</th>
                          <th>Estudiante</th>
                          <th>Material</th>
                          <th>Cantidad</th>
                          <th>Cancha / Actividad</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeLoans.map((loan) => (
                          <tr key={loan.loanId}>
                            <td>
                              <strong>#{loan.loanId}</strong>
                            </td>
                            <td>{loan.usuario}</td>
                            <td>{loan.item}</td>
                            <td>{loan.cantidad} unid.</td>
                            <td>{loan.canchaOActividad}</td>
                            <td>
                              <button
                                type="button"
                                className="btn-primary btn-sm"
                                onClick={() => {
                                  setReturningLoan(loan);
                                  setReturnForm({ estadoDevolucion: 'BUENO', notas: '' });
                                }}
                              >
                                Recibir Material
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* SECCIÓN 3: GESTIÓN DE USUARIOS (PANTALLA 3) */}
            {activeTab === 'USUARIOS' && (
              <section className="admin-panel-card">
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: '1.15rem' }}>
                    Comunidad Registrada (USER / ADMIN)
                  </h2>
                  <input
                    type="text"
                    className="auth-input"
                    style={{ maxWidth: '300px' }}
                    placeholder="Buscar por nombre o matrícula..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Matrícula</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Estatus</th>
                        <th>Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <strong>{u.matricula}</strong>
                          </td>
                          <td>{u.nombre}</td>
                          <td>{u.email}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                u.activo ? 'status-FINALIZADO' : 'status-ACTIVO'
                              }`}
                            >
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            <select
                              className="auth-input"
                              style={{ padding: '0.35rem 0.6rem', width: 'auto' }}
                              value={u.rol}
                              disabled={updatingUserId === u.id}
                              onChange={(e) => handleSelect(u.id, e.target.value)}
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Modal de Recepción de Material (PATCH /api/sports/loans/:id/return) */}
      {returningLoan && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <span className="page-eyebrow">RECEPCIÓN EN VENTANILLA</span>
            <h2 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1.3rem' }}>
              Recibir: {returningLoan.item}
            </h2>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748b' }}>
              Folio <strong>#{returningLoan.loanId}</strong> · Estudiante:{' '}
              <strong>{returningLoan.usuario}</strong> ({returningLoan.cantidad} unid.)
            </p>

            <form onSubmit={handleReturn}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="estadoDevolucion">
                  Estado de devolución
                </label>
                <select
                  id="estadoDevolucion"
                  className="auth-input"
                  value={returnForm.estadoDevolucion}
                  onChange={(e) =>
                    setReturnForm((prev) => ({ ...prev, estadoDevolucion: e.target.value }))
                  }
                  disabled={isReturning}
                >
                  <option value="BUENO">BUENO (En condiciones óptimas)</option>
                  <option value="DANADO">DAÑADO (Presenta desgaste o daño)</option>
                </select>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="notas">
                  Notas u observaciones
                </label>
                <input
                  id="notas"
                  type="text"
                  className="auth-input"
                  placeholder="Ej. Entregado completo y sin daños"
                  value={returnForm.notas}
                  onChange={(e) =>
                    setReturnForm((prev) => ({ ...prev, notas: e.target.value }))
                  }
                  disabled={isReturning}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setReturningLoan(null)}
                  disabled={isReturning}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isReturning}>
                  {isReturning ? 'Procesando...' : 'Confirmar recepción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;