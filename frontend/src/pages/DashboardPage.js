import { useState } from 'react';
import { setupMfa } from '../api/api';
import { useAuth } from '../context/AuthContext';

function DashboardPage({ onNavigate }) {
  const { user, token, saveSession } = useAuth();
  const [secretPayload, setSecretPayload] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = user?.roles || [];
  const isAdmin   = roles.includes('Administrador');
  const isGerente = roles.includes('Gerente');
  const isAuditor = roles.includes('Auditor');

  const handleSetupMfa = async () => {
    setError(''); setLoading(true);
    try {
      const result = await setupMfa(token);
      setSecretPayload(result);
      saveSession({ token, user: { ...user, mfa_habilitado: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelMfa = () => {
    setSecretPayload(null);
    saveSession({ token, user: { ...user, mfa_habilitado: false } });
  };

  const navItems = [
    { key: 'products', icon: '📦', label: 'Inventario',  sub: 'Gestionar productos', show: true },
    { key: 'roles',    icon: '🛡',  label: 'Roles',       sub: 'Permisos y acceso',   show: isAdmin || isGerente },
    { key: 'users',    icon: '👥',  label: 'Usuarios',    sub: 'Gestionar cuentas',   show: isAdmin },
    { key: 'audits',   icon: '📋',  label: 'Auditorías',  sub: 'Control de calidad',  show: isAdmin || isGerente || isAuditor },
    { key: 'reports',  icon: '📊',  label: 'Reportes',    sub: 'Métricas y análisis', show: isAdmin || isGerente || isAuditor },
  ].filter(i => i.show);

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          Hola, {user?.nombre_completo?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Sucursal #{user?.tienda_id || '—'} · {roles.join(', ') || 'Sin rol asignado'}
        </p>
      </div>

      {/* Quick nav */}
      <div className="dash-nav-grid">
        {navItems.map(item => (
          <button key={item.key} className="dash-nav-btn" onClick={() => onNavigate(item.key)}>
            <span className="dash-nav-btn-icon">{item.icon}</span>
            <span className="dash-nav-btn-label">{item.label}</span>
            <span className="dash-nav-btn-sub">{item.sub}</span>
          </button>
        ))}
      </div>

      {/* MFA section */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">🔐 Autenticación de dos factores</div>
            <div className="card-subtitle">Protege tu cuenta con verificación adicional</div>
          </div>
          <span className={`badge ${user?.mfa_habilitado ? 'badge-success' : 'badge-muted'}`}>
            {user?.mfa_habilitado ? '✓ Activo' : 'Inactivo'}
          </span>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        {!secretPayload ? (
          <button
            className={`btn ${user?.mfa_habilitado ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleSetupMfa}
            disabled={user?.mfa_habilitado || loading}
          >
            {loading ? 'Configurando...' : user?.mfa_habilitado ? '✓ MFA ya configurado' : '🔑 Activar MFA'}
          </button>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ color: 'var(--text)', fontWeight: 600, margin: 0 }}>Escanea el código QR con tu app de autenticación</p>
              <button className="btn btn-secondary btn-sm" onClick={handleCancelMfa}>Cancelar</button>
            </div>
            <div className="mfa-qr-box">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code?data=${encodeURIComponent(secretPayload.otpauth_url)}&size=200x200`}
                alt="QR MFA"
              />
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '12px 0 6px' }}>
              O copia la clave secreta manualmente:
            </p>
            <div className="secret-code">{secretPayload.secret}</div>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 12 }}>
              Cierra sesión y vuelve a ingresar. Se te pedirá el código de 6 dígitos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
