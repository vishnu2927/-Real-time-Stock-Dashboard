import { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const ranges = ['1D', '1W', '1M', '1Y'];

/**
 * Displays OHLC and volume series using TradingView lightweight charts.
 * @param {{symbol: string, history?: {points?: Array}, range?: string, onRangeChange?: (range: string) => void}} props
 */
export default function CandlestickChart({ symbol, history, range = '1W', onRangeChange }) {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [selectedRange, setSelectedRange] = useState(range);

  const chartData = useMemo(() => {
    const points = history?.points || [];
    return points.map((point) => ({
      time: point.time,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      value: point.close,
      volume: point.volume
    }));
  }, [history]);

  const isLoading = !history;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || chartData.length === 0) {
      return undefined;
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: '#0F1629' },
        textColor: '#E2E8F0'
      },
      grid: {
        vertLines: { color: 'rgba(148,163,184,0.08)' },
        horzLines: { color: 'rgba(148,163,184,0.08)' }
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.06)' },
      watermark: { visible: true, text: symbol, color: 'rgba(255,255,255,0.04)' }
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00D4AA',
      downColor: '#FF4757',
      borderVisible: false,
      wickUpColor: '#00D4AA',
      wickDownColor: '#FF4757'
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#475569',
      priceFormat: { type: 'volume' },
      priceScaleId: ''
    });

    candleSeries.setData(chartData);
    volumeSeries.setData(chartData.map((point) => ({ time: point.time, value: point.volume, color: point.close >= point.open ? 'rgba(0,212,170,0.35)' : 'rgba(255,71,87,0.35)' })));
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
    });
    resizeObserver.observe(container);

    chart.subscribeCrosshairMove((param) => {
      const tooltip = tooltipRef.current;
      if (!tooltip || !param.point || !param.time) {
        if (tooltip) tooltip.style.opacity = '0';
        return;
      }

      const candle = param.seriesData.get(candleSeries);
      const volume = param.seriesData.get(volumeSeries);
      if (!candle) return;

      tooltip.style.opacity = '1';
      tooltip.innerHTML = `
        <div class="space-y-1 text-xs text-slate-200">
          <div class="font-semibold text-white">${symbol}</div>
          <div>O: ${Number(candle.open).toFixed(2)} H: ${Number(candle.high).toFixed(2)} L: ${Number(candle.low).toFixed(2)} C: ${Number(candle.close).toFixed(2)}</div>
          <div>Vol: ${Number(volume?.value || 0).toLocaleString()}</div>
        </div>
      `;
      tooltip.style.left = `${Math.min(param.point.x + 16, container.clientWidth - 220)}px`;
      tooltip.style.top = `${Math.max(16, param.point.y - 70)}px`;
    });

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [chartData, symbol]);

  /**
   * Updates the selected range.
   * @param {string} nextRange
   */
  function handleRangeChange(nextRange) {
    setSelectedRange(nextRange);
    onRangeChange?.(nextRange);
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F1629] p-4 backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Chart</p>
          <h3 className="text-xl font-semibold text-white">{symbol} Candlestick</h3>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {ranges.map((item) => (
            <button
              key={item}
              onClick={() => handleRangeChange(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${selectedRange === item ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-white/10'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="relative min-h-[420px] w-full">
        <div ref={tooltipRef} className="pointer-events-none absolute z-10 rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-white opacity-0 shadow-2xl shadow-black/30 backdrop-blur" />

        {isLoading ? (
          <div className="absolute inset-0 grid grid-cols-8 items-end gap-3 p-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="w-full rounded-2xl bg-white/10 animate-pulse" style={{ height: `${120 + index * 14}px` }} />
                <div className="h-2 w-10 rounded-full bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-dashed border-white/10 text-sm text-slate-500">
            No chart data available
          </div>
        ) : null}
      </div>
    </section>
  );
}
