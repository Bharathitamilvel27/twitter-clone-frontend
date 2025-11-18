import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import Search from '../components/Search';
import './SearchPage.css';

function SearchPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((userRes) => {
        setUser(userRes.data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate]);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <>
      <Header username={user?.username} />
      
      <div className="main-layout">
        <Sidebar />
        
        <div className="search-page-container">
          <Search />
        </div>
        
        <RightPanel />
      </div>
    </>
  );
}

export default SearchPage; 