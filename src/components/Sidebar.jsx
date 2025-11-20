import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './Sidebar.css';
import { API_BASE_URL } from '../utils/constants';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setCurrentUser(res.data.user))
      .catch(err => console.error('Error fetching user:', err));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const goToProfile = () => {
    if (currentUser) {
      navigate(`/profile/${currentUser.username}`);
      onClose?.(); // Close menu on mobile after navigation
    }
  };

  const handleNav = (path) => {
    navigate(path);
    onClose?.(); // Close menu on mobile after navigation
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <h2>Twitter</h2>
        <ul>
          <li onClick={() => handleNav('/home')}>🏠 Home</li>
          <li onClick={() => handleNav('/search')}>🔍 Search</li>
          <li onClick={goToProfile}>👤 Profile</li>
          {currentUser?.isAdmin && (
            <li onClick={() => handleNav('/admin')}>🛡️ Admin</li>
          )}
          <li onClick={logout}>🚪 Logout</li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
