import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useStock } from '../context/StockContext';

const navClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm transition ${isActive ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`;

/**
 * App navigation with debounced stock search and market status.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isMarketOpen, searchResults, searchStocks, selectStock } = useStock();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim()) {
        await searchStocks(query);
        setOpen(true);
      } else {
        setOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, searchStocks]);

  const initials = useMemo(() => {
    if (!user?.name) return 'G';
    return user.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user]);

  /**
   * Handles a stock result selection.
   * @param {string} symbol
   */
  function handleSelect(symbol) {
    selectStock(symbol);
    navigate(`/stock/${symbol}`);
    setOpen(false);
    setQuery('');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0E1A]/90 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-wide text-white">
          <span className={`h-3 w-3 rounded-full ${isMarketOpen ? 'bg-emerald-400 shadow-[0_0_18px_rgba(0,212,170,0.9)]' : 'bg-rose-400'}`} />
          Real-Time Stock Dashboard
        </Link>

        <div className="relative mx-auto w-full max-w-2xl">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stocks, e.g. AAPL, TSLA, GOOGL"
            className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
          />

          <AnimatePresence>
            {open && searchResults.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute left-0 right-0 top-[110%] z-50 max-h-80 overflow-auto rounded-2xl border border-white/10 bg-[#0F1629] shadow-2xl shadow-black/40"
              >
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => handleSelect(result.symbol)}
                    className="flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/5"
                  >
                    <span>{result.name}</span>
                    <span className="text-slate-400">{result.symbol}</span>
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 justify-self-end">
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
            <NavLink to="/portfolio" className={navClass}>Portfolio</NavLink>
          </nav>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
                {initials}
              </div>
              <button onClick={logout} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-rose-400/40 hover:bg-rose-400/10">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className={navClass}>Login</NavLink>
              <NavLink to="/register" className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:brightness-110">
                Get Started
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
