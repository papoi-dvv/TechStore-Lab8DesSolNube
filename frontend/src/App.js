import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MfaPage from './pages/MfaPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import RolesPage from './pages/RolesPage';
import UsersPage from './pages/UsersPage';
import AuditsPage from './pages/AuditsPage';
import ReportsPage from './pages/ReportsPage';
import './App.css';

const NAV_ITEMS = [
  { key: 'dashboard', icon: '⊞', label: 'Dashboard', sub: 'Panel principal', roles: null },
  { key: 'products',  icon: '📦', label: 'Inventario',  sub: 'Productos y stock', roles: null },
  { key: 'users',     icon: '👥', label: 'Usuarios',    sub: 'Gestión de cuentas', roles: ['Administrador'] },
  { key: 'roles',     icon: '🛡', label: 'Roles',       sub: 'Permisos y acceso', roles: ['Administrador', 'Gerente'] },
  { key: 'audits',    icon: '📋', label: 'Auditorías',  sub: 'Registros de control', roles: ['Administrador', 'Gerente', 'Auditor'] },
  { key: 'reports',   icon: '📊', label: 'Reportes',    sub: 'Métricas y análisis', roles: ['Administrador', 'Gerente', 'Auditor'] },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  products:  'Inventario de Productos',
  users:     'Gestión de Usuarios',
  roles:     'Gestión de Roles',
  audits:    'Auditorías',
  reports:   'Reportes',
};

function getRoleBadgeClass(role) {
  if (role === 'Administrador') return 'badge badge-admin';
  if (role === 'Gerente') return 'badge badge-gerente';
  if (role === 'Auditor') return 'badge badge-auditor';
  return 'badge badge-empleado';
}

function Sidebar({ view, onNavigate, user, onLogout }) {
  const userRoles = user?.roles || [];
  const initials = user?.nombre_completo?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.some(r => userRoles.includes(r))
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">⚡</div>
        <div>
          <div className="sidebar-brand-name">TechStore</div>
          <div className="sidebar-brand-sub">Inventory System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map(item => (
          <button
            key={item.key}
            className={`nav-item${view === item.key ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.nombre_completo}</div>
            <div className="sidebar-user-role">{userRoles[0] || 'Sin rol'}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-full" style={{ marginTop: 8, justifyContent: 'flex-start', gap: 8 }} onClick={onLogout}>
          <span>↩</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function AppContent() {
  const { isAuthenticated, saveSession, user, logout } = useAuth();
  const [view, setView] = useState('login');
  const [mfaToken, setMfaToken] = useState(null);

  useEffect(() => {
    if (isAuthenticated && view === 'login') setView('dashboard');
    if (!isAuthenticated && !['login', 'register', 'mfa'].includes(view)) setView('login');
  }, [isAuthenticated, view]);

  const handleMfaNeeded = token => { setMfaToken(token); setView('mfa'); };
  const handleMfaSuccess = session => { saveSession(session); setMfaToken(null); setView('dashboard'); };

  const pageProps = { onNavigate: setView };

  if (!isAuthenticated) {
    return (
      <>
        {view === 'login'    && <LoginPage onNavigate={setView} onMfaNeeded={handleMfaNeeded} />}
        {view === 'register' && <RegisterPage onNavigate={setView} />}
        {view === 'mfa'      && <MfaPage mfaToken={mfaToken} onSuccess={handleMfaSuccess} onBack={() => setView('login')} />}
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar view={view} onNavigate={setView} user={user} onLogout={logout} />
      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title">{PAGE_TITLES[view] || 'TechStore'}</span>
          <div className="topbar-right">
            <div className="topbar-badge">
              <span className="status-dot" />
              Sistema activo
            </div>
            {(user?.roles || []).map(r => (
              <span key={r} className={getRoleBadgeClass(r)}>{r}</span>
            ))}
          </div>
        </header>
        <main className="page-content">
          {view === 'dashboard' && <DashboardPage {...pageProps} />}
          {view === 'products'  && <ProductsPage  {...pageProps} />}
          {view === 'roles'     && <RolesPage     {...pageProps} />}
          {view === 'users'     && <UsersPage     {...pageProps} />}
          {view === 'audits'    && <AuditsPage    {...pageProps} />}
          {view === 'reports'   && <ReportsPage   {...pageProps} />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
