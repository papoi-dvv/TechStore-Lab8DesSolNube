import { useEffect, useState } from 'react';
import { getRoles, getUsers } from '../api/api';
import { useAuth } from '../context/AuthContext';

const ROLE_PERMISSIONS = {
  Administrador: [
    'Gestionar usuarios',
    'Editar inventario',
    'Ver auditorías',
    'Gestionar roles',
  ],
  Gerente: [
    'Ver reportes',
    'Gestionar sucursal',
    'Supervisar inventario',
  ],
  Auditor: [
    'Generar auditorías',
    'Revisar movimientos',
  ],
};

function RolesPage({ onNavigate }) {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showOperationsModal, setShowOperationsModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRoles = async () => {
    setError('');
    try {
      const data = await getRoles(token);
      setRoles(data.roles || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadUsers = async () => {
    setError('');
    try {
      const data = await getUsers(token);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const openUsersModal = async (role) => {
    setSelectedRole(role);
    await loadUsers();
    setShowUsersModal(true);
  };

  const openOperationsModal = (role) => {
    setSelectedRole(role);
    setShowOperationsModal(true);
  };

  const closeModals = () => {
    setShowUsersModal(false);
    setShowOperationsModal(false);
    setSelectedRole(null);
  };

  return (
    <div className="page-card roles-page">
      <div className="page-header">
        <div>
          <h2>Gestión de Roles</h2>
          <p className="subtitle">Roles, permisos y usuarios activos en el sistema.</p>
        </div>
        <button className="link-button" onClick={() => onNavigate('dashboard')}>Volver al panel</button>
      </div>

      {error && <div className="error">{error}</div>}
      <div className="roles-grid">
        {roles.map(role => (
          <article key={role.id} className="role-card">
            <div className="role-card-header">
              <div>
                <h3>{role.nombre}</h3>
                <p className="role-meta">{role.descripcion || 'Sin descripción disponible'}</p>
              </div>
              <span className="role-count">{role.userCount || 0} usuarios</span>
            </div>
            <div className="role-details">
              <div className="badge-row">
                {(ROLE_PERMISSIONS[role.nombre] || ['Permisos personalizados']).map(permission => (
                  <span key={permission} className="badge">{permission}</span>
                ))}
              </div>
              <div className="role-actions">
                <button onClick={() => openUsersModal(role)}>Ver usuarios</button>
                <button onClick={() => openOperationsModal(role)}>Ver operaciones</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showUsersModal && selectedRole && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Usuarios con rol {selectedRole.nombre}</h3>
              <button onClick={closeModals} className="close-button">&times;</button>
            </div>
            <div className="modal-body">
              {users.filter(u => u.UserRoles?.some(ur => ur.Role?.nombre === selectedRole.nombre)).map(user => (
                <div key={user.id} className="user-item">
                  <strong>{user.nombre_completo}</strong> - {user.email}
                </div>
              ))}
              {users.filter(u => u.UserRoles?.some(ur => ur.Role?.nombre === selectedRole.nombre)).length === 0 && (
                <p>No hay usuarios con este rol.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showOperationsModal && selectedRole && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Operaciones típicas para {selectedRole.nombre}</h3>
              <button onClick={closeModals} className="close-button">&times;</button>
            </div>
            <div className="modal-body">
              {selectedRole.nombre === 'Empleado' && (
                <div>
                  <h4>Operaciones en Inventario:</h4>
                  <code>SELECT * FROM products WHERE tienda_id = ?</code>
                  <p>Ver productos de su sucursal.</p>
                  <code>UPDATE products SET stock = stock - 1 WHERE id = ? AND tienda_id = ?</code>
                  <p>Actualizar stock al vender un producto.</p>
                </div>
              )}
              {selectedRole.nombre === 'Gerente' && (
                <div>
                  <h4>Operaciones en Reportes:</h4>
                  <code>SELECT * FROM audits WHERE tienda_id = ? AND estado = 'completada'</code>
                  <p>Ver auditorías completadas de su sucursal.</p>
                  <code>SELECT COUNT(*) FROM products WHERE tienda_id = ?</code>
                  <p>Contar productos en inventario.</p>
                </div>
              )}
              {selectedRole.nombre === 'Auditor' && (
                <div>
                  <h4>Operaciones en Auditorías:</h4>
                  <code>INSERT INTO audits (titulo, descripcion, tienda_id, auditor_id) VALUES (?, ?, ?, ?)</code>
                  <p>Crear nueva auditoría.</p>
                  <code>UPDATE audits SET estado = 'completada' WHERE id = ?</code>
                  <p>Marcar auditoría como completada.</p>
                </div>
              )}
              {selectedRole.nombre === 'Administrador' && (
                <div>
                  <h4>Operaciones Globales:</h4>
                  <code>SELECT * FROM users</code>
                  <p>Ver todos los usuarios del sistema.</p>
                  <code>UPDATE users SET activo = 0 WHERE id = ?</code>
                  <p>Desactivar un usuario.</p>
                  <code>SELECT * FROM audits</code>
                  <p>Ver todas las auditorías del sistema.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPage;
