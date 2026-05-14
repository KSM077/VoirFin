import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { BankProvider } from './context/BankContext'
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BankProvider>
        <App />
      </BankProvider>
    </BrowserRouter>
  </React.StrictMode>
);