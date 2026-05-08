import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAudits, getStores } from '../api/api';

const BADGE = { completada: 'badge-success', en_progreso: 'badge-warning', pendiente: 'badge-muted', rechazada: 'badge-danger' };

function ReportsPage() {
  const { token, user } = useAuth();
  const [audits, setAudits] = useState([]);
  const [stores, setStores] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, completada: 0, en_progreso: 0, pendiente: 0, rechazada: 0 });
  const [filters, setFilters] = useState({ tienda_id: user?.tienda_id || '', fecha_inicio: '', fecha_fin: '', estado: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getStores(token).then(d => setStores(d.stores || [])).catch(() => {});
    loadAudits();
  }, []); // eslint-disable-line

  const loadAudits = async (query = {}) => {
    setLoading(true); setError('');
    try {
      const params = { ...query, tienda_id: user?.roles?.includes('Gerente') ? user.tienda_id : query.tienda_id };
      const data = await getAudits(token, params);
      const list = data.audits || [];
      setAudits(list);
      setMetrics({
        total:       list.length,
        completada:  list.filter(a => a.estado === 'completada').length,
        en_progreso: list.filter(a => a.estado === 'en_progreso').length,
        pendiente:   list.filter(a => a.estado === 'pendiente').length,
        rechazada:   list.filter(a => a.estado === 'rechazada').length,
      });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = e => { e.preventDefault(); loadAudits(filters); };

  const fmt = v => v ? new Date(v).toLocaleDateString() : 'Sin fecha';

  const pct = n => metrics.total > 0 ? (n / metrics.total) * 100 : 0;

  return (
    <div>
      {error && <div className="alert alert-error">⚠ {error}</div>}

      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title">Reportes de Auditorías</div>
          <div className="section-subtitle">Historial y métricas de auditorías por sucursal</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}>
          {user?.roles?.includes('Administrador') && (
            <div className="form-group" style={{ margin: 0 }}>
              <label>Tienda</label>
              <select value={filters.tienda_id} onChange={e => setFilters({ ...filters, tienda_id: e.target.value })}>
                <option value="">Todas las tiendas</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          )}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Fecha inicio</label>
            <input type="date" value={filters.fecha_inicio} onChange={e => setFilters({ ...filters, fecha_inicio: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Fecha fin</label>
            <input type="date" value={filters.fecha_fin} onChange={e => setFilters({ ...filters, fecha_fin: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Estado</label>
            <select value={filters.estado} onChange={e => setFilters({ ...filters, estado: e.target.value })}>
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>Aplicar filtros</button>
        </form>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total', value: metrics.total },
          { label: 'Completadas', value: metrics.completada },
          { label: 'En progreso', value: metrics.en_progreso },
          { label: 'Pendientes', value: metrics.pendiente },
          { label: 'Rechazadas', value: metrics.rechazada },
        ].map(m => (
          <div key={m.label} className="stat-card">
            <span className="stat-card-value">{m.value}</span>
            <span className="stat-card-label">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><div className="card-title">Distribución por estado</div></div>
        <div className="metrics-chart">
          {[
            { key: 'completada',  label: 'Completadas',  val: metrics.completada },
            { key: 'en_progreso', label: 'En progreso',  val: metrics.en_progreso },
            { key: 'pendiente',   label: 'Pendientes',   val: metrics.pendiente },
            { key: 'rechazada',   label: 'Rechazadas',   val: metrics.rechazada },
          ].map(({ key, label, val }) => (
            <div key={key} className="metric-bar">
              <span className="metric-label">{label}</span>
              <div className="bar-container">
                <div className={`bar ${key}`} style={{ width: `${pct(val)}%` }} />
              </div>
              <span className="metric-value">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {loading && <p style={{ color: 'var(--muted)' }}>Cargando…</p>}
      {!loading && audits.length === 0 && <p style={{ color: 'var(--muted)', padding: '24px 0' }}>No se encontraron auditorías con esos criterios.</p>}

      {!loading && audits.length > 0 && (
        <div className="timeline">
          {audits.map(audit => (
            <div key={audit.id} className="timeline-item">
              <div className="timeline-marker" />
              <div className="card" style={{ marginLeft: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{audit.Store?.nombre || 'Sucursal desconocida'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      {fmt(audit.fecha_auditoria)} · Auditor: {audit.auditor?.nombre_completo || 'N/A'}
                    </div>
                  </div>
                  <span className={`badge ${BADGE[audit.estado] || 'badge-muted'}`}>{audit.estado}</span>
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Productos: <strong style={{ color: 'var(--text)' }}>{audit.productos_revisados}</strong></span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Incidencias: <strong style={{ color: 'var(--text)' }}>{audit.incidencias}</strong></span>
                  {audit.calificacion && <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Calificación: <strong style={{ color: 'var(--text)' }}>{audit.calificacion}</strong></span>}
                </div>
                {audit.observaciones && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 8, marginBottom: 0 }}>{audit.observaciones}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
