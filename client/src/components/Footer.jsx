import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const techStack = ['React', 'Node.js', 'WebSocket', 'MongoDB', 'Redis', 'Python', 'FastAPI', 'ML'];

/**
 * Site footer shown on public and authenticated non-dashboard pages.
 */
export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="mt-10 border-t border-[#1a2035] bg-[#080B14]"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-300 md:grid-cols-3 lg:px-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg">📈</div>
            <div>
              <h2 className="text-base font-semibold">Real-Time Stock Dashboard</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Track markets. Predict trends. Build wealth.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <a href="https://github.com/vishnu2927/-Real-time-Stock-Dashboard" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-1 transition hover:border-emerald-400/40 hover:text-white">
              GitHub
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-1 transition hover:border-emerald-400/40 hover:text-white">
              LinkedIn
            </a>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-xs uppercase tracking-[0.25em] text-slate-500">Navigation</h3>
          <div className="grid gap-2 text-slate-300">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <Link to="/dashboard" className="transition hover:text-white">Dashboard</Link>
            <Link to="/portfolio" className="transition hover:text-white">Portfolio</Link>
            <Link to="/login" className="transition hover:text-white">Login</Link>
            <Link to="/register" className="transition hover:text-white">Register</Link>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-xs uppercase tracking-[0.25em] text-slate-500">Built With</h3>
          <div className="flex flex-wrap gap-2">
            {techStack.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-[#1a2035]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <span>© 2026 Real-Time Stock Dashboard. Built by Vishnu.</span>
          <span>Made with ❤️ for learning and growth</span>
        </div>
      </div>
    </motion.footer>
  );
}
