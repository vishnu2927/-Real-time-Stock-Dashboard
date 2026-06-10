import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { StockProvider } from './context/StockContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StockProvider>
          <App />
        </StockProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
