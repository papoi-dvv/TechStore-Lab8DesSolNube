import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAudits, createAudit, updateAudit, deleteAudit } from '../api/api';

const STATE_BADGE = {
  completada:  'badge-success',
  en_progreso: 'badge-warning',
  pendiente:   'badge-muted',
  rechazada:   'badge-danger',
};

function AuditsPage() {
  const { user, token } = useAuth();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ estado: '' });
  const [formData, setFormData] = useState({
    tienda_id: user?.tienda_id || '',
    observaciones: '',
    productos_revisados: 0,
    incidencias: 0,
    calificacion: '',
  });

  const userRoles = user?.roles || [];
  const isAuditor = userRoles.includes('Auditor');
  const isAdmin   = userRoles.includes('Administrador');

  const metrics = {
    total:       audits.length,
    completadas: audits.filter(a => a.estado === 'completada').length,
    en_progreso: audits.filter(a => a.estado === 'en_progreso').length,
    incidencias: audits.reduce((s, a) => s + (a.incidencias || 0), 0),
  };

  useEffect(() => { loadAudits(); }, []); // eslint-disable-line

  const loadAudits = async () => {
    setLoading(true); setError('');
    try {
      const data = await getAudits(token);
      setAudits(data.audits || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleCreate = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await createAudit(token, {
        tienda_id: parseInt(formData.tienda_id),
        observaciones: formData.observaciones,
        productos_revisados: parseInt(formData.productos_revisados),
        incidencias: parseInt(formData.incidencias),
        calificacion: formData.calificacion,
      });
      setAudits([result.audit, ...audits]);
      setFormData({ tienda_id: user?.tienda_id || '', observaciones: '', productos_revisados: 0, incidencias: 0, calificacion: '' });
      setShowForm(false);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id, estado) => {
    try {
      const result = await updateAudit(token, id, { estado });
      setAudits(audits.map(a => a.id === id ? result.audit : a));
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar esta auditoría?')) return;
    try {
      await deleteAudit(token, id);
      setAudits(audits.filter(a => a.id !== id));
    } catch (err) { setError(err.message); }
  };

  const filtered = audits.filter(a => !filters.estado || a.estado === filters.estado);

  return (
    <div>
      {error && <div className="alert alert-error">⚠ {error}</div>}

      <div className="section-header">
        <div>
          <div className="section-title">Auditorías</div>
          <div className="section-subtitle">Control de calidad e inspecciones de sucursales</div>
        </div>
        {isAuditor && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ Cancelar' : '+ Nueva auditoría'}
          </button>
        )}
      </div>

      {/* Metrics */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total', value: metrics.total, icon: '📋' },
          { label: 'Completadas', value: metrics.completadas, icon: '✅' },
          { label: 'En progreso', value: metrics.en_progreso, icon: '⏳' },
          { label: 'Incidencias', value: metrics.incidencias, icon: '⚠' },
        ].map(m => (
          <div key={m.label} className="stat-card">
            <span className="stat-card-icon">{m.icon}</span>
            <span className="stat-card-value">{m.value}</span>
            <span className="stat-card-label">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && isAuditor && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><div className="card-title">Nueva auditoría</div></div>
          <form onSubmit={handleCreate} className="vform">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Productos revisados</label>
                <input type="number" min="0" value={formData.productos_revisados} onChange={e => setFormData({ ...formData, productos_revisados: e.target.value })} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Incidencias</label>
                <input type="number" min="0" value={formData.incidencias} onChange={e => setFormData({ ...formData, incidencias: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Calificación</label>
                <select value={formData.calificacion} onChange={e => setFormData({ ...formData, calificacion: e.target.value })}>
                  <option value="">Sin calificación</option>
                  <option value="excelente">Excelente</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="malo">Malo</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Observaciones</label>
              <textarea value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })} placeholder="Detalles de la auditoría…" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? 'Creando…' : 'Crear auditoría'}</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="filters-bar">
        <select value={filters.estado} onChange={e => setFilters({ estado: e.target.value })} style={{ maxWidth: 200 }}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="completada">Completada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      {/* List */}
      {loading && <p style={{ color: 'var(--muted)' }}>Cargando auditorías…</p>}
      {!loading && filtered.length === 0 && <p style={{ color: 'var(--muted)', padding: '24px 0' }}>No hay auditorías disponibles.</p>}

      {filtered.map(audit => (
        <div key={audit.id} className="audit-card">
          <div className="audit-card-header">
            <div>
              <div className="audit-card-title">{audit.Store?.nombre || `Tienda #${audit.tienda_id}`}</div>
              <div className="audit-card-meta">
                {new Date(audit.fecha_auditoria).toLocaleDateString()} · Auditor: {audit.auditor?.nombre_completo || 'N/A'}
              </div>
            </div>
            <span className={`badge ${STATE_BADGE[audit.estado] || 'badge-muted'}`}>{audit.estado}</span>
          </div>

          <div className="audit-card-body">
            <div className="audit-detail"><strong>{audit.productos_revisados}</strong>Productos revisados</div>
            <div className="audit-detail"><strong>{audit.incidencias}</strong>Incidencias</div>
            {audit.calificacion && <div className="audit-detail"><strong>{audit.calificacion}</strong>Calificación</div>}
            {audit.observaciones && <div className="audit-detail" style={{ gridColumn: '1 / -1' }}><strong>Observaciones</strong>{audit.observaciones}</div>}
          </div>

          <div className="audit-card-actions">
            {audit.estado === 'en_progreso' && isAuditor && audit.auditor_id === user.id && (
              <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(audit.id, 'completada')}>✓ Marcar completada</button>
            )}
            {isAdmin && (
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(audit.id)}>Eliminar</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AuditsPage;
