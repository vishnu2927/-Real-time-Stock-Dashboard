# Real-Time Stock Dashboard

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Full-stack real-time stock market dashboard with secure authentication, live market data, portfolio analytics, AI prediction, and deployment-ready infrastructure.

## Features

- Real-time stock quotes and WebSocket price updates
- JWT-based authentication with refresh tokens
- Watchlist and portfolio management
- Candlestick, line, and allocation charts
- AI price prediction via FastAPI + LSTM
- Dark-only polished UI with glassmorphism cards
- Redis caching and scheduled data prefetching
- Docker Compose and GitHub Actions workflow

## Architecture

```text
Client (React + Vite + Tailwind)
	-> /api/*
Server (Node + Express + Socket.io)
	-> MongoDB Atlas
	-> Redis cache
	-> ML service proxy
ML Service (FastAPI + LSTM)
	-> yfinance training data
```

## Local Setup

1. Copy `.env.example` to `.env` and fill in your API keys and connection strings.
2. Install Node dependencies:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

3. Install Python dependencies:

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

4. Start the services:

```bash
npm run dev --prefix server
npm run dev --prefix client
uvicorn main:app --reload --port 8000 --app-dir ml-service
```

5. Or run the full stack with Docker:

```bash
docker compose up --build
```

## Environment Variables

| Key | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `REDIS_URL` | Upstash Redis connection string |
| `FINNHUB_API_KEY` | Finnhub live market and news API key |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage historical data API key |
| `ML_SERVICE_URL` | Python prediction service URL |
| `CLIENT_URL` | Frontend URL for CORS |
| `PORT` | Backend port |

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/login` | Login user |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/stocks/search?q=AAPL` | Search symbols |
| `GET` | `/api/stocks/:symbol/quote` | Live quote |
| `GET` | `/api/stocks/:symbol/history?range=1W` | Historical prices |
| `GET` | `/api/stocks/:symbol/news` | Company news |
| `GET` | `/api/portfolio` | Current holdings |
| `POST` | `/api/portfolio/add` | Add holding |
| `DELETE` | `/api/portfolio/:id` | Remove holding |
| `GET` | `/api/portfolio/summary` | Portfolio summary |
| `GET` | `/api/watchlist` | Current watchlist |
| `POST` | `/api/watchlist/add` | Add symbol |
| `DELETE` | `/api/watchlist/:symbol` | Remove symbol |
| `GET` | `/api/ml/:symbol/predict?days=7` | AI prediction |

## Screenshots

Add a project banner GIF or screenshots here once the UI is deployed.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Keep changes focused and tested.
4. Open a pull request with a clear summary.

## License

MIT
