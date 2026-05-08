import { useEffect, useState, useCallback } from 'react';
import { getUsers, getRoles, createUser, assignRole, removeRole, unlockUser, getStores, updateUser, updateUserPassword, activateUser, deactivateUser } from '../api/api';
import { useAuth } from '../context/AuthContext';

function roleBadge(roleName) {
  if (roleName === 'Administrador') return <span key={roleName} className="badge badge-admin">{roleName}</span>;
  if (roleName === 'Gerente')       return <span key={roleName} className="badge badge-gerente">{roleName}</span>;
  if (roleName === 'Auditor')       return <span key={roleName} className="badge badge-auditor">{roleName}</span>;
  return <span key={roleName} className="badge badge-empleado">{roleName}</span>;
}

function UsersPage() {
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
  const [showCreate, setShowCreate] = useState(false);

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [ud, rd, sd] = await Promise.all([
        getUsers(token),
        getRoles(token),
        getStores(token).catch(() => ({ stores: [] })),
      ]);
      setUsers(ud.users || []);
      setRoles(rd.roles || []);
      setStores(sd.stores || []);
    } catch (err) { setError(err.message); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const notify = (msg, isErr = false) => {
    if (isErr) setError(msg); else setMessage(msg);
  };

  const handleCreate = async e => {
    e.preventDefault(); setError(''); setMessage('');
    try {
      await createUser(token, { email: form.email, password: form.password, nombre_completo: form.nombre_completo, tienda_id: Number(form.tienda_id), roles: form.roles });
      notify('Usuario creado correctamente.');
      setForm({ email: '', password: '', nombre_completo: '', tienda_id: '1', roles: [] });
      setShowCreate(false);
      loadData();
    } catch (err) { notify(err.message, true); }
  };

  const handleRoleChange = name => setForm(p => ({
    ...p, roles: p.roles.includes(name) ? p.roles.filter(r => r !== name) : [...p.roles, name],
  }));

  const handleAssignRole  = async (uid, rid) => { try { await assignRole(token, uid, rid);  notify('Rol asignado.'); loadData(); } catch (e) { notify(e.message, true); } };
  const handleRemoveRole  = async (uid, rid) => { try { await removeRole(token, uid, rid);  notify('Rol eliminado.'); loadData(); } catch (e) { notify(e.message, true); } };
  const handleUnlock      = async uid => { try { await unlockUser(token, uid);    notify('Usuario desbloqueado.'); loadData(); } catch (e) { notify(e.message, true); } };
  const handleDeactivate  = async uid => { try { await deactivateUser(token, uid); notify('Usuario desactivado.'); loadData(); } catch (e) { notify(e.message, true); } };
  const handleActivate    = async uid => { try { await activateUser(token, uid);   notify('Usuario activado.'); loadData(); } catch (e) { notify(e.message, true); } };

  const openEdit = u => {
    setEditForm({ id: u.id, nombre_completo: u.nombre_completo, email: u.email, tienda_id: u.tienda_id || '' });
    setEditingUser(u);
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    try {
      await updateUser(token, editForm.id, { nombre_completo: editForm.nombre_completo, tienda_id: Number(editForm.tienda_id) });
      notify('Usuario actualizado.');
      setEditingUser(null); setEditForm(null);
      loadData();
    } catch (err) { notify(err.message, true); }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    try {
      await updateUserPassword(token, passwordUser.id, passwordUser.password);
      notify('Contraseña actualizada.');
      setPasswordUser(null);
    } catch (err) { notify(err.message, true); }
  };

  const applyFilters = u => {
    const q = filters.q.trim().toLowerCase();
    if (filters.tienda_id && String(u.tienda_id) !== String(filters.tienda_id)) return false;
    if (filters.role && !(u.UserRoles || []).some(ur => ur.Role?.nombre === filters.role)) return false;
    if (filters.status === 'bloqueado' && !u.locked_until) return false;
    if (filters.status === 'activo' && u.locked_until) return false;
    if (q && !`${u.nombre_completo} ${u.email}`.toLowerCase().includes(q)) return false;
    return true;
  };

  const filtered = users.filter(applyFilters);

  return (
    <div>
      {error   && <div className="alert alert-error">⚠ {error}</div>}
      {message && <div className="alert alert-success">✓ {message}</div>}

      <div className="section-header">
        <div>
          <div className="section-title">Gestión de Usuarios</div>
          <div className="section-subtitle">{filtered.length} usuarios encontrados</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? '✕ Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input placeholder="Buscar por nombre o correo…" value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} />
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
      </div>

      {/* User cards */}
      <div className="users-grid">
        {filtered.map(u => {
          const userRoleNames = u.UserRoles?.map(r => r.Role?.nombre).filter(Boolean) || [];
          const isLocked = !!u.locked_until;
          return (
            <div key={u.id} className="user-card">
              <div className="user-card-header">
                <div>
                  <div className="user-card-name">{u.nombre_completo}</div>
                  <div className="user-card-email">{u.email}</div>
                </div>
                <span className={`badge ${!u.activo ? 'badge-muted' : isLocked ? 'badge-danger' : 'badge-success'}`}>
                  {!u.activo ? 'Inactivo' : isLocked ? '🔒 Bloqueado' : '● Activo'}
                </span>
              </div>

              <div className="user-card-meta">
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  🏪 {u.Store?.nombre || `Tienda #${u.tienda_id}`}
                </span>
              </div>

              <div className="user-card-roles">
                {userRoleNames.length > 0 ? userRoleNames.map(roleBadge) : <span className="badge badge-muted">Sin roles</span>}
              </div>

              <div className="user-card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Editar</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setPasswordUser({ id: u.id, nombre: u.nombre_completo, password: '' })}>Contraseña</button>
                {isLocked && <button className="btn btn-warning btn-sm" onClick={() => handleUnlock(u.id)}>Desbloquear</button>}
                {u.activo
                  ? <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(u.id)}>Desactivar</button>
                  : <button className="btn btn-success btn-sm" onClick={() => handleActivate(u.id)}>Activar</button>
                }
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {roles.map(role => (
                  <button key={role.id} className="btn btn-secondary btn-sm" onClick={() => handleAssignRole(u.id, role.id)}>
                    + {role.nombre}
                  </button>
                ))}
                {u.UserRoles?.map(ra => (
                  <button key={ra.id} className="btn btn-danger btn-sm" onClick={() => handleRemoveRole(u.id, ra.rol_id)}>
                    − {ra.Role?.nombre || 'rol'}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ color: 'var(--muted)', padding: '24px 0' }}>No se encontraron usuarios con esos filtros.</p>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Nuevo usuario</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="vform">
              <div className="form-group"><label>Nombre completo</label><input value={form.nombre_completo} onChange={e => setForm({ ...form, nombre_completo: e.target.value })} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="form-group"><label>Contraseña</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
              <div className="form-group">
                <label>Tienda</label>
                <select value={form.tienda_id} onChange={e => setForm({ ...form, tienda_id: e.target.value })}>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Roles iniciales</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {roles.map(role => (
                    <label key={role.id} className="checkbox-row">
                      <input type="checkbox" checked={form.roles.includes(role.nombre)} onChange={() => handleRoleChange(role.nombre)} />
                      {role.nombre}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingUser && editForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Editar usuario #{editingUser.id}</h3>
              <button className="modal-close" onClick={() => { setEditingUser(null); setEditForm(null); }}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="vform">
              <div className="form-group"><label>Nombre completo</label><input value={editForm.nombre_completo} onChange={e => setEditForm({ ...editForm, nombre_completo: e.target.value })} required /></div>
              <div className="form-group"><label>Email</label><input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} type="email" required /></div>
              <div className="form-group">
                <label>Tienda</label>
                <select value={String(editForm.tienda_id)} onChange={e => setEditForm({ ...editForm, tienda_id: e.target.value })}>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingUser(null); setEditForm(null); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password modal */}
      {passwordUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Cambiar contraseña — {passwordUser.nombre}</h3>
              <button className="modal-close" onClick={() => setPasswordUser(null)}>✕</button>
            </div>
            <form onSubmit={handleChangePassword} className="vform">
              <div className="form-group"><label>Nueva contraseña</label><input type="password" value={passwordUser.password} onChange={e => setPasswordUser({ ...passwordUser, password: e.target.value })} required /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setPasswordUser(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
