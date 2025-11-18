import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/api/auth/me', {
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
    }
  };

  return (
    <div className="sidebar">
      <h2>Twitter</h2>
      <ul>
        <li onClick={() => navigate('/home')}>🏠 Home</li>
        <li onClick={() => navigate('/search')}>🔍 Search</li>
        <li onClick={goToProfile}>👤 Profile</li>
        {currentUser?.isAdmin && (
          <li onClick={() => navigate('/admin')}>🛡️ Admin</li>
        )}
        <li onClick={logout}>🚪 Logout</li>
      </ul>
    </div>
  );
}

export default Sidebar;
