import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAudits, createAudit, updateAudit, deleteAudit } from '../api/api';
import '../styles/AuditsPage.css';

function AuditsPage({ onNavigate }) {
  const { user, token } = useAuth();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ estado: '', tienda_id: '' });
  const [formData, setFormData] = useState({
    tienda_id: user?.tienda_id || '',
    observaciones: '',
    productos_revisados: 0,
    incidencias: 0,
    calificacion: '',
  });

  const userRoles = user?.roles || [];
  const isAuditor = userRoles.includes('Auditor');
  const isAdmin = userRoles.includes('Administrador');

  const metrics = isAdmin ? {
    total: audits.length,
    completadas: audits.filter(a => a.estado === 'completada').length,
    en_progreso: audits.filter(a => a.estado === 'en_progreso').length,
    totalIncidencias: audits.reduce((sum, a) => sum + (a.incidencias || 0), 0),
    totalProductos: audits.reduce((sum, a) => sum + (a.productos_revisados || 0), 0),
    porCalificacion: ['excelente', 'bueno', 'regular', 'malo'].map(c => ({
      label: c,
      count: audits.filter(a => a.calificacion === c).length,
    })),
  } : null;

  useEffect(() => {
    loadAudits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAudits = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAudits(token);
      setAudits(data.audits || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAudit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        tienda_id: parseInt(formData.tienda_id),
        observaciones: formData.observaciones,
        productos_revisados: parseInt(formData.productos_revisados),
        incidencias: parseInt(formData.incidencias),
        calificacion: formData.calificacion,
      };

      const result = await createAudit(token, payload);
      setAudits([result.audit, ...audits]);
      setFormData({
        tienda_id: user?.tienda_id || '',
        observaciones: '',
        productos_revisados: 0,
        incidencias: 0,
        calificacion: '',
      });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (auditId, newStatus) => {
    try {
      const result = await updateAudit(token, auditId, { estado: newStatus });
      setAudits(audits.map(a => (a.id === auditId ? result.audit : a)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAudit = async (auditId) => {
    if (window.confirm('¿Eliminar esta auditoría?')) {
      try {
        await deleteAudit(token, auditId);
        setAudits(audits.filter(a => a.id !== auditId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getStateColor = (estado) => {
    switch (estado) {
      case 'completada': return '#10b981';
      case 'en_progreso': return '#f59e0b';
      case 'pendiente': return '#6b7280';
      case 'rechazada': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="page-card audits-page">
      <div className="page-header">
        <div>
          <h2>📋 Auditorías</h2>
        </div>
        <button className="link-button" onClick={() => onNavigate('dashboard')}>Volver al panel</button>
      </div>

      {isAuditor && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancelar' : '+ Nueva Auditoría'}
          </button>
        </div>
      )}

      {isAdmin && metrics && (
        <div style={{ marginBottom: 24, padding: '16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>📊 Métricas Generales</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ background: '#fff', padding: '12px 20px', borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{metrics.total}</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Total auditorías</div>
            </div>
            <div style={{ background: '#fff', padding: '12px 20px', borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{metrics.completadas}</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Completadas</div>
            </div>
            <div style={{ background: '#fff', padding: '12px 20px', borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{metrics.en_progreso}</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>En progreso</div>
            </div>
            <div style={{ background: '#fff', padding: '12px 20px', borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{metrics.totalIncidencias}</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Total incidencias</div>
            </div>
            <div style={{ background: '#fff', padding: '12px 20px', borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{metrics.totalProductos}</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Productos revisados</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {metrics.porCalificacion.map(({ label, count }) => (
              <span key={label} style={{ background: '#e2e8f0', borderRadius: 12, padding: '4px 12px', fontSize: 13 }}>
                {label}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="filters-section" style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="completada">Completada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      {showForm && isAuditor && (
        <div className="audit-form">
          <h3>Crear Nueva Auditoría</h3>
          <form onSubmit={handleCreateAudit}>
            <label>
              Productos Revisados
              <input
                type="number"
                min="0"
                value={formData.productos_revisados}
                onChange={(e) => setFormData({ ...formData, productos_revisados: e.target.value })}
                required
              />
            </label>

            <label>
              Incidencias Encontradas
              <input
                type="number"
                min="0"
                value={formData.incidencias}
                onChange={(e) => setFormData({ ...formData, incidencias: e.target.value })}
              />
            </label>

            <label>
              Calificación
              <select
                value={formData.calificacion}
                onChange={(e) => setFormData({ ...formData, calificacion: e.target.value })}
              >
                <option value="">Sin calificación</option>
                <option value="excelente">Excelente</option>
                <option value="bueno">Bueno</option>
                <option value="regular">Regular</option>
                <option value="malo">Malo</option>
              </select>
            </label>

            <label>
              Observaciones
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Detalles de la auditoría..."
              />
            </label>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Auditoría'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="audits-list">
        {loading && <p>Cargando auditorías...</p>}
        {audits.filter(a => !filters.estado || a.estado === filters.estado).length === 0 ? (
          <p>No hay auditorías disponibles.</p>
        ) : (
          audits.filter(a => !filters.estado || a.estado === filters.estado).map((audit) => (
            <div key={audit.id} className="audit-card">
              <div className="audit-header">
                <h4>{audit.Store?.nombre}</h4>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStateColor(audit.estado) }}
                >
                  {audit.estado}
                </span>
              </div>

              <div className="audit-info">
                <p>
                  <strong>Auditor:</strong> {audit.auditor?.nombre_completo}
                </p>
                <p>
                  <strong>Fecha:</strong> {new Date(audit.fecha_auditoria).toLocaleDateString()}
                </p>
                <p>
                  <strong>Productos Revisados:</strong> {audit.productos_revisados}
                </p>
                <p>
                  <strong>Incidencias:</strong> {audit.incidencias}
                </p>
                {audit.calificacion && (
                  <p>
                    <strong>Calificación:</strong> {audit.calificacion}
                  </p>
                )}
                {audit.observaciones && (
                  <p>
                    <strong>Observaciones:</strong> {audit.observaciones}
                  </p>
                )}
              </div>

              <div className="audit-actions">
                {audit.estado === 'en_progreso' && isAuditor && audit.auditor_id === user.id && (
                  <button
                    onClick={() => handleUpdateStatus(audit.id, 'completada')}
                    className="btn-small btn-success"
                  >
                    Marcar Completada
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteAudit(audit.id)}
                    className="btn-small btn-danger"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AuditsPage;
