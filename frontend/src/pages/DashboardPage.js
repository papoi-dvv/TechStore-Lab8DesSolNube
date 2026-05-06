import { useState } from 'react';
import { setupMfa } from '../api/api';
import { useAuth } from '../context/AuthContext';

function DashboardPage({ onNavigate }) {
  const { user, token, logout, saveSession } = useAuth();
  const [secretPayload, setSecretPayload] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetupMfa = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await setupMfa(token);
      setSecretPayload(result);
      const updatedUser = { ...user, mfa_habilitado: true };
      saveSession({ token, user: updatedUser });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <h2>Bienvenido, {user?.nombre_completo}</h2>
      <p>Tu rol(es): {user?.roles?.join(', ') || 'Sin asignar'}</p>
      <p>Tienda: {user?.tienda_id || 'No asignada'}</p>
      <div className="dashboard-buttons">
        <button onClick={() => onNavigate('products')}>Productos</button>
        {(user?.roles?.includes('Administrador') || user?.roles?.includes('Gerente')) && (
          <button onClick={() => onNavigate('roles')}>Roles</button>
        )}
        {user?.roles?.includes('Administrador') && (
          <button onClick={() => onNavigate('users')}>Usuarios</button>
        )}
      </div>
      <div className="mfa-card">
        <h3>Configuración MFA</h3>
        <p>Estado: {user?.mfa_habilitado ? 'Activado' : 'No activado'}</p>
        <button onClick={handleSetupMfa} disabled={user?.mfa_habilitado || loading}>
          {loading ? 'Configurando...' : user?.mfa_habilitado ? 'MFA activado' : 'Activar MFA'}
        </button>
        {secretPayload && (
          <div className="secret-box">
            <p>Escanea este código en tu app de autenticación:</p>
            <code>{secretPayload.otpauth_url}</code>
            <p>Clave secreta:</p>
            <code>{secretPayload.secret}</code>
          </div>
        )}
        {error && <div className="error">{error}</div>}
      </div>
      <button className="secondary" onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default DashboardPage;
