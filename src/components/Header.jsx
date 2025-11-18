import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import twitterLogo from '../assets/twitter-logo.png';

function Header({ username }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <img src={twitterLogo} alt="Twitter Logo" style={styles.logo} />
        <span style={styles.brand}>Twitter Clone</span>
      </div>

      <div style={styles.right}>
        {username && <span style={styles.username}>@{username}</span>}
        <button 
          onClick={toggleDarkMode} 
          style={styles.themeBtn}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
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

export default Header;
