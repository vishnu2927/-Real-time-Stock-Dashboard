const { validationResult } = require('express-validator');
const { searchStocks: searchStocksService, getQuote: getQuoteService, getHistory: getHistoryService, getNews: getNewsService } = require('../services/marketDataService');

async function searchStocks(req, res, next) {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) return res.status(200).json({ success: true, results: [] });
    const data = await searchStocksService(query);
    return res.status(200).json({ success: true, results: data.result || [] });
  } catch (error) {
    next(error);
  }
}

async function getQuote(req, res, next) {
  try {
    const quote = await getQuoteService(req.params.symbol);
    return res.status(200).json({ success: true, quote });
  } catch (error) {
    next(error);
  }
}

async function getHistory(req, res, next) {
  try {
    const range = req.query.range || '1W';
    const history = await getHistoryService(req.params.symbol, range);
    return res.status(200).json({ success: true, history });
  } catch (error) {
    next(error);
  }
}

async function getNews(req, res, next) {
  try {
    const news = await getNewsService(req.params.symbol);
    return res.status(200).json({ success: true, news });
  } catch (error) {
    next(error);
  }
}

async function getMarketStatus(_req, res) {
  const now = new Date();
  const newYorkTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = newYorkTime.getDay();
  const hours = newYorkTime.getHours();
  const minutes = newYorkTime.getMinutes();
  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && (hours > 9 || (hours === 9 && minutes >= 30)) && hours < 16;
  return res.status(200).json({ success: true, isOpen, message: isOpen ? 'Market is open' : 'Market is closed' });
}

module.exports = { searchStocks, getQuote, getHistory, getNews, getMarketStatus };