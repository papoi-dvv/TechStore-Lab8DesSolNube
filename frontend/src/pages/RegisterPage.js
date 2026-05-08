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

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await register({ email, password, nombre_completo: nombre, tienda_id: Number(tiendaId) });
      setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
      setEmail(''); setPassword(''); setNombre('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <div>
            <div className="auth-logo-text">TechStore</div>
            <div className="auth-logo-sub">Inventory Management</div>
          </div>
        </div>

        <h2>Crear cuenta</h2>
        <p className="auth-subtitle">Completa los datos para registrarte en el sistema.</p>

        {error   && <div className="alert alert-error">⚠ {error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Juan Pérez" required />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@techstore.com" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="form-group">
            <label>Sucursal asignada</label>
            <select value={tiendaId} onChange={e => setTiendaId(e.target.value)}>
              <option value="1">Sucursal Central</option>
              <option value="2">Sucursal Norte</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Registrando...' : '→ Crear cuenta'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>
          ¿Ya tienes cuenta?{' '}
          <button className="btn-link" onClick={() => onNavigate('login')}>Inicia sesión</button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
