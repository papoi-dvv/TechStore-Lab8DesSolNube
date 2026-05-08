import { useEffect, useState, useCallback } from 'react';
import { getUsers, getRoles, createUser, assignRole, removeRole, unlockUser, getStores, updateUser, updateUserPassword, activateUser, deactivateUser } from '../api/api';
import { useAuth } from '../context/AuthContext';

function UsersPage({ onNavigate }) {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', nombre_completo: '', tienda_id: '1', roles: [] });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ tienda_id: '', role: '', status: '', q: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const loadData = useCallback(async () => {
    setError('');
    try {
      const usersData = await getUsers(token);
      const rolesData = await getRoles(token);
      const storesData = await getStores(token).catch(() => ({ stores: [] }));
      setUsers(usersData.users || []);
      setRoles(rolesData.roles || []);
      setStores(storesData.stores || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleDeactivate = async (userId) => {
    try {
      await deactivateUser(token, userId);
      setMessage('Usuario desactivado.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await activateUser(token, userId);
      setMessage('Usuario activado.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = (user) => {
    setEditForm({ id: user.id, nombre_completo: user.nombre_completo, email: user.email, tienda_id: user.tienda_id || '', roles: user.UserRoles?.map(ur => ur.Role?.nombre).filter(Boolean) || [] });
    setEditingUser(user);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(token, editForm.id, { nombre_completo: editForm.nombre_completo, tienda_id: Number(editForm.tienda_id) });
      setMessage('Usuario actualizado.');
      setEditingUser(null);
      setEditForm(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openPasswordModal = (user) => {
    setPasswordUser({ id: user.id, nombre: user.nombre_completo, password: '' });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await updateUserPassword(token, passwordUser.id, passwordUser.password);
      setMessage('Contraseña actualizada.');
      setPasswordUser(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const applyFilters = (u) => {
    const q = filters.q.trim().toLowerCase();
    if (filters.tienda_id && String(u.tienda_id) !== String(filters.tienda_id)) return false;
    if (filters.role && !(u.UserRoles||[]).some(ur => ur.Role && ur.Role.nombre === filters.role)) return false;
    if (filters.status) {
      if (filters.status === 'bloqueado' && !u.locked_until) return false;
      if (filters.status === 'activo' && u.locked_until) return false;
    }
    if (q && !(`${u.nombre_completo} ${u.email}`).toLowerCase().includes(q)) return false;
    return true;
  };

  return (
    <div className="page-card">
      <h2>Gestión de Usuarios</h2>
      <button className="link-button" onClick={() => onNavigate('dashboard')}>Volver al panel</button>
      <div className="section">
        <h3>Usuarios</h3>
        {error && <div className="error">{error}</div>}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <select value={filters.tienda_id} onChange={e => setFilters(f => ({ ...f, tienda_id: e.target.value }))}>
            <option value="">Todas las tiendas</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <select value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
            <option value="">Todos los roles</option>
            {roles.map(r => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
          <input placeholder="Buscar por nombre o correo" value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} />
        </div>
        <div className="users-grid">
          {users.filter(applyFilters).map(user => (
            <div key={user.id} className="user-card">
              <strong>{user.nombre_completo}</strong>
              <p>{user.email}</p>
              <p>Tienda: {user.Store?.nombre || user.tienda_id}</p>
              <p>Estado: {user.activo ? (user.locked_until ? 'Bloqueado' : 'Activo') : 'Inactivo'}</p>
              <p>Roles: {user.UserRoles?.map(r => r.Role?.nombre).filter(Boolean).join(', ') || 'Sin roles'}</p>
              {user.locked_until && (
                <button className="danger" onClick={() => handleUnlockUser(user.id)}>Desbloquear</button>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => openEdit(user)}>Editar</button>
                <button onClick={() => openPasswordModal(user)}>Cambiar contraseña</button>
                {user.activo ? (
                  <button className="danger" onClick={() => handleDeactivate(user.id)}>Desactivar</button>
                ) : (
                  <button onClick={() => handleActivate(user.id)}>Activar</button>
                )}
              </div>
              <div className="role-actions">
                {roles.map(role => (
                  <button key={role.id} onClick={() => handleAssignRole(user.id, role.id)}>{`Asignar ${role.nombre}`}</button>
                ))}
              </div>
              {user.UserRoles?.length > 0 && (
                <div className="role-actions" style={{ marginTop: 8 }}>
                  {user.UserRoles.map((roleAssoc) => (
                    <button key={roleAssoc.id} className="secondary" onClick={() => handleRemoveRole(user.id, roleAssoc.rol_id)}>
                      {`Quitar ${roleAssoc.Role?.nombre || 'rol'}`}
                    </button>
                  ))}
                </div>
              )}
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
              {stores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
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
      {editingUser && editForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar usuario #{editingUser.id}</h3>
            <form onSubmit={handleEditSubmit} className="vertical-form">
              <label>
                Nombre completo
                <input value={editForm.nombre_completo} onChange={e => setEditForm({ ...editForm, nombre_completo: e.target.value })} required />
              </label>
              <label>
                Email
                <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} type="email" required />
              </label>
              <label>
                Tienda
                <select value={String(editForm.tienda_id)} onChange={e => setEditForm({ ...editForm, tienda_id: e.target.value })}>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </label>
              <div className="modal-actions">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => { setEditingUser(null); setEditForm(null); }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cambiar contraseña — {passwordUser.nombre}</h3>
            <form onSubmit={handleChangePassword} className="vertical-form">
              <label>
                Nueva contraseña
                <input value={passwordUser.password} onChange={e => setPasswordUser({ ...passwordUser, password: e.target.value })} type="password" required />
              </label>
              <div className="modal-actions">
                <button type="submit">Actualizar</button>
                <button type="button" onClick={() => setPasswordUser(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
