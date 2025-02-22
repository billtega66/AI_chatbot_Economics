import React from 'react';
import { FaHome, FaArrowLeft, FaSearch, FaBell, FaBars } from 'react-icons/fa';

const Header = ({
  onHomeClick,
  onBackClick,
  onSearchClick,
  onNotificationsClick,
  onMenuToggle,
  unreadNotifications,
  title,
  showBackButton,
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <button onClick={onHomeClick}>
          <FaHome />
        </button>
        {showBackButton && (
          <button onClick={onBackClick} disabled={!onBackClick}>
            <FaArrowLeft />
          </button>
        )}
      </div>
      <h1 className="header-title">{title}</h1>
      <div className="header-right">
        <button onClick={onSearchClick}>
          <FaSearch />
        </button>
        <button onClick={onNotificationsClick} className="notification-button">
          <FaBell />
          {unreadNotifications && <span className="notification-dot"></span>}
        </button>
        <button onClick={onMenuToggle}>
          <FaBars />
        </button>
      </div>
    </header>
  );
};

export default Header;

