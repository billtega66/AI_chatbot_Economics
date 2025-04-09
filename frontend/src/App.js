import React, { useState } from 'react';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EconomicToolkitDashboard from './components/EconomicToolkitDashboard';
import MarketWatchdog from './components/MarketWatchdog';
import NewsDigest from './components/NewsDigest';
import NewsDetail from './components/NewsDetail'; // Import the NewsDetail component
// Import Retirement Planner components
import RetirementPlanner from './components/RetirementPlanner';
import RetirementDashboard from './components/RetirementDashboard';
import RetirementPlans from './components/RetirementPlans';
import RetirementResources from './components/RetirementResources';

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

        {/* Retirement Planner Routes */}
        <Route path="/retirement" element={<RetirementPlanner />} />
        <Route path="/retirement/dashboard" element={<RetirementDashboard />} />
        <Route path="/retirement/plans" element={<RetirementPlans />} />
        <Route path="/retirement/resources" element={<RetirementResources />} />

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
