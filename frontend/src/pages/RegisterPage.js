import { useState } from 'react';
import { register } from '../api/api';

function RegisterPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [tiendaId, setTiendaId] = useState('1');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register({ email, password, nombre_completo: nombre, tienda_id: Number(tiendaId) });
      setSuccess('Registro correcto. Ahora puedes iniciar sesión.');
      setEmail('');
      setPassword('');
      setNombre('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre completo
          <input value={nombre} onChange={e => setNombre(e.target.value)} type="text" required />
        </label>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Contraseña
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </label>
        <label>
          Tienda asignada
          <select value={tiendaId} onChange={e => setTiendaId(e.target.value)}>
            <option value="1">Sucursal Central</option>
            <option value="2">Sucursal Norte</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrar'}</button>
      </form>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="helper-text">
        <span>Ya tienes cuenta?</span>
        <button className="link-button" onClick={() => onNavigate('login')}>Inicia sesión</button>
      </div>
    </div>
  );
}

export default RegisterPage;
