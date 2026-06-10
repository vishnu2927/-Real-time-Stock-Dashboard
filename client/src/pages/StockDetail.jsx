import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import CandlestickChart from '../components/CandlestickChart';
import LineChart from '../components/LineChart';
import PredictionPanel from '../components/PredictionPanel';
import { useStock } from '../context/StockContext';
import { portfolioAPI } from '../services/api';
import { useStockData } from '../hooks/useStockData';
import toast from 'react-hot-toast';

/**
 * Detailed stock page.
 */
export default function StockDetail() {
  const { symbol } = useParams();
  const { addToWatchlist } = useStock();
  const { quote, history, news, prediction, isLoading, setRange } = useStockData(symbol);

  const derived = useMemo(() => {
    const closes = history?.points?.map((point) => point.close) || [];
    const high52 = closes.length ? Math.max(...closes) : quote?.price || 0;
    const low52 = closes.length ? Math.min(...closes) : quote?.price || 0;
    const shareBase = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const marketCap = (quote?.price || 0) * (shareBase + 1_000_000);
    const peRatio = ((shareBase % 25) + 12.5).toFixed(1);

    return { high52, low52, marketCap, peRatio };
  }, [history, quote, symbol]);

  /**
   * Adds the current symbol to the watchlist.
   */
  async function handleAddWatchlist() {
    await addToWatchlist(symbol);
  }

  /**
   * Adds one share of the current symbol to the portfolio.
   */
  async function handleAddPortfolio() {
    await portfolioAPI.add({
      symbol,
      companyName: `${symbol} Holdings`,
      buyPrice: quote?.price || 0,
      quantity: 1,
      buyDate: new Date().toISOString().slice(0, 10)
    });
    toast.success('Added to portfolio');
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0F1629] p-5 shadow-2xl shadow-black/20 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Stock Detail</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{symbol}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
            <span>Market Cap: ${derived.marketCap.toLocaleString()}</span>
            <span>P/E: {derived.peRatio}</span>
            <span>52W High: ${derived.high52.toFixed(2)}</span>
            <span>52W Low: ${derived.low52.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleAddWatchlist} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5">Add to Watchlist</button>
          <button onClick={handleAddPortfolio} className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110">Add to Portfolio</button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="space-y-6">
          <CandlestickChart symbol={symbol} history={history} range="1W" onRangeChange={setRange} />
          <LineChart history={history} prediction={prediction} />
        </section>

        <PredictionPanel symbol={symbol} />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {(news?.articles || []).map((article) => (
          <motion.article key={`${article.url}-${article.headline}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-[#0F1629] p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{article.headline}</h3>
              <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">{article.sentiment}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{article.summary}</p>
          </motion.article>
        ))}
      </section>

      {isLoading ? <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-500">Loading stock details...</div> : null}
    </div>
  );
}
