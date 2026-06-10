import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const featureCards = [
  { title: 'Real-time data', description: 'Socket-driven updates with live market ticks.' },
  { title: 'AI prediction', description: '7-day forecast pipeline powered by the ML service.' },
  { title: 'Portfolio tracker', description: 'Track holdings, P&L, and allocation at a glance.' }
];

/**
 * Public landing page.
 */
export default function Home() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Track stocks in real-time</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
          Build your edge with live prices, charts, and prediction signals.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-300">
          Real-Time Stock Dashboard combines authentication, watchlists, portfolio analytics, and an AI forecasting service into a single polished market workspace.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link to="/register" className="rounded-full bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110">Get Started</Link>
          <Link to="/login" className="rounded-full border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/5">Login</Link>
        </div>

        <div className="grid gap-4 pt-2 sm:grid-cols-3">
          {featureCards.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-white/10 bg-[#0F1629] p-4 shadow-2xl shadow-black/15 backdrop-blur">
              <h3 className="text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0F1629] p-5 shadow-2xl shadow-black/25 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Demo Chart</p>
            <h2 className="text-2xl font-semibold text-white">Market pulse</h2>
          </div>
          <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">Live-style animation</div>
        </div>

        <div className="mt-6 grid grid-cols-6 gap-3">
          {[18, 32, 24, 38, 30, 44, 52, 48, 61, 56, 67, 72].map((height, index) => (
            <motion.div
              key={index}
              initial={{ height: 10, opacity: 0.25 }}
              animate={{ height }}
              transition={{ duration: 0.7, delay: index * 0.06 }}
              className={`rounded-full ${index % 2 === 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
              style={{ minHeight: 10 }}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-500">Signal</p>
            <p className="mt-2 text-2xl font-semibold text-white">Momentum bullish</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-500">Confidence</p>
            <p className="mt-2 text-2xl font-semibold text-white">84%</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
