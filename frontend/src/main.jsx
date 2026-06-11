// =====================================================
// MAIN.JSX — React Application Entry Point
// =====================================================
// This is the FIRST file that runs — it mounts our App component
// into the HTML page at the element with id="root"
//
// StrictMode: Helps catch bugs during development by running
// components twice to detect side effects
// =====================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
