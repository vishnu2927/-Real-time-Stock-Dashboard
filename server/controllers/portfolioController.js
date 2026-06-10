const Portfolio = require('../models/Portfolio');
const { getQuote } = require('../services/marketDataService');

async function enrichHoldings(holdings) {
  return Promise.all(
    holdings.map(async (holding) => {
      const quote = await getQuote(holding.symbol);
      const currentValue = quote.price * holding.quantity;
      const investedValue = holding.buyPrice * holding.quantity;
      const profitLoss = currentValue - investedValue;
      const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;
      return {
        ...holding.toObject(),
        currentPrice: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        currentValue,
        profitLoss,
        profitLossPercent
      };
    })
  );
}

async function getPortfolio(req, res, next) {
  try {
    const holdings = await Portfolio.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const portfolio = await enrichHoldings(holdings);
    return res.status(200).json({ success: true, portfolio });
  } catch (error) { next(error); }
}

async function addStock(req, res, next) {
  try {
    const { symbol, companyName, buyPrice, quantity, buyDate } = req.body;
    const holding = await Portfolio.create({
      userId: req.user.id,
      symbol: String(symbol).toUpperCase(),
      companyName, buyPrice, quantity, buyDate
    });
    return res.status(201).json({ success: true, holding });
  } catch (error) { next(error); }
}

async function removeStock(req, res, next) {
  try {
    const holding = await Portfolio.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!holding) return res.status(404).json({ success: false, message: 'Holding not found' });
    return res.status(200).json({ success: true, message: 'Holding removed' });
  } catch (error) { next(error); }
}

async function getSummary(req, res, next) {
  try {
    const holdings = await Portfolio.find({ userId: req.user.id });
    const enriched = await enrichHoldings(holdings);
    const totalInvested = enriched.reduce((sum, item) => sum + item.buyPrice * item.quantity, 0);
    const totalValue = enriched.reduce((sum, item) => sum + item.currentValue, 0);
    const totalPnL = totalValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const bestPerformer = [...enriched].sort((a, b) => b.profitLossPercent - a.profitLossPercent)[0] || null;
    const pieData = enriched.map((item) => ({ name: item.symbol, value: item.currentValue }));
    return res.status(200).json({
      success: true,
      summary: { totalInvested, totalValue, totalPnL, totalPnLPercent, bestPerformer, pieData }
    });
  } catch (error) { next(error); }
}

module.exports = { getPortfolio, addStock, removeStock, getSummary };