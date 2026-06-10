import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { WS_URL } from '../services/api';

/**
 * Subscribes to live price updates for the provided symbols.
 * @param {string[]} symbols
 * @returns {{prices: Record<string, {price: number, change: number, changePercent: number, timestamp?: string}>, isConnected: boolean}}
 */
export function useWebSocket(symbols = []) {
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const [prices, setPrices] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const stableSymbols = useMemo(() => [...new Set(symbols.filter(Boolean).map((symbol) => String(symbol).toUpperCase()))], [symbols.join('|')]);

  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 3000
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setIsReconnecting(false);
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (stableSymbols.length > 0) {
        socket.emit('subscribe', { symbols: stableSymbols });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsReconnecting(true);
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      reconnectTimerRef.current = setTimeout(() => {
        socket.connect();
      }, 3000);
    });
    socket.on('price_update', (payload) => {
      setPrices((current) => ({ ...current, [payload.symbol]: payload }));
    });

    socketRef.current = socket;

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (stableSymbols.length > 0) {
        socket.emit('unsubscribe', { symbols: stableSymbols });
      }
      socket.off('connect');
      socket.off('disconnect');
      socket.off('price_update');
      socket.disconnect();
    };
  }, [stableSymbols.join('|')]);

  return { prices, isConnected, isReconnecting };
}
