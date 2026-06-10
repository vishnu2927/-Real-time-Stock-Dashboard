const { fetchLiveQuote } = require('../services/marketDataService');

/**
 * Registers live stock updates for all connected sockets.
 * @param {import('socket.io').Server} io
 */
function registerStockSocket(io) {
  const subscribedSymbols = new Map();

  async function emitPrices() {
    const symbols = [...subscribedSymbols.keys()];
    if (symbols.length === 0) return;

    const updates = await Promise.allSettled(symbols.map((symbol) => fetchLiveQuote(symbol)));
    updates.forEach((result, index) => {
      if (result.status !== 'fulfilled') return;
      const update = result.value;
      io.to(symbols[index]).emit('price_update', update);
    });
  }

  io.on('connection', (socket) => {
    socket.emit('market_status', { isOpen: true, message: 'Market stream connected' });

    socket.on('subscribe', ({ symbols = [] }) => {
      symbols.map((symbol) => String(symbol).toUpperCase()).forEach((symbol) => {
        socket.join(symbol);
        subscribedSymbols.set(symbol, (subscribedSymbols.get(symbol) || 0) + 1);
      });
    });

    socket.on('unsubscribe', ({ symbols = [] }) => {
      symbols.map((symbol) => String(symbol).toUpperCase()).forEach((symbol) => {
        socket.leave(symbol);
        const count = (subscribedSymbols.get(symbol) || 1) - 1;
        if (count <= 0) subscribedSymbols.delete(symbol);
        else subscribedSymbols.set(symbol, count);
      });
    });

    socket.on('disconnect', () => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          const count = (subscribedSymbols.get(room) || 1) - 1;
          if (count <= 0) subscribedSymbols.delete(room);
          else subscribedSymbols.set(room, count);
        }
      });
    });
  });

  setInterval(() => {
    emitPrices().catch((error) => {
      console.error('[socket] price broadcast failed:', error.message);
    });
  }, 3000);
}

module.exports = registerStockSocket;
