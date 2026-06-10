const Watchlist = require('../models/Watchlist');
const { getQuote } = require('../services/marketDataService');

async function getWatchlist(req, res, next) {
  try {
    const watchlist = await Watchlist.findOne({ userId: req.user.id });
    const symbols = watchlist?.symbols || [];
    const stocks = await Promise.all(
      symbols.map(async (symbol) => {
        const quote = await getQuote(symbol);
        return { symbol, price: quote.price, change: quote.change, changePercent: quote.changePercent };
      })
    );
    return res.status(200).json({ success: true, watchlist: { symbols, stocks } });
  } catch (error) { next(error); }
}

async function addToWatchlist(req, res, next) {
  try {
    const symbol = String(req.body.symbol || '').trim().toUpperCase();
    if (!symbol) return res.status(400).json({ success: false, message: 'symbol is required' });
    const watchlist = await Watchlist.findOneAndUpdate(
      { userId: req.user.id },
      { $addToSet: { symbols: symbol }, $setOnInsert: { userId: req.user.id } },
      { upsert: true, new: true }
    );
    return res.status(201).json({ success: true, watchlist });
  } catch (error) { next(error); }
}

async function removeFromWatchlist(req, res, next) {
  try {
    const symbol = String(req.params.symbol).trim().toUpperCase();
    const watchlist = await Watchlist.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { symbols: symbol } },
      { new: true }
    );
    return res.status(200).json({ success: true, watchlist });
  } catch (error) { next(error); }
}

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };