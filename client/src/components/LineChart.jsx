import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line
} from 'recharts';

/**
 * Renders a line/area chart with optional prediction overlay.
 * @param {{history?: {points?: Array}, prediction?: {predictions?: Array}}} props
 */
export default function LineChart({ history, prediction }) {
  const chartData = useMemo(() => {
    const historyPoints = history?.points || [];
    const predictionPoints = prediction?.predictions || [];
    const values = historyPoints.map((point) => ({
      date: point.time,
      price: point.close,
      prediction: null
    }));

    predictionPoints.forEach((point) => {
      values.push({
        date: point.date,
        price: null,
        prediction: point.predictedPrice
      });
    });

    return values;
  }, [history, prediction]);

  const isPositive = chartData.length < 2 ? true : (chartData.find((point) => point.price !== null)?.price || 0) <= (chartData.filter((point) => point.price !== null).at(-1)?.price || 0);
  const gradientId = isPositive ? 'greenGradient' : 'redGradient';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-[#0F1629] p-4 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Trend</p>
          <h3 className="text-xl font-semibold text-white">Price History</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${isPositive ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>
          Prediction overlay
        </span>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00D4AA" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4757" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF4757" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} width={48} />
            <Tooltip
              contentStyle={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#E2E8F0' }}
              labelStyle={{ color: '#E2E8F0' }}
            />
            <Area type="monotone" dataKey="price" stroke={isPositive ? '#00D4AA' : '#FF4757'} strokeWidth={2.5} fill={`url(#${gradientId})`} dot={false} isAnimationActive />
            <Line type="monotone" dataKey="prediction" stroke="#7C3AED" strokeWidth={2.5} dot={false} strokeDasharray="8 6" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
