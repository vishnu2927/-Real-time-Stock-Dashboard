import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStock } from '../context/StockContext';
import { useWebSocket } from '../hooks/useWebSocket';

/**
 * Fixed, collapsible watchlist sidebar with live prices.
 */
export default function WatchlistSidebar() {
  const { watchlist, addToWatchlist, removeFromWatchlist, selectStock } = useStock();
  const { prices } = useWebSocket(watchlist);
  const [symbol, setSymbol] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  /**
   * Adds a new symbol to the watchlist.
   */
  async function handleAdd() {
    if (!symbol.trim()) return;
    await addToWatchlist(symbol.trim());
    setSymbol('');
  }

  return (
    <motion.aside layout className="fixed right-4 top-24 z-30 hidden h-[calc(100vh-7rem)] w-80 md:block">
      <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0F1629]/95 p-4 shadow-2xl shadow-black/25 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Watchlist</p>
            <h3 className="text-xl font-semibold text-white">Live Symbols</h3>
          </div>
          <button onClick={() => setCollapsed((current) => !current)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
            {collapsed ? 'Open' : 'Collapse'}
          </button>
        </div>

        <AnimatePresence>
          {!collapsed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex gap-2">
                <input
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value)}
                  placeholder="Add symbol"
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
                <button onClick={handleAdd} className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950">
                  Add
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {watchlist.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500">No watchlist symbols yet.</div> : null}
                {watchlist.map((item) => {
                  const live = prices[item] || {};
                  const isUp = (live.change || 0) >= 0;
                  return (
                    <button
                      key={item}
                      onClick={() => selectStock(item)}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-emerald-400/30 hover:bg-white/10"
                    >
                      <div>
                        <div className="font-semibold text-white">{item}</div>
                        <div className={`text-xs ${isUp ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {(live.change || 0) >= 0 ? '+' : ''}{Number(live.changePercent || 0).toFixed(2)}%
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium text-white">${Number(live.price || 0).toFixed(2)}</div>
                          <div className={`text-xs ${isUp ? 'text-emerald-300' : 'text-rose-300'}`}>{isUp ? '▲' : '▼'}</div>
                        </div>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            void removeFromWatchlist(item);
                          }}
                          className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-[11px] text-rose-200"
                        >
                          Remove
                        </button>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Sidebar collapsed</div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
