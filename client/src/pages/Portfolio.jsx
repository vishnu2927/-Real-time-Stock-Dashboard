import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PortfolioTable from '../components/PortfolioTable';
import { portfolioAPI, stockAPI } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#00D4AA', '#7C3AED', '#38BDF8', '#F59E0B', '#FF4757', '#22C55E'];

/**
 * Portfolio page with summary cards, allocation pie chart, and add-stock modal.
 */
export default function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [form, setForm] = useState({ symbol: '', companyName: '', quantity: 1, buyPrice: '', buyDate: new Date().toISOString().slice(0, 10) });

  /**
   * Loads portfolio data.
   */
  async function loadData() {
    setLoading(true);
    const [portfolioResponse, summaryResponse] = await Promise.all([portfolioAPI.get(), portfolioAPI.summary()]);
    setPortfolio(portfolioResponse.data.portfolio || []);
    setSummary(summaryResponse.data.summary || null);
    setLoading(false);
  }

  useEffect(() => {
    loadData().catch(() => {
      toast.error('Unable to load portfolio');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (search.trim().length >= 1) {
        const { data } = await stockAPI.search(search);
        setSearchResults(data.results || []);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  /**
   * Deletes a holding after confirmation.
   * @param {{_id: string, symbol: string}} row
   */
  async function handleDelete(row) {
    if (!window.confirm(`Delete ${row.symbol} from your portfolio?`)) return;
    await portfolioAPI.remove(row._id);
    toast.success(`${row.symbol} removed`);
    await loadData();
  }

  /**
   * Submits the add-stock form.
   */
  async function handleAdd(event) {
    event.preventDefault();
    await portfolioAPI.add({
      symbol: form.symbol,
      companyName: form.companyName || `${form.symbol} Holdings`,
      quantity: Number(form.quantity),
      buyPrice: Number(form.buyPrice),
      buyDate: form.buyDate
    });
    toast.success('Stock added');
    setModalOpen(false);
    await loadData();
  }

  const allocationData = useMemo(() => summary?.pieData || [], [summary]);
  const bestPerformer = summary?.bestPerformer?.symbol || 'N/A';

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0F1629] p-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Portfolio</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Holdings Overview</h1>
        </div>
        <button onClick={() => setModalOpen(true)} className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950">Add Stock</button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Value', value: `$${Number(summary?.totalValue || 0).toFixed(2)}` },
          { label: 'Total Invested', value: `$${Number(summary?.totalInvested || 0).toFixed(2)}` },
          { label: 'Total P&L', value: `$${Number(summary?.totalPnL || 0).toFixed(2)}` },
          { label: 'Best Performer', value: bestPerformer }
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/10 bg-[#0F1629] p-4 backdrop-blur">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-white/10 bg-[#0F1629] p-4 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Allocation</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={72} outerRadius={108} paddingAngle={2}>
                  {allocationData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#E2E8F0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0F1629] p-4 backdrop-blur">
          <PortfolioTable rows={portfolio} onDelete={handleDelete} />
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0F1629] p-6 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Add Stock</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">Close</button>
            </div>

            <div className="mt-4 space-y-4">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search symbol" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              {searchResults.length > 0 ? (
                <div className="max-h-40 overflow-auto rounded-2xl border border-white/10 bg-white/5">
                  {searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={() => setForm((current) => ({ ...current, symbol: result.symbol, companyName: result.name }))}
                      className="flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/5"
                    >
                      <span>{result.name}</span>
                      <span className="text-slate-400">{result.symbol}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-2">
                <input value={form.symbol} onChange={(event) => setForm((current) => ({ ...current, symbol: event.target.value.toUpperCase() }))} placeholder="Symbol" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                <input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} placeholder="Company name" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                <input value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} type="number" min="1" placeholder="Quantity" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                <input value={form.buyPrice} onChange={(event) => setForm((current) => ({ ...current, buyPrice: event.target.value }))} type="number" min="0" step="0.01" placeholder="Buy price" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                <input value={form.buyDate} onChange={(event) => setForm((current) => ({ ...current, buyDate: event.target.value }))} type="date" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                <button className="rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">Save</button>
              </form>
            </div>
          </motion.div>
        </div>
      ) : null}

      {loading ? <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-500">Loading portfolio...</div> : null}
    </section>
  );
}
