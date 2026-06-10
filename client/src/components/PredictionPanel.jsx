import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { stockAPI } from '../services/api';

/**
 * Fetches and displays the 7-day prediction line for a symbol.
 * @param {{symbol: string}} props
 */
export default function PredictionPanel({ symbol }) {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadPrediction() {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await stockAPI.predict(symbol, 7);
        if (active) setPrediction(data.prediction);
      } catch (requestError) {
        if (active) setError(requestError);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadPrediction();
    return () => {
      active = false;
    };
  }, [symbol]);

  const chartData = useMemo(() => prediction?.predictions || [], [prediction]);
  const first = chartData[0]?.predictedPrice || 0;
  const last = chartData.at(-1)?.predictedPrice || 0;
  const directionUp = last >= first;
  const support = chartData.length ? Math.min(...chartData.map((item) => item.predictedPrice)) : 0;
  const resistance = chartData.length ? Math.max(...chartData.map((item) => item.predictedPrice)) : 0;

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-3xl border border-white/10 bg-[#0F1629] p-4">
        <div className="h-5 w-32 rounded bg-white/10" />
        <div className="mt-4 h-48 rounded-2xl bg-white/5" />
        <div className="mt-4 h-4 w-48 rounded bg-white/10" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-200">Prediction unavailable.</div>;
  }

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-[#0F1629] p-4 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">AI Forecast</p>
          <h3 className="text-xl font-semibold text-white">Next 7 days</h3>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${directionUp ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>
          {directionUp ? 'UP' : 'DOWN'}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-4 text-sm text-slate-300">
        <span>Confidence: {(Number(prediction?.confidence || 0) * 100).toFixed(0)}%</span>
        <span>Support: ${support.toFixed(2)}</span>
        <span>Resistance: ${resistance.toFixed(2)}</span>
      </div>

      <div className="h-56 w-full rounded-2xl bg-white/5 p-2">
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="predictionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={48} domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip contentStyle={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#E2E8F0' }} />
            <Area type="monotone" dataKey="predictedPrice" stroke="#7C3AED" strokeWidth={2.5} fill="url(#predictionFill)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}
