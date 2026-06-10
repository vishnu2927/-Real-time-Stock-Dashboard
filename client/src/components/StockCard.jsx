import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWebSocket } from '../hooks/useWebSocket';

/**
 * Renders a real-time market card with a compact sparkline.
 * @param {{symbol: string, companyName?: string, price?: number, change?: number, changePercent?: number}} props
 */
export default function StockCard({ symbol, companyName, price = 0, change = 0, changePercent = 0 }) {
  const navigate = useNavigate();
  const { prices } = useWebSocket([symbol]);
  const live = prices[symbol] || {};
  const displayPrice = live.price ?? price;
  const displayChange = live.change ?? change;
  const displayChangePercent = live.changePercent ?? changePercent;
  const isUp = displayChange >= 0;

  const sparkline = useMemo(() => {
    const base = displayPrice || 100;
    return Array.from({ length: 7 }, (_, index) => ({
      x: index,
      y: base + Math.sin(index / 1.5) * 2 + index * (isUp ? 0.4 : -0.35)
    }));
  }, [displayPrice, isUp]);

  const maxY = Math.max(...sparkline.map((point) => point.y));
  const minY = Math.min(...sparkline.map((point) => point.y));
  const width = 140;
  const height = 56;
  const path = sparkline
    .map((point, index) => {
      const x = (index / (sparkline.length - 1)) * width;
      const y = height - ((point.y - minY) / (maxY - minY || 1)) * (height - 6) - 3;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/stock/${symbol}`)}
      className="group rounded-3xl border border-white/10 bg-[#0F1629]/90 p-4 text-left shadow-2xl shadow-black/20 backdrop-blur transition hover:border-emerald-400/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{symbol}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{companyName || symbol}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${isUp ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>
          {displayChange >= 0 ? '+' : ''}{displayChangePercent.toFixed(2)}%
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <motion.div key={displayPrice.toFixed(2)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold text-white">
            ${displayPrice.toFixed(2)}
          </motion.div>
          <p className={`mt-1 text-sm ${isUp ? 'text-emerald-300' : 'text-rose-300'}`}>
            {displayChange >= 0 ? '+' : ''}{displayChange.toFixed(2)}
          </p>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-36 text-emerald-400/90">
          <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.button>
  );
}
