import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

/**
 * Protects authenticated routes.
 * @param {{children: import('react').ReactNode}} props
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="px-4 py-10 text-center text-slate-300">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Root application shell.
 */
export default function App() {
  return (
    <div className="min-h-screen text-slate-100">
      <Toaster position="top-right" toastOptions={{ style: { background: '#0F1629', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/stock/:symbol" element={<ProtectedRoute><StockDetail /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
