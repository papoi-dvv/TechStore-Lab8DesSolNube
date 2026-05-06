import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MfaPage from './pages/MfaPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import RolesPage from './pages/RolesPage';
import UsersPage from './pages/UsersPage';
import './App.css';

function AppContent() {
  const { isAuthenticated, saveSession } = useAuth();
  const [view, setView] = useState('login');
  const [mfaToken, setMfaToken] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      setView('dashboard');
    } else if (['dashboard', 'products', 'roles', 'users'].includes(view)) {
      setView('login');
    }
  }, [isAuthenticated]);

  const handleMfaNeeded = token => {
    setMfaToken(token);
    setView('mfa');
  };

  const handleMfaSuccess = session => {
    saveSession(session);
    setMfaToken(null);
    setView('dashboard');
  };

  const pageProps = {
    onNavigate: setView,
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TechStore Inventory</h1>
      </header>
      <main>
        {view === 'login' && <LoginPage onNavigate={setView} onMfaNeeded={handleMfaNeeded} />}
        {view === 'register' && <RegisterPage onNavigate={setView} />}
        {view === 'mfa' && <MfaPage mfaToken={mfaToken} onSuccess={handleMfaSuccess} onBack={() => setView('login')} />}
        {view === 'dashboard' && <DashboardPage {...pageProps} />}
        {view === 'products' && <ProductsPage {...pageProps} />}
        {view === 'roles' && <RolesPage {...pageProps} />}
        {view === 'users' && <UsersPage {...pageProps} />}
      </main>
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
