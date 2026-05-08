import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAudits, getStores } from '../api/api';
import '../styles/ReportsPage.css';

function ReportsPage({ onNavigate }) {
  const { token, user } = useAuth();
  const [audits, setAudits] = useState([]);
  const [stores, setStores] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, completada: 0, en_progreso: 0, pendiente: 0, rechazada: 0 });
  const [filters, setFilters] = useState({
    tienda_id: user?.tienda_id || '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStores();
    loadAudits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStores = async () => {
    try {
      const data = await getStores(token);
      setStores(data.stores || []);
    } catch (err) {
      // Non-critical if stores fail
    }
  };

  const loadAudits = async (query = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...query,
        tienda_id: user?.roles?.includes('Gerente') ? user.tienda_id : query.tienda_id,
      };
      const data = await getAudits(token, params);
      setAudits(data.audits || []);
      // Calculate metrics
      const auditList = data.audits || [];
      const newMetrics = {
        total: auditList.length,
        completada: auditList.filter(a => a.estado === 'completada').length,
        en_progreso: auditList.filter(a => a.estado === 'en_progreso').length,
        pendiente: auditList.filter(a => a.estado === 'pendiente').length,
        rechazada: auditList.filter(a => a.estado === 'rechazada').length,
      };
      setMetrics(newMetrics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadAudits(filters);
  };

  const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    return date.toLocaleDateString();
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'completada':
        return 'badge-success';
      case 'en_progreso':
        return 'badge-warning';
      case 'pendiente':
        return 'badge-muted';
      case 'rechazada':
        return 'badge-danger';
      default:
        return 'badge-muted';
    }
  };

  return (
    <div className="page-card reports-page">
      <div className="page-header">
        <div>
          <h2>Reportes de Auditorías</h2>
          <p className="subtitle">Revisa el historial de auditorías de tu sucursal con filtros por fecha y estado.</p>
        </div>
        <button className="link-button" onClick={() => onNavigate('dashboard')}>Volver al panel</button>
      </div>

      <section className="report-filters">
        <form onSubmit={handleSubmit} className="filters-form">
              {user?.roles?.includes('Administrador') && (
            <label>
              Tienda
              <select value={filters.tienda_id} onChange={(e) => setFilters({ ...filters, tienda_id: e.target.value })}>
                <option value="">Todas las tiendas</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.nombre}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            Fecha inicio
            <input type="date" value={filters.fecha_inicio} onChange={(e) => setFilters({ ...filters, fecha_inicio: e.target.value })} />
          </label>
          <label>
            Fecha fin
            <input type="date" value={filters.fecha_fin} onChange={(e) => setFilters({ ...filters, fecha_fin: e.target.value })} />
          </label>
          <label>
            Estado
            <select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </label>
          <div className="filter-actions">
            <button type="submit">Aplicar filtros</button>
          </div>
        </form>
      </section>

      {error && <div className="error">{error}</div>}

      <section className="timeline-summary">
        <div className="summary-card">
          <strong>{metrics.total}</strong>
          <span>Total Auditorías</span>
        </div>
        <div className="summary-card">
          <strong>{metrics.completada}</strong>
          <span>Completadas</span>
        </div>
        <div className="summary-card">
          <strong>{metrics.en_progreso}</strong>
          <span>En progreso</span>
        </div>
        <div className="summary-card">
          <strong>{metrics.pendiente}</strong>
          <span>Pendientes</span>
        </div>
        <div className="summary-card">
          <strong>{metrics.rechazada}</strong>
          <span>Rechazadas</span>
        </div>
      </section>

      <section className="metrics-section">
        <h3>Métricas por Estado</h3>
        <div className="metrics-chart">
          <div className="metric-bar">
            <span className="metric-label">Completadas</span>
            <div className="bar-container">
              <div className="bar completada" style={{ width: `${metrics.total > 0 ? (metrics.completada / metrics.total) * 100 : 0}%` }}></div>
            </div>
            <span className="metric-value">{metrics.completada}</span>
          </div>
          <div className="metric-bar">
            <span className="metric-label">En progreso</span>
            <div className="bar-container">
              <div className="bar en_progreso" style={{ width: `${metrics.total > 0 ? (metrics.en_progreso / metrics.total) * 100 : 0}%` }}></div>
            </div>
            <span className="metric-value">{metrics.en_progreso}</span>
          </div>
          <div className="metric-bar">
            <span className="metric-label">Pendientes</span>
            <div className="bar-container">
              <div className="bar pendiente" style={{ width: `${metrics.total > 0 ? (metrics.pendiente / metrics.total) * 100 : 0}%` }}></div>
            </div>
            <span className="metric-value">{metrics.pendiente}</span>
          </div>
          <div className="metric-bar">
            <span className="metric-label">Rechazadas</span>
            <div className="bar-container">
              <div className="bar rechazada" style={{ width: `${metrics.total > 0 ? (metrics.rechazada / metrics.total) * 100 : 0}%` }}></div>
            </div>
            <span className="metric-value">{metrics.rechazada}</span>
          </div>
        </div>
      </section>

      <div className="timeline-container">
        {loading ? (
          <p>Cargando auditorías...</p>
        ) : audits.length === 0 ? (
          <p>No se encontraron auditorías con esos criterios.</p>
        ) : (
          <div className="timeline">
            {audits.map(audit => (
              <div key={audit.id} className="timeline-item">
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <div>
                        <h3>{audit.Store?.nombre || 'Sucursal desconocida'}</h3>
                        <p className="small-text">{formatDate(audit.fecha_auditoria)} • Auditor: {audit.auditor?.nombre_completo || 'N/A'}</p>
                      </div>
                      <span className={`status-badge ${getBadgeColor(audit.estado)}`}>{audit.estado}</span>
                    </div>
                    <div className="timeline-details">
                      <p><strong>Productos revisados:</strong> {audit.productos_revisados}</p>
                      <p><strong>Incidencias:</strong> {audit.incidencias}</p>
                      {audit.calificacion && <p><strong>Calificación:</strong> {audit.calificacion}</p>}
                      {audit.observaciones && <p><strong>Observaciones:</strong> {audit.observaciones}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
