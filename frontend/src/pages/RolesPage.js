import { useEffect, useState } from 'react';
import { getRoles, createRole } from '../api/api';
import { useAuth } from '../context/AuthContext';

function RolesPage({ onNavigate }) {
  const { token, user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoles();
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

  const handleCreate = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await createRole(token, { nombre, descripcion });
      setMessage('Rol creado correctamente.');
      setNombre('');
      setDescripcion('');
      loadRoles();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-card">
      <h2>Gestión de Roles</h2>
      <button className="link-button" onClick={() => onNavigate('dashboard')}>Volver al panel</button>
      <div className="section">
        <h3>Roles existentes</h3>
        {error && <div className="error">{error}</div>}
        <ul>
          {roles.map(role => (
            <li key={role.id}>{role.nombre} - {role.descripcion}</li>
          ))}
        </ul>
      </div>
      {user?.roles?.includes('Administrador') && (
        <div className="section">
          <h3>Crear nuevo rol</h3>
          <form onSubmit={handleCreate}>
            <label>
              Nombre
              <input value={nombre} onChange={e => setNombre(e.target.value)} required />
            </label>
            <label>
              Descripción
              <input value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            </label>
            <button type="submit">Crear rol</button>
          </form>
          {message && <div className="success">{message}</div>}
        </div>
      )}
    </div>
  );
}

export default RolesPage;
