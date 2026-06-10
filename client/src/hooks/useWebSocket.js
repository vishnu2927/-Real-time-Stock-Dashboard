import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Subscribes to live price updates for the provided symbols.
 * @param {string[]} symbols
 * @returns {{prices: Record<string, {price: number, change: number, changePercent: number, timestamp?: string}>, isConnected: boolean}}
 */
export function useWebSocket(symbols = []) {
  const socketRef = useRef(null);
  const [prices, setPrices] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const stableSymbols = useMemo(() => [...new Set(symbols.filter(Boolean).map((symbol) => String(symbol).toUpperCase()))], [symbols.join('|')]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      setIsConnected(true);
      if (stableSymbols.length > 0) {
        socket.emit('subscribe', { symbols: stableSymbols });
      }
    });

    socket.on('disconnect', () => setIsConnected(false));
    socket.on('price_update', (payload) => {
      setPrices((current) => ({ ...current, [payload.symbol]: payload }));
    });

    socketRef.current = socket;

    return () => {
      if (stableSymbols.length > 0) {
        socket.emit('unsubscribe', { symbols: stableSymbols });
      }
      socket.off('connect');
      socket.off('disconnect');
      socket.off('price_update');
      socket.disconnect();
    };
  }, [stableSymbols.join('|')]);

  return { prices, isConnected };
}
