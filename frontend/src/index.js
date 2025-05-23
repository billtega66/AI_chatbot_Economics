import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found. Make sure you have a div with id "root" in your HTML file.');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);