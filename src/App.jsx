import Navbar from './components/layout/Navbar';
import AppRouter from './router/AppRouter';
import { useAuth } from './hooks/useAuth';

function App() {
  useAuth();

  return (
    <div className="min-h-screen text-slate-100" style={{ backgroundColor: 'var(--screen-bg)' }}>
      <Navbar />
      <AppRouter />
    </div>
  );
}

export default App;