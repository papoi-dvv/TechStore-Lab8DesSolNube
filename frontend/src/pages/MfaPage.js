import { useState } from 'react';
import { verifyMfa } from '../api/api';

function MfaPage({ mfaToken, onSuccess, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await verifyMfa(mfaToken, code);
      onSuccess(result);
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
          <div className="auth-logo-icon">🔐</div>
          <div>
            <div className="auth-logo-text">TechStore</div>
            <div className="auth-logo-sub">Verificación en dos pasos</div>
          </div>
        </div>

        <h2>Verificación MFA</h2>
        <p className="auth-subtitle">Ingresa el código de 6 dígitos de tu app de autenticación.</p>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Código de verificación</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              maxLength={6}
              placeholder="000000"
              style={{ fontSize: '1.4rem', letterSpacing: '0.4em', textAlign: 'center' }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Verificando...' : '🔓 Confirmar acceso'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center' }}>
          <button className="btn-link" onClick={onBack}>← Volver al inicio de sesión</button>
        </p>
      </div>
    </div>
  );
}

export default MfaPage;
