import { useEffect, useState } from 'react';
import { getUsers, getRoles, createUser, assignRole, removeRole, unlockUser } from '../api/api';
import { useAuth } from '../context/AuthContext';

function UsersPage({ onNavigate }) {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', nombre_completo: '', tienda_id: '1', roles: [] });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError('');
    try {
      const usersData = await getUsers(token);
      const rolesData = await getRoles(token);
      setUsers(usersData.users || []);
      setRoles(rolesData.roles || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await createUser(token, {
        email: form.email,
        password: form.password,
        nombre_completo: form.nombre_completo,
        tienda_id: Number(form.tienda_id),
        roles: form.roles,
      });
      setMessage('Usuario creado correctamente.');
      setForm({ email: '', password: '', nombre_completo: '', tienda_id: '1', roles: [] });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = (roleName) => {
    setForm(prev => {
      const hasRole = prev.roles.includes(roleName);
      return {
        ...prev,
        roles: hasRole ? prev.roles.filter(r => r !== roleName) : [...prev.roles, roleName],
      };
    });
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      await assignRole(token, userId, roleId);
      setMessage('Rol asignado al usuario.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    try {
      await removeRole(token, userId, roleId);
      setMessage('Rol eliminado del usuario.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnlockUser = async (userId) => {
    try {
      await unlockUser(token, userId);
      setMessage('Usuario desbloqueado correctamente.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-card">
      <h2>Gestión de Usuarios</h2>
      <button className="link-button" onClick={() => onNavigate('dashboard')}>Volver al panel</button>
      <div className="section">
        <h3>Usuarios</h3>
        {error && <div className="error">{error}</div>}
        <div className="users-grid">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <strong>{user.nombre_completo}</strong>
              <p>{user.email}</p>
              <p>Tienda: {user.Store?.nombre || user.tienda_id}</p>
              <p>Estado: {user.locked_until ? 'Bloqueado' : 'Activo'}</p>
              <p>Roles: {user.UserRoles?.map(r => r.Role?.nombre).filter(Boolean).join(', ') || 'Sin roles'}</p>
              {user.locked_until && (
                <button className="danger" onClick={() => handleUnlockUser(user.id)}>Desbloquear</button>
              )}
              <div className="role-actions">
                {roles.map(role => (
                  <button key={role.id} onClick={() => handleAssignRole(user.id, role.id)}>{`Asignar ${role.nombre}`}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="section">
        <h3>Crear usuario</h3>
        <form onSubmit={handleCreate} className="vertical-form">
          <label>
            Nombre completo
            <input value={form.nombre_completo} onChange={e => setForm({ ...form, nombre_completo: e.target.value })} required />
          </label>
          <label>
            Email
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" required />
          </label>
          <label>
            Contraseña
            <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" required />
          </label>
          <label>
            Tienda
            <select value={form.tienda_id} onChange={e => setForm({ ...form, tienda_id: e.target.value })}>
              <option value="1">Sucursal Central</option>
              <option value="2">Sucursal Norte</option>
            </select>
          </label>
          <div className="role-checkboxes">
            <p>Roles iniciales</p>
            {roles.map(role => (
              <label key={role.id}>
                <input type="checkbox" checked={form.roles.includes(role.nombre)} onChange={() => handleRoleChange(role.nombre)} />
                {role.nombre}
              </label>
            ))}
          </div>
          <button type="submit">Crear usuario</button>
        </form>
        {message && <div className="success">{message}</div>}
      </div>
    </div>
  );
}

export default UsersPage;
