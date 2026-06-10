import { useMemo } from 'react';
import { motion } from 'framer-motion';
import StockCard from '../components/StockCard';
import WatchlistSidebar from '../components/WatchlistSidebar';
import LineChart from '../components/LineChart';
import CandlestickChart from '../components/CandlestickChart';
import { useStock } from '../context/StockContext';
import { useStockData } from '../hooks/useStockData';
import { useWebSocket } from '../hooks/useWebSocket';

const marketSymbols = [
  { symbol: 'SPY', companyName: 'S&P 500' },
  { symbol: 'QQQ', companyName: 'NASDAQ' },
  { symbol: 'DIA', companyName: 'DOW' },
  { symbol: 'BTCUSD', companyName: 'BTC' }
];

/**
 * Main dashboard view with cards, chart, watchlist, and news feed.
 */
export default function Dashboard() {
  const { selectedSymbol } = useStock();
  const { history, news, prediction, isLoading, setRange } = useStockData(selectedSymbol);
  const { prices } = useWebSocket(marketSymbols.map((item) => item.symbol));

  const topCards = useMemo(() => marketSymbols.map((item) => ({ ...item, ...prices[item.symbol] })), [prices]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <section className="space-y-6">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {topCards.map((item) => (
            <StockCard key={item.symbol} symbol={item.symbol} companyName={item.companyName} price={item.price} change={item.change} changePercent={item.changePercent} isLoading={!prices[item.symbol]} />
          ))}
        </div>

        <CandlestickChart symbol={selectedSymbol} history={history} range="1W" onRangeChange={setRange} isLoading={isLoading} />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <LineChart history={history} prediction={prediction} />

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-[#0F1629] p-4 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Market News</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{selectedSymbol}</h3>
            <div className="mt-4 space-y-3">
              {isLoading ? <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-500">Loading news...</div> : null}
              {news?.articles?.map((article) => (
                <article key={`${article.url}-${article.headline}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-medium text-white">{article.headline}</h4>
                    <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">{article.sentiment}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{article.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">{article.source}</p>
                </article>
              ))}
            </div>
          </motion.section>
        </div>
      </section>

      <WatchlistSidebar />
    </div>
  );
}
