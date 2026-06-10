import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StockDetail = lazy(() => import('./pages/StockDetail'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

function PageSkeleton() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-white/10 bg-[#0F1629] text-slate-300">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        Loading page...
      </div>
    </div>
  );
}

/**
 * Protects authenticated routes.
 * @param {{children: import('react').ReactNode}} props
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <PageSkeleton />;
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
  const location = useLocation();
  const showFooter = !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/stock/');

  return (
    <div className="min-h-screen text-slate-100">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#0F1629', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stock/:symbol" element={<ProtectedRoute><StockDetail /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
