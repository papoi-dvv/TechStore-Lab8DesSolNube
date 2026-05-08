import { useEffect, useState } from 'react';
import { getRoles, getUsers } from '../api/api';
import { useAuth } from '../context/AuthContext';

const ROLE_PERMISSIONS = {
  Administrador: ['Gestionar usuarios', 'Editar inventario', 'Ver auditorías', 'Gestionar roles'],
  Gerente:       ['Ver reportes', 'Gestionar sucursal', 'Supervisar inventario'],
  Auditor:       ['Generar auditorías', 'Revisar movimientos'],
  Empleado:      ['Ver inventario', 'Actualizar stock'],
};

const ROLE_OPS = {
  Empleado: [
    { sql: 'SELECT * FROM products WHERE tienda_id = ?', desc: 'Ver productos de su sucursal.' },
    { sql: 'UPDATE products SET stock = stock - 1 WHERE id = ? AND tienda_id = ?', desc: 'Actualizar stock al vender.' },
  ],
  Gerente: [
    { sql: "SELECT * FROM audits WHERE tienda_id = ? AND estado = 'completada'", desc: 'Ver auditorías completadas.' },
    { sql: 'SELECT COUNT(*) FROM products WHERE tienda_id = ?', desc: 'Contar productos en inventario.' },
  ],
  Auditor: [
    { sql: 'INSERT INTO audits (titulo, descripcion, tienda_id, auditor_id) VALUES (?, ?, ?, ?)', desc: 'Crear nueva auditoría.' },
    { sql: "UPDATE audits SET estado = 'completada' WHERE id = ?", desc: 'Marcar auditoría como completada.' },
  ],
  Administrador: [
    { sql: 'SELECT * FROM users', desc: 'Ver todos los usuarios.' },
    { sql: 'UPDATE users SET activo = 0 WHERE id = ?', desc: 'Desactivar un usuario.' },
    { sql: 'SELECT * FROM audits', desc: 'Ver todas las auditorías.' },
  ],
};

function RolesPage() {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modal, setModal] = useState(null); // 'users' | 'ops'
  const [error, setError] = useState('');

  useEffect(() => {
    getRoles(token).then(d => setRoles(d.roles || [])).catch(e => setError(e.message));
  }, [token]);

  const openUsersModal = async role => {
    setSelectedRole(role);
    try {
      const d = await getUsers(token);
      setUsers(d.users || []);
    } catch (e) { setError(e.message); }
    setModal('users');
  };

  const closeModal = () => { setModal(null); setSelectedRole(null); };

  const roleUsers = selectedRole
    ? users.filter(u => u.UserRoles?.some(ur => ur.Role?.nombre === selectedRole.nombre))
    : [];

  return (
    <div>
      {error && <div className="alert alert-error">⚠ {error}</div>}

      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title">Gestión de Roles</div>
          <div className="section-subtitle">Roles, permisos y usuarios activos en el sistema.</div>
        </div>
      </div>

      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className="role-card">
            <div className="role-card-header">
              <div>
                <div className="role-card-name">{role.nombre}</div>
                <div className="role-card-desc">{role.descripcion || 'Sin descripción disponible'}</div>
              </div>
              <span className="role-count-badge">{role.userCount || 0} usuarios</span>
            </div>

            <div className="permissions-row">
              {(ROLE_PERMISSIONS[role.nombre] || ['Permisos personalizados']).map(p => (
                <span key={p} className="perm-badge">{p}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openUsersModal(role)}>Ver usuarios</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedRole(role); setModal('ops'); }}>Ver operaciones</button>
            </div>
          </div>
        ))}
      </div>

      {/* Users modal */}
      {modal === 'users' && selectedRole && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Usuarios con rol {selectedRole.nombre}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {roleUsers.length === 0
              ? <p style={{ color: 'var(--muted)' }}>No hay usuarios con este rol.</p>
              : roleUsers.map(u => (
                <div key={u.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.nombre_completo}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{u.email}</div>
                  </div>
                  <span className={`badge ${u.activo ? 'badge-success' : 'badge-muted'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Operations modal */}
      {modal === 'ops' && selectedRole && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Operaciones — {selectedRole.nombre}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(ROLE_OPS[selectedRole.nombre] || []).map((op, i) => (
                <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                  <code style={{ display: 'block', color: '#93C5FD', fontSize: '0.78rem', fontFamily: 'Courier New, monospace', marginBottom: 6, wordBreak: 'break-all' }}>
                    {op.sql}
                  </code>
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: 0 }}>{op.desc}</p>
                </div>
              ))}
              {!ROLE_OPS[selectedRole.nombre] && <p style={{ color: 'var(--muted)' }}>Sin operaciones definidas.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPage;
