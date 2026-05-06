import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function LoginPage({ onNavigate, onMfaNeeded }) {
  const { login, saveSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.mfaRequired) {
        onMfaNeeded(result.mfaToken);
      } else {
        saveSession(result);
        alert('Sesión iniciada correctamente.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Contraseña
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Verificando...' : 'Acceder'}</button>
      </form>
      {error && <div className="error">{error}</div>}
      <div className="helper-text">
        <span>No tienes cuenta?</span>
        <button className="link-button" onClick={() => onNavigate('register')}>Regístrate</button>
      </div>
    </div>
  );
}

export default LoginPage;
