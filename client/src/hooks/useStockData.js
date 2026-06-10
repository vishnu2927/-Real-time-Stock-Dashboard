import { useEffect, useState } from 'react';
import { stockAPI } from '../services/api';

/**
 * Loads quote, history, news, and prediction data for a symbol.
 * @param {string} symbol
 * @returns {{quote: object|null, history: object|null, news: object|null, prediction: object|null, isLoading: boolean, error: Error|null, setRange: (range: string) => void}}
 */
export function useStockData(symbol) {
  const [range, setRange] = useState('1W');
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState(null);
  const [news, setNews] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const [quoteResponse, historyResponse, newsResponse, predictionResponse] = await Promise.all([
          stockAPI.quote(symbol),
          stockAPI.history(symbol, range),
          stockAPI.news(symbol),
          stockAPI.predict(symbol, 7)
        ]);

        if (!active) return;
        setQuote(quoteResponse.data.quote);
        setHistory(historyResponse.data.history);
        setNews(newsResponse.data.news);
        setPrediction(predictionResponse.data.prediction);
      } catch (requestError) {
        if (active) {
          setError(requestError);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (symbol) {
      load();
    }

    return () => {
      active = false;
    };
  }, [symbol, range]);

  return { quote, history, news, prediction, isLoading, error, setRange };
}
