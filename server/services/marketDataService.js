const axios = require('axios');
const { get, set } = require('../config/redis');

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

/**
 * Returns a cache key for a market data request.
 * @param {string} prefix
 * @param {string} value
 * @returns {string}
 */
function cacheKey(prefix, value) {
  return `${prefix}:${String(value).toUpperCase()}`;
}

/**
 * Safely parses cached JSON.
 * @param {string|null} value
 * @returns {any}
 */
function parseCachedJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

/**
 * Builds a deterministic fallback search payload.
 * @param {string} query
 * @returns {object}
 */
function buildMockSearch(query) {
  return {
    count: 3,
    result: [
      { symbol: query.toUpperCase(), description: `${query.toUpperCase()} Corp`, type: 'Equity' },
      { symbol: `${query.toUpperCase()}X`, description: `${query.toUpperCase()} Holdings`, type: 'Equity' },
      { symbol: `${query.toUpperCase()}Q`, description: `${query.toUpperCase()} Growth`, type: 'Equity' }
    ]
  };
}

/**
 * Builds a deterministic fallback quote.
 * @param {string} symbol
 * @returns {object}
 */
function buildMockQuote(symbol) {
  const seed = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const price = 80 + (seed % 220) + symbol.length * 1.7;
  const previousClose = price - ((seed % 9) - 4);
  const change = price - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    symbol: symbol.toUpperCase(),
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    previousClose: Number(previousClose.toFixed(2)),
    open: Number((price - 1.5).toFixed(2)),
    high: Number((price + 2.2).toFixed(2)),
    low: Number((price - 2.4).toFixed(2)),
    timestamp: new Date().toISOString()
  };
}

/**
 * Builds fallback history candles.
 * @param {string} symbol
 * @param {string} range
 * @returns {object}
 */
function buildMockHistory(symbol, range) {
  const pointCount = range === '1Y' ? 252 : range === '1M' ? 31 : range === '1W' ? 7 : 24;
  const points = Array.from({ length: pointCount }, (_, index) => {
    const quote = buildMockQuote(symbol);
    const base = quote.price + index * 0.6;
    return {
      time: new Date(Date.now() - (pointCount - index) * 86_400_000).toISOString().slice(0, 10),
      open: Number((base - 1.2).toFixed(2)),
      high: Number((base + 1.8).toFixed(2)),
      low: Number((base - 2.1).toFixed(2)),
      close: Number(base.toFixed(2)),
      volume: 1000000 + index * 35000
    };
  });

  return { symbol: symbol.toUpperCase(), range, points };
}

/**
 * Builds fallback news articles.
 * @param {string} symbol
 * @returns {object}
 */
function buildMockNews(symbol) {
  return {
    symbol: symbol.toUpperCase(),
    articles: [
      {
        headline: `${symbol.toUpperCase()} extends its momentum`,
        summary: `${symbol.toUpperCase()} is trending higher in this offline fallback dataset.`,
        url: 'https://example.com',
        source: 'MockWire',
        datetime: Date.now() / 1000,
        sentiment: 'positive'
      },
      {
        headline: `${symbol.toUpperCase()} analysts remain neutral`,
        summary: 'This placeholder article is used only when no live news key is configured.',
        url: 'https://example.com',
        source: 'MockWire',
        datetime: Date.now() / 1000,
        sentiment: 'neutral'
      }
    ]
  };
}

/**
 * Fetches Finnhub search results.
 * @param {string} query
 * @returns {Promise<object>}
 */
async function searchStocks(query) {
  const cacheKeyName = cacheKey('search', query);
  const cached = parseCachedJson(await get(cacheKeyName));
  if (cached) return cached;

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    const fallback = buildMockSearch(query);
    await set(cacheKeyName, fallback, 3600);
    return fallback;
  }

  const { data } = await axios.get(`${FINNHUB_BASE}/search`, {
    params: { q: query, token: apiKey },
    timeout: 10000
  });

  await set(cacheKeyName, data, 3600);
  return data;
}

/**
 * Fetches Finnhub quote data.
 * @param {string} symbol
 * @returns {Promise<object>}
 */
