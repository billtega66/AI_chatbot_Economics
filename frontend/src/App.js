import React, { useState } from 'react';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EconomicToolkitDashboard from './components/EconomicToolkitDashboard';
import MarketWatchdog from './components/MarketWatchdog';
import NewsDigest from './components/NewsDigest';
import NewsDetail from './components/NewsDetail'; // Import the NewsDetail component

const App = () => {
  const [news, setNews] = useState([]); // Shared state for news data

  return (
    <Router>
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<EconomicToolkitDashboard />} />

        {/* Market Watchdog */}
        <Route path="/market-watchdog" element={<MarketWatchdog />} />

        {/* News Digest */}
        <Route
          path="/news_digest"
          element={<NewsDigest news={news} setNews={setNews} />}
        />

        {/* News Details */}
        <Route
          path="/news_digest/data_:id"
          element={<NewsDetail news={news} />}
        />

        {/* Fallback Route */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
