import { useMemo, useState } from 'react';

const columns = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'quantity', label: 'Shares' },
  { key: 'buyPrice', label: 'Avg Buy Price' },
  { key: 'currentPrice', label: 'Current Price' },
  { key: 'currentValue', label: 'Value' },
  { key: 'profitLoss', label: 'P&L' },
  { key: 'profitLossPercent', label: 'P&L%' }
];

/**
 * Displays a sortable holdings table with totals and row actions.
 * @param {{rows?: Array, onDelete?: (row: any) => void}} props
 */
export default function PortfolioTable({ rows = [], onDelete }) {
  const [sortKey, setSortKey] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const leftValue = typeof left === 'string' ? left.toLowerCase() : Number(left || 0);
      const rightValue = typeof right === 'string' ? right.toLowerCase() : Number(right || 0);
      if (leftValue < rightValue) return sortDirection === 'asc' ? -1 : 1;
      if (leftValue > rightValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDirection]);

  const totals = useMemo(() => {
    return sortedRows.reduce(
      (accumulator, row) => {
        accumulator.invested += Number(row.buyPrice || 0) * Number(row.quantity || 0);
        accumulator.value += Number(row.currentValue || 0);
        accumulator.pnl += Number(row.profitLoss || 0);
        return accumulator;
      },
      { invested: 0, value: 0, pnl: 0 }
    );
  }, [sortedRows]);

  /**
   * Toggles table sorting.
   * @param {string} key
   */
  function handleSort(key) {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  }

  const skeletonRows = Array.from({ length: 3 });

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0F1629] backdrop-blur">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-slate-200">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="cursor-pointer px-4 py-3 font-medium" onClick={() => handleSort(column.key)}>
                  {column.label} {sortKey === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={columns.length + 1}>No holdings yet. Add your first stock!</td>
              </tr>
            ) : sortedRows.length === 0 ? (
              skeletonRows.map((_, index) => (
                <tr key={index} className="border-t border-white/5">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3"><div className="h-4 w-full rounded-full bg-white/10 animate-pulse" /></td>
                  ))}
                  <td className="px-4 py-3"><div className="h-8 w-16 rounded-full bg-white/10 animate-pulse" /></td>
                </tr>
              ))
            ) : (
              sortedRows.map((row) => {
                const pnlPositive = Number(row.profitLoss || 0) >= 0;
                return (
                  <tr key={row._id || row.symbol} className="cursor-pointer border-t border-white/5 transition hover:bg-white/5" onClick={() => window.location.assign(`/stock/${row.symbol}`)}>
                    <td className="px-4 py-3 font-semibold text-white">{row.symbol}</td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    <td className="px-4 py-3">${Number(row.buyPrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">${Number(row.currentPrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">${Number(row.currentValue || 0).toFixed(2)}</td>
                    <td className={`px-4 py-3 font-medium ${pnlPositive ? 'text-emerald-300' : 'text-rose-300'}`}>${Number(row.profitLoss || 0).toFixed(2)}</td>
                    <td className={`px-4 py-3 font-medium ${pnlPositive ? 'text-emerald-300' : 'text-rose-300'}`}>{Number(row.profitLossPercent || 0).toFixed(2)}%</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDelete?.(row)}
                        className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-400/20"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 border-t border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200 md:grid-cols-3">
        <div>Total Invested: ${totals.invested.toFixed(2)}</div>
        <div>Total Value: ${totals.value.toFixed(2)}</div>
        <div className={totals.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}>Total P&amp;L: ${totals.pnl.toFixed(2)}</div>
      </div>
    </div>
  );
}
