import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import {useNavigate } from "react-router-dom";
import { FaHome, FaArrowLeft, FaBars, FaBell, FaMoon, FaBookmark } from 'react-icons/fa';
import Darkmode from 'darkmode-js';

  
  const NewsDigest = () => {
    const [news, setNews] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
    const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
  
    useEffect(() => {
      // Initialize dark mode widget
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
      
      fetchNews();
    }, []);
    const handleNavigate = (id) => {
      navigate(`/news_digest/data_${id}`);
    };
    // Add these handler functions for the Sidebar
    const handleModuleSelect = (module) => {
      console.log('Selected module:', module);
    };
  
    const handleLanguageChange = (language) => {
      console.log('Language changed to:', language);
    };
  
    const handleNotificationClick = () => {
      navigate('/notifications');
    };
    
    const fetchNews = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5001/api/news-digest');
        if (!response.ok) throw new Error('Failed to fetch news data');
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const toggleBookmark = (id) => {
      setBookmarkedArticles((prev) =>
        prev.includes(id) ? prev.filter((articleId) => articleId !== id) : [...prev, id]
      );
  
      setNews((prevNews) =>
        prevNews.map((article) =>
          article.id === id ? { ...article, bookmarked: !article.bookmarked } : article
        )
      );
    };
  
    const toggleBookmarkedFilter = () => {
      setShowBookmarkedOnly(!showBookmarkedOnly);
      if (!showBookmarkedOnly) {
        setNews(news.filter((article) => bookmarkedArticles.includes(article.id)));
      } else {
        fetchNews();
      }
    };
  
  
  
    const handleBackdropClick = (e) => {
      if (e.target.classList.contains('backdrop')) {
        setIsMenuOpen(false);
      }
    };
  
    return (
      <div className="news-digest">
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
        <h1 className="header-title">Economic News Digest</h1>
        <button
          className={`bookmark-filter-button ${showBookmarkedOnly ? 'active' : ''}`}
          onClick={toggleBookmarkedFilter}
        >
          {showBookmarkedOnly ? 'Show All News' : `Bookmarks (${bookmarkedArticles.length})`}
        </button>
      </header>
      
      {/* News List */}
      {/* <div className="news-grid">
        {isLoading ? (
          <p>Loading news...</p>
        ) : (
          news.map((article) => (
            <div
              key={article.id}
              className="news-card"
              onClick={() => handleNavigate(article)}
            >
              <h2 className="news-title">{article.title}</h2>
              <p className="news-summary">{article.originalSummary}</p>
              <p className="news-ai-summary">
                {article.aiSummary ? article.aiSummary : 'Generating summary...'}
              </p>
              <button
                className={`bookmark-button ${
                  bookmarkedArticles.includes(article.id) ? 'bookmarked' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(article.id);
                }}
              >
                <FaBookmark />
              </button>
            </div>
          ))
        )}
      </div> */}

      {/* Article Details */}
      {/* {selectedArticle && (
        <div className="article-details-container">
          <div className="article-details">
            <h2 className="article-title">{selectedArticle.title}</h2>
            <p className="article-summary">{selectedArticle.originalSummary}</p>
            <p>
              <strong>Category:</strong> {selectedArticle.category}
            </p>
            <p>
              <strong>Source:</strong> {selectedArticle.source}
            </p>
            <p>
              <strong>AI Summary:</strong> {selectedArticle.aiSummary}
            </p>
            <button className="close-button" onClick={() => setSelectedArticle(null)}>
              Close
            </button>
          </div> */}
      {/* News Grid */}
      <div className="news-grid">
        {isLoading ? (
          <p>Loading news...</p>
        ) : (
          news.map((article) => (
            <div
              key={article.id}
              className="news-card"
              onClick={() => handleNavigate(article.id)}
            >
              <h2>{article.title}</h2>
              <p>{article.aiSummary || 'Generating summary...'}</p>
              <button onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}>
                <FaBookmark />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsDigest;