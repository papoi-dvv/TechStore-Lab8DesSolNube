import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function LoginPage({ onNavigate, onMfaNeeded }) {
  const { login, saveSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.mfaRequired) {
        onMfaNeeded(result.mfaToken);
      } else {
        saveSession(result);
      }
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

        <h2>Bienvenido de vuelta</h2>
        <p className="auth-subtitle">Ingresa tus credenciales para acceder al sistema.</p>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="usuario@techstore.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Verificando...' : '→ Acceder al sistema'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>
          ¿No tienes cuenta?{' '}
          <button className="btn-link" onClick={() => onNavigate('register')}>Regístrate</button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
