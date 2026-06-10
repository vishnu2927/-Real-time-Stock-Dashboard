import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useStock } from '../context/StockContext';
import { useWebSocket } from '../hooks/useWebSocket';

const navClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm transition ${isActive ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`;

/**
 * App navigation with debounced stock search and market status.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isMarketOpen, searchResults, searchStocks, selectStock, searchLoading } = useStock();
  const { isConnected, isReconnecting } = useWebSocket([]);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        void searchStocks(query);
        setSearchOpen(true);
      } else {
        setSearchOpen(false);
        setActiveIndex(-1);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, searchStocks]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setSearchOpen(false);
        setDropdownOpen(false);
        setMobileSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    setActiveIndex(searchResults.length > 0 ? 0 : -1);
  }, [searchResults]);

  const initials = useMemo(() => {
    if (!user?.name) return 'G';
    return user.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user]);

  const timeLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).format(currentTime),
    [currentTime]
  );

  const showResults = searchOpen && query.trim().length > 0;

  /**
   * Handles a stock result selection.
   * @param {string} symbol
   */
  function handleSelect(symbol) {
    selectStock(symbol);
    navigate(`/stock/${symbol}`);
    setSearchOpen(false);
    setQuery('');
    setMobileSearchOpen(false);
  }

  function handleKeyDown(event) {
    if (!showResults || searchResults.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % searchResults.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? searchResults.length - 1 : current - 1));
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(searchResults[activeIndex].symbol);
    }

    if (event.key === 'Escape') {
      setSearchOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0E1A]/90 backdrop-blur-xl">
      <div ref={containerRef} className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-wide text-white">
          <span className={`h-3 w-3 rounded-full ${isMarketOpen ? 'bg-emerald-400 shadow-[0_0_18px_rgba(0,212,170,0.9)]' : 'bg-rose-400'}`} />
          Real-Time Stock Dashboard
        </Link>

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="flex items-center gap-2 md:block">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 md:hidden"
              aria-label="Toggle search"
            >
              ⌕
            </button>

            <div className={`${mobileSearchOpen ? 'block' : 'hidden'} relative w-full md:block`}>
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => query.trim() && setSearchOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search stocks, e.g. AAPL, TSLA, GOOGL"
                className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 pr-14 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
              />
              {searchLoading ? <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-emerald-300">Loading...</span> : null}
            </div>
          </div>

          <AnimatePresence>
            {showResults ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute left-0 right-0 top-[110%] z-50 max-h-80 overflow-auto rounded-2xl border border-white/10 bg-[#0F1629] shadow-2xl shadow-black/40"
              >
                {searchLoading ? (
                  <div className="px-4 py-4 text-sm text-slate-400">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <button
                      key={result.symbol}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelect(result.symbol)}
                      className={`flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left text-sm transition ${activeIndex === index ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5'}`}
                    >
                      <span>
                        <span className="block font-medium text-white">{result.name}</span>
                        <span className="block text-xs text-slate-400">{result.symbol} · {result.exchange || 'NASDAQ'}</span>
                      </span>
                      <span className="text-slate-400">{result.symbol}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm text-slate-400">No stocks found for '{query.trim()}'</div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 justify-self-end">
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
            <NavLink to="/portfolio" className={navClass}>Portfolio</NavLink>
          </nav>

          <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 lg:flex">
            <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span>{isConnected ? 'Connected' : isReconnecting ? 'Reconnecting...' : 'Offline'}</span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 lg:flex">
            <span className={`h-2.5 w-2.5 rounded-full ${isMarketOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span>{isMarketOpen ? 'Market Open' : 'Market Closed'}</span>
            <span className="text-slate-500">{timeLabel} EST</span>
          </div>

          {user ? (
            <div className="relative flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDropdownOpen((current) => !current)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white"
              >
                {initials}
              </button>

              <AnimatePresence>
                {dropdownOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-12 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#0F1629] shadow-2xl shadow-black/30"
                  >
                    <Link to="/portfolio" className="block px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5">Profile</Link>
                    <Link to="/portfolio" className="block px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5">Settings</Link>
                    <button type="button" onClick={() => logout()} className="block w-full px-4 py-3 text-left text-sm text-rose-200 transition hover:bg-rose-400/10">
                      Logout
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
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
