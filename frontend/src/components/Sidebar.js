import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLanguage, FaBell, FaChartLine } from 'react-icons/fa'; // Import icons

const Sidebar = ({ modules, onSelectModule, onLanguageChange, onNotificationClick }) => {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen((prev) => !prev);
  };

  const handleLanguageChange = (language) => {
    onLanguageChange(language); // Trigger language change
    setIsLanguageMenuOpen(false); // Close submenu after selection
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="sidebar"
      style={{ overflowY: 'auto', maxHeight: '100vh' }} // Enable scrolling
    >
      <h2>Modules</h2>
      <nav>
        {modules.map((module) => (
          <div
            key={module.id}
            className="sidebar-item"
            onClick={() => onSelectModule(module)}
          >
            <module.icon className="sidebar-icon" />
            {module.title}
          </div>
        ))}
        {/* Market Watchdog Link */}
        <div
          className="sidebar-item"
          onClick={() => (window.location.href = '/market-watchdog')}
        >
          <FaChartLine className="sidebar-icon" /> Market Watchdog
        </div>
      </nav>

      {/* Language Menu
      <div className="sidebar-section">
        <div className="sidebar-item" onClick={toggleLanguageMenu}>
          <FaLanguage className="sidebar-icon-black" /> Language
        </div>
        {isLanguageMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="submenu"
          >
            <div className="submenu-item" onClick={() => handleLanguageChange('English')}>
              English
            </div>
            <div className="submenu-item" onClick={() => handleLanguageChange('Vietnamese')}>
              Vietnamese
            </div>
            <div className="submenu-item" onClick={() => handleLanguageChange('Russian')}>
              Russian
            </div>
            <div className="submenu-item" onClick={() => handleLanguageChange('Spanish')}>
              Spanish
            </div>
            <div className="submenu-item" onClick={() => handleLanguageChange('Chinese')}>
              Chinese
            </div>
          </motion.div>
        )}
      </div> */}

      {/* Notifications Option */}
      <div className="sidebar-item" onClick={onNotificationClick}>
        <FaBell className="sidebar-icon-black" /> Notifications
      </div>
    </motion.div>
  );
};

export default Sidebar;
