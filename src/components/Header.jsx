import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import twitterLogo from '../assets/twitter-logo.png';

function Header({ username, onMenuToggle }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <button 
          onClick={onMenuToggle}
          style={styles.menuBtn}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <img src={twitterLogo} alt="Twitter Logo" style={styles.logo} />
        <span style={styles.brand}>Twitter Clone</span>
      </div>

      <div style={styles.right}>
        {username && <span style={styles.username} className="desktop-only">@{username}</span>}
        <button 
          onClick={toggleDarkMode} 
          style={styles.themeBtn}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button onClick={handleLogout} style={styles.logoutBtn} className="desktop-only">Logout</button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    borderBottom: '1px solid #ccc',
    backgroundColor: '#1DA1F2',
    color: 'white',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  menuBtn: {
    display: 'none', // Hidden on desktop
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '20px',
    marginRight: '10px',
  },
  logo: {
    width: '32px',
    height: '32px',
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  username: {
    fontWeight: 'bold',
  },
  themeBtn: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s',
  },
  logoutBtn: {
    background: 'white',
    color: '#1DA1F2',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

// Add mobile styles
const mobileStyles = `
  @media (max-width: 768px) {
    .mobile-menu-btn {
      display: block !important;
    }
    .desktop-only {
      display: none !important;
    }
    header {
      padding: 10px 15px !important;
    }
    header .brand {
      font-size: 16px !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mobileStyles;
  document.head.appendChild(styleSheet);
}

export default Header;
