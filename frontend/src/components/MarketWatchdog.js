import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import {useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FaHome, FaArrowLeft, FaBars, FaBell, FaMoon } from 'react-icons/fa';
import {
  FaChartLine,
  FaNewspaper,
  FaCalculator,
  FaChartPie,
  FaClipboardList,
  FaBook,
  FaMoneyBillWave,
  
} from 'react-icons/fa';
import marketData from '../../../data/market_data.json';
import Darkmode from 'darkmode-js';



// const initialStocks = [
//   {
//     id: 1,
//     name: 'AAPL',
//     performance: 5.2,
//     up: true,
//     overview:
//       'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
//     data: generateRandomData('year'),
//   },
//   {
//     id: 2,
//     name: 'GOOGL',
//     performance: -3.4,
//     up: false,
//     overview:
//       'Alphabet Inc. provides online advertising services globally.',
//     data: generateRandomData('year'),
//   },
// ];

const MarketWatchdog = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStockName, setNewStockName] = useState('');
  const [newStockPerformance, setNewStockPerformance] = useState('');
  const [newStockOverview, setNewStockOverview] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initialize Navigate
const navigate = useNavigate();

useEffect(() => {
  // Load market data from imported JSON
  setStocks(marketData); // Directly set the state with the imported data

  // Initialize darkmode-js with a single instance
  if (!window.darkmodeInitialized) {
    const darkmode = new Darkmode({
      bottom: '32px',
      right: '32px',
      left: 'unset',
      time: '0.5s',
      label: '🌓',
      autoMatchOsTheme: true,
    });
    darkmode.showWidget();
    window.darkmodeInitialized = true;
  }
}, []);

   // Add these handler functions for the Sidebar

  const handleModuleSelect = (module) => {
    // Handle module selection
    console.log('Selected module:', module);
  };

  const handleLanguageChange = (language) => {
    // Handle language change
    console.log('Language changed to:', language);
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };
  const handleAddStock = (e) => {
    e.preventDefault();
    if (!newStockName || !newStockPerformance) return;
  
    const newStock = {
      id: stocks.length + 1,
      name: newStockName.toUpperCase(),
      performance: parseFloat(newStockPerformance),
      up: parseFloat(newStockPerformance) >= 0,
      overview: newStockOverview || 'No overview available.',
      data: generateRandomData('year'),
    };
  
    const updatedStocks = [...stocks, newStock];
    setStocks(updatedStocks);
    saveMarketData(updatedStocks); // Save updated stocks to backend
    setShowAddForm(false);
    setNewStockName('');
    setNewStockPerformance('');
    setNewStockOverview('');
  };
  

  const fetchMarketData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/getMarketData');
      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };
  
  const saveMarketData = async (updatedStocks) => {
    try {
      await fetch('http://localhost:5000/api/saveMarketData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStocks),
      });
    } catch (error) {
      console.error('Error saving market data:', error);
    }
  };
  

  const generateRandomData = (timeFrame) => {
    const dataLength = {
      day: 24,
      week: 7,
      month: 30,
      year: 12,
    };
    return Array.from({ length: dataLength[timeFrame] }, (_, i) => ({
      date: timeFrame === 'day' ? `${i}:00` : `Day ${i + 1}`,
      value: parseFloat((Math.random() * 100).toFixed(2)),
    }));
  };
  // Close sidebar when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('backdrop')) {
      setIsMenuOpen(false);
    }
  };
  return (
    <div className="market-watchdog">
      {/* Backdrop and Sidebar */}
      {isMenuOpen && (
        <div 
          className="backdrop"
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        >
          <Sidebar
            modules={[
              { id: 'market-watchdog', 
                title: 'Market Watchdog', 
                icon: FaChartLine,
                route: '/market-watchdog',
              },{
                id: 'news-digest',
                title: 'News Digest',
                icon: FaNewspaper,
                route: 'news-digest',
              },
              {
                id: 'retirement-planner',
                title: 'Retirement Planner',
                icon: FaCalculator,
                // route: 'retirement-planner',
              },
              {
                id: 'scenario-simulator',
                title: 'Scenario Simulator',
                icon: FaChartPie,
                // route: 'scenario-simulator',
              },
              {
                id: 'budget-planner',
                title: 'Budget Planner',
                icon: FaClipboardList,
                // route: 'budget-planner',
              },
              {
                id: 'glossary-explainer',
                title: 'Glossary Explainer',
                icon: FaBook,
                // route: 'glossary-explainer',
              },
              {
                id: 'investment-assistant',
                title: 'Investment Assistant',
                icon: FaMoneyBillWave,
                // route: 'investment-assistance',
              },
              // Add more modules as needed
            ]}
            onSelectModule={handleModuleSelect}
            onLanguageChange={handleLanguageChange}
            onNotificationClick={handleNotificationClick}
          />
        </div>
      )}

      {/* Sidebar Buttons */}
      <div className="side-buttons">
        <button className="side-button" onClick={() => navigate('/')}>
          <FaHome />
        </button>
        <button
          className="side-button"
          onClick={() => navigate(-1)} // Go back to the previous page
        >
          <FaArrowLeft />
        </button>
        <button className="side-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FaBars />
        </button>
        <button className="side-button" onClick={() => navigate('/notifications')}>
          <FaBell />
        </button>
        <button className="side-button" id="darkmode-toggle">
          <FaMoon />
        </button>
      </div>

      {/* Header */}
      <header className="header">
        <h1>Economic Market Watchdog</h1>
        <button
          className="add-stock-button"
          onClick={() => setShowAddForm(true)}
        >
          + Add Stock
        </button>
      </header>

      {/* Stock List */}
      <div className="stocks-grid">
        {stocks.map((stock) => (
          <div
            key={stock.id}
            className="stock-card"
            onClick={() => setSelectedStock(stock)} // Show overview only on click
          >
            <div className="stock-info">
              <h2>{stock.name}</h2>
              <span className={`performance ${stock.up ? 'positive' : 'negative'}`}>
                {stock.up ? '▲' : '▼'} {stock.performance}%
              </span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={stock.data}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={stock.up ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Add Stock Modal */}
      {showAddForm && (
        <div className="add-stock-modal">
          <form onSubmit={handleAddStock}>
            <h2>Add New Stock</h2>
            <input
              type="text"
              placeholder="Stock Name (e.g., MSFT)"
              value={newStockName}
              onChange={(e) => setNewStockName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Performance (e.g., 2.5)"
              value={newStockPerformance}
              onChange={(e) => setNewStockPerformance(e.target.value)}
              required
            />
            <textarea
              placeholder="Overview"
              value={newStockOverview}
              onChange={(e) => setNewStockOverview(e.target.value)}
            ></textarea>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button type="submit">Add Stock</button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Details */}
      {selectedStock && (
        <div className="stock-details">
          <h2>{selectedStock.name} Overview</h2>
          <p>{selectedStock.overview}</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={selectedStock.data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => `$${value}`}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
          <button onClick={() => setSelectedStock(null)}>Back</button>
        </div>
      )}
    </div>
  );
};
  
export default MarketWatchdog;
