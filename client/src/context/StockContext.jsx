import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { stockAPI, watchlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const StockContext = createContext(null);

/**
 * Provides stock state, watchlist state, and market status.
 * @param {{children: import('react').ReactNode}} props
 */
export function StockProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [searchResults, setSearchResults] = useState([]);
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  /**
   * Selects a stock symbol.
   * @param {string} symbol
   */
  function selectStock(symbol) {
    setSelectedSymbol(symbol.toUpperCase());
  }

  /**
   * Searches stocks by query.
   * @param {string} query
   */
  async function searchStocks(query) {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    const { data } = await stockAPI.search(query);
    const results = data.results || [];
    setSearchResults(results);
    return results;
  }

  /**
   * Adds a symbol to the authenticated user's watchlist.
   * @param {string} symbol
   */
  async function addToWatchlist(symbol) {
    const normalized = symbol.toUpperCase();
    await watchlistAPI.add({ symbol: normalized });
    setWatchlist((current) => (current.includes(normalized) ? current : [...current, normalized]));
    toast.success(`${normalized} added to watchlist`);
  }

  /**
   * Removes a symbol from the authenticated user's watchlist.
   * @param {string} symbol
   */
  async function removeFromWatchlist(symbol) {
    const normalized = symbol.toUpperCase();
    await watchlistAPI.remove(normalized);
    setWatchlist((current) => current.filter((item) => item !== normalized));
    toast.success(`${normalized} removed from watchlist`);
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const { data } = await stockAPI.marketStatus();
        if (mounted) setIsMarketOpen(Boolean(data.isOpen));
      } catch (_error) {
        if (mounted) setIsMarketOpen(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadWatchlist() {
      if (!isAuthenticated) {
        if (mounted) setWatchlist([]);
        return;
      }

      try {
        const { data } = await watchlistAPI.get();
        if (mounted) setWatchlist(data.watchlist?.symbols || []);
      } catch (_error) {
        if (mounted) setWatchlist([]);
      }
    }

    loadWatchlist();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      watchlist,
      selectedSymbol,
      searchResults,
      isMarketOpen,
      selectStock,
      searchStocks,
      addToWatchlist,
      removeFromWatchlist,
      setSelectedSymbol,
      setSearchResults,
      setWatchlist
    }),
    [watchlist, selectedSymbol, searchResults, isMarketOpen]
  );

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

/**
 * Accesses the stock context.
 */
export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within StockProvider');
  }
  return context;
}
