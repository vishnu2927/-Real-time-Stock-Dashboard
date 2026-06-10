const cron = require('node-cron');
const { set } = require('../config/redis');
const { fetchLiveQuote } = require('../services/marketDataService');

const TOP_STOCKS = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'BRK.B', 'JPM', 'V', 'MA', 'CRM', 'PYPL', 'ORCL', 'ADBE', 'COST', 'PEP'];

/**
 * Checks whether the current time is within market hours in New York.
 * @returns {boolean}
 */
function isMarketHours() {
  const now = new Date();
  const newYorkTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = newYorkTime.getDay();
  const hours = newYorkTime.getHours();
  const minutes = newYorkTime.getMinutes();
  const afterOpen = hours > 9 || (hours === 9 && minutes >= 30);
  const beforeClose = hours < 16;
  return day >= 1 && day <= 5 && afterOpen && beforeClose;
}

/**
 * Fetches and caches prices for the most popular symbols.
 */
async function fetchStockJob() {
  if (!isMarketHours()) return;

  const quotes = await Promise.allSettled(TOP_STOCKS.map((symbol) => fetchLiveQuote(symbol)));
  await Promise.all(
    quotes.map(async (result, index) => {
      if (result.status !== 'fulfilled') return;
      await set(`prefetch:quote:${TOP_STOCKS[index]}`, result.value, 60);
    })
  );
}

/**
 * Starts the scheduled stock prefetch job.
 * @returns {import('node-cron').ScheduledTask}
 */
function startStockJob() {
  return cron.schedule('* * * * 1-5', () => {
    fetchStockJob().catch((error) => {
      console.error('[job] stock prefetch failed:', error.message);
    });
  }, { timezone: 'America/New_York' });
}

module.exports = { fetchStockJob, startStockJob };
