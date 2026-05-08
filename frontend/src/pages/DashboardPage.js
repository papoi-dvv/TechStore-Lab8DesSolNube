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

  const handleCancelMfaSetup = () => {
    setSecretPayload(null);
    const updatedUser = { ...user, mfa_habilitado: false };
    saveSession({ token, user: updatedUser });
  };

  return (
    <div className="page-card">
      <h2>Bienvenido, {user?.nombre_completo}</h2>
      <p>Tu rol(es): {user?.roles?.join(', ') || 'Sin asignar'}</p>
      <p>Tienda: {user?.tienda_id || 'No asignada'}</p>
      <div className="dashboard-buttons">
        <button onClick={() => onNavigate('products')}>📦 Productos</button>
        {(user?.roles?.includes('Administrador') || user?.roles?.includes('Gerente')) && (
          <button onClick={() => onNavigate('roles')}>👤 Roles</button>
        )}
        {user?.roles?.includes('Administrador') && (
          <button onClick={() => onNavigate('users')}>👥 Usuarios</button>
        )}
        {(user?.roles?.includes('Auditor') || user?.roles?.includes('Gerente') || user?.roles?.includes('Administrador')) && (
          <button onClick={() => onNavigate('audits')}>📋 Auditorías</button>
        )}
        {(user?.roles?.includes('Auditor') || user?.roles?.includes('Gerente') || user?.roles?.includes('Administrador')) && (
          <button onClick={() => onNavigate('reports')}>📊 Reportes</button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Configuración MFA pendiente</p>
              <button type="button" className="secondary" onClick={handleCancelMfaSetup}>Cancelar activación</button>
            </div>
            <p>Escanea este código en tu app de autenticación (Google Authenticator, Authy, Microsoft Authenticator, etc.):</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code?data=${encodeURIComponent(secretPayload.otpauth_url)}&size=220x220`}
              alt="QR para MFA"
            />
            <p>Si no puedes escanear el QR, copia manualmente la clave secreta:</p>
            <code>{secretPayload.secret}</code>
            <p>
              Cuando termines, cierra sesión y vuelve a iniciar sesión. Después de ingresar tu email y contraseña, se te pedirá el código de 6 dígitos.
            </p>
          </div>
        )}
        {error && <div className="error">{error}</div>}
      </div>
      <button className="secondary" onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default DashboardPage;
