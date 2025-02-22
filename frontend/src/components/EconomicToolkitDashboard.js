import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ModuleCard from './ModuleCard';
import ModuleDetails from './ModuleDetails';
import Notifications from './Notifications';
import Darkmode from 'darkmode-js';
import { useNavigate } from 'react-router-dom';
import {
  FaChartLine,
  FaNewspaper,
  FaCalculator,
  FaChartPie,
  FaClipboardList,
  FaBook,
  FaMoneyBillWave,
} from 'react-icons/fa';


const EconomicToolkitDashboard = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);


  useEffect(() => {
    // Initialize darkmode-js with a single instance
    let darkmode;
    if (!window.darkmodeInitialized) {
      darkmode = new Darkmode({
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


  const modules = [
    {
      id: 'market-watchdog',
      title: 'Market Watchdog',
      description: 'Real-time stock market monitoring...',
      icon: FaChartLine,
      route: '/market-watchdog',
    },
    {
      id: 'news-digest',
      title: 'News Digest',
      description: 'Latest economic news updates.',
      icon: FaNewspaper,
      route: '/news_digest',
    },
    {
      id: 'retirement-planner',
      title: 'Retirement Planner',
      description: 'Plan your retirement effectively.',
      icon: FaCalculator,
      // route: '/retirement-planner',
    },
    {
      id: 'scenario-simulator',
      title: 'Scenario Simulator',
      description: 'Simulate economic scenarios.',
      icon: FaChartPie,
      // route: '/scenario-simulator',
    },
    {
      id: 'budget-planner',
      title: 'Budget Planner',
      description:'Track and optimize your expenses.',
      icon: FaClipboardList,
      // route: '/budget-planner',
    },
    {
      id: 'glossary-explainer',
      title: 'Glossary Explainer',
      description: 'Understand financial terms.',
      icon: FaBook,
      // route: '/glossary-explainer',
    },
    {
      id: 'investment-assistant',
      title: 'Investment Assistant',
      description: 'Get personalized investment advice.',
      icon: FaMoneyBillWave,
      // route: '/investment-assistant',
    },
  ];
  
  const navigate = useNavigate(); 

  const navigateToModule = (module) => {
    if (module.route) {
      navigate(module.route);
    } else {
      setSelectedModule(module);
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearchBar = () => {
    setIsSearchOpen(!isSearchOpen);
    setSearchQuery('');
  };

  const closeSearchBar = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const openNotifications = () => {
    setShowNotifications(true);
    setUnreadNotifications(false);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  const handleGoHome = () => {
    setSelectedModule(null);
  };

  const handleBack = () => {
    setSelectedModule(null);
  };

  const matchedModules = modules.filter((module) =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      <Header
        onHomeClick={handleGoHome}
        onBackClick={handleBack}
        onSearchClick={toggleSearchBar}
        onNotificationsClick={openNotifications}
        onMenuToggle={handleMenuToggle}
        unreadNotifications={unreadNotifications}
        title={'title'}
        showBackButton={!!selectedModule}
      />

      {isMenuOpen && (
        <>
          <div className="overlay" onClick={() => setIsMenuOpen(false)}></div>
          <Sidebar
            modules={modules}
            onSelectModule={(module) => {
              setSelectedModule(module);
              setIsMenuOpen(false);
            }}
            onNotificationClick={openNotifications}
          />
        </>
      )}

      {isSearchOpen && (
        <>
          <div className="overlay" onClick={closeSearchBar}></div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && matchedModules.length > 0 && (
              <div className="search-dropdown">
                {matchedModules.map((module) => (
                  <div
                    key={module.id}
                    className="search-dropdown-item"
                    onClick={() => {
                      setSelectedModule(module);
                      setIsSearchOpen(false);
                    }}
                  >
                    {module.title}
                  </div>
                ))}
              </div>
            )}
            {searchQuery && matchedModules.length === 0 && (
              <div className="search-dropdown-item">
                {'noResults'}
                </div>
            )}
          </div>
        </>
      )}

      {!showNotifications ? (
        <main className={`main-content ${isMenuOpen || isSearchOpen ? 'blur' : ''}`}>
          {!selectedModule ? (
            <div className="module-grid">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onClick={() => navigateToModule(module)}
                />
              ))}
            </div>
          ) : (
            <ModuleDetails module={selectedModule} />
          )}
        </main>
      ) : (
        <Notifications onClose={closeNotifications} />
      )}
    </div>
  );
};

export default EconomicToolkitDashboard;
