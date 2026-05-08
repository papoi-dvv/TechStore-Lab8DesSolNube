import { useState } from 'react';
import { verifyMfa } from '../api/api';

function MfaPage({ mfaToken, onSuccess, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
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
    <div className="page-card">
      <h2>Verificación MFA</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Código de 6 dígitos
          <input value={code} onChange={e => setCode(e.target.value)} maxLength={6} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Verificando...' : 'Confirmar'}</button>
      </form>
      {error && <div className="error">{error}</div>}
      <div className="helper-text">
        <button className="link-button" onClick={onBack}>Volver</button>
      </div>
    </div>
  );
}

export default MfaPage;