async function getQuote(symbol) {
  const cacheKeyName = cacheKey('quote', symbol);
  const cached = parseCachedJson(await get(cacheKeyName));
  if (cached) return cached;

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    const fallback = buildMockQuote(symbol);
    await set(cacheKeyName, fallback, 15);
    return fallback;
  }

  const { data } = await axios.get(`${FINNHUB_BASE}/quote`, {
    params: { symbol, token: apiKey },
    timeout: 10000
  });

  const normalized = {
    symbol: symbol.toUpperCase(),
    price: Number(data.c || 0),
    change: Number((data.c || 0) - (data.pc || 0)),
    changePercent: Number(data.dp || 0),
    previousClose: Number(data.pc || 0),
    open: Number(data.o || 0),
    high: Number(data.h || 0),
    low: Number(data.l || 0),
    timestamp: new Date().toISOString()
  };

  await set(cacheKeyName, normalized, 15);
  return normalized;
}

/**
 * Converts Alpha Vantage data to a simple history series.
 * @param {string} symbol
 * @param {string} range
 * @returns {Promise<object>}
 */
async function getHistory(symbol, range) {
  const cacheKeyName = cacheKey(`history:${range}`, symbol);
  const cached = parseCachedJson(await get(cacheKeyName));
  if (cached) return cached;

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    const fallback = buildMockHistory(symbol, range);
    await set(cacheKeyName, fallback, 300);
    return fallback;
  }

  const isIntraday = range === '1D';
  const params = isIntraday
    ? { function: 'TIME_SERIES_INTRADAY', symbol, interval: '5min', outputsize: 'compact', apikey: apiKey }
    : { function: 'TIME_SERIES_DAILY_ADJUSTED', symbol, outputsize: 'compact', apikey: apiKey };

  const { data } = await axios.get(ALPHA_VANTAGE_BASE, { params, timeout: 10000 });
  const seriesKey = isIntraday ? 'Time Series (5min)' : 'Time Series (Daily)';
  const rawSeries = data[seriesKey] || {};
  const points = Object.entries(rawSeries)
    .slice(0, range === '1Y' ? 252 : range === '1M' ? 31 : range === '1W' ? 7 : 78)
    .reverse()
    .map(([time, values]) => ({
      time,
      open: Number(values['1. open']),
      high: Number(values['2. high']),
      low: Number(values['3. low']),
      close: Number(values['4. close']),
      volume: Number(values['5. volume'])
    }));

  const normalized = { symbol: symbol.toUpperCase(), range, points };
  await set(cacheKeyName, normalized, 300);
  return normalized;
}

/**
 * Fetches Finnhub company news for the last 7 days.
 * @param {string} symbol
 * @returns {Promise<object>}
 */
async function getNews(symbol) {
  const cacheKeyName = cacheKey('news', symbol);
  const cached = parseCachedJson(await get(cacheKeyName));
  if (cached) return cached;

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    const fallback = buildMockNews(symbol);
    await set(cacheKeyName, fallback, 1800);
    return fallback;
  }

  const today = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { data } = await axios.get(`${FINNHUB_BASE}/company-news`, {
    params: {
      symbol,
      from: sevenDaysAgo.toISOString().slice(0, 10),
      to: today.toISOString().slice(0, 10),
      token: apiKey
    },
    timeout: 10000
  });

  const normalized = {
    symbol: symbol.toUpperCase(),
    articles: (data || []).slice(0, 20).map((article) => ({
      headline: article.headline,
      summary: article.summary,
      url: article.url,
      source: article.source,
      datetime: article.datetime,
      sentiment: 'neutral'
    }))
  };

  await set(cacheKeyName, normalized, 1800);
  return normalized;
}

/**
 * Fetches a quote without cache usage for sockets and jobs.
 * @param {string} symbol
 * @returns {Promise<object>}
 */
async function fetchLiveQuote(symbol) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return buildMockQuote(symbol);
  }

  const { data } = await axios.get(`${FINNHUB_BASE}/quote`, {
    params: { symbol, token: apiKey },
    timeout: 10000
  });

  return {
    symbol: symbol.toUpperCase(),
    price: Number(data.c || 0),
    change: Number((data.c || 0) - (data.pc || 0)),
    changePercent: Number(data.dp || 0),
    timestamp: new Date().toISOString()
  };
}

module.exports = { searchStocks, getQuote, getHistory, getNews, fetchLiveQuote };