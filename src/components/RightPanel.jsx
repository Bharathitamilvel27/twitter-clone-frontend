// RightPanel.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './RightPanel.css';

function RightPanel() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // fetch suggestions
          const response = await axios.get('http://localhost:5000/api/auth/suggested-users', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSuggestedUsers(response.data.users);

          // fetch trends
          const trendsRes = await axios.get('http://localhost:5000/api/tweets/trends', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTrends(trendsRes.data.trends || []);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching suggested users:', error);
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, []);

  return (
    <div className="right-panel">
      <div className="panel-section">
        <h3>Trending</h3>
        {trends.length === 0 ? (
          <div className="no-suggestions">No trends yet</div>
        ) : (
          <ul>
            {trends.map((t) => (
              <li key={t.tag}>
                <a href={`/hashtag/${encodeURIComponent(t.tag)}`}>#{t.tag}</a>
                <span style={{ color:'#657786', marginLeft: 6 }}>· {t.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel-section">
        <h3>Who to follow</h3>
        {loading ? (
          <div className="loading-suggestions">Loading...</div>
        ) : suggestedUsers.length > 0 ? (
          <ul>
            {suggestedUsers.map((user) => (
              <li key={user._id} className="suggested-user">
                <div className="user-info">
                  <img
                    src={user.profilePicture 
                      ? `http://localhost:5000${user.profilePicture}`
                      : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                    }
                    alt={`@${user.username}`}
                    className="suggested-avatar"
                  />
                  <div className="user-details">
                    <span className="suggested-username">@{user.username}</span>
                    {user.bio && <span className="suggested-bio">{user.bio.substring(0, 50)}...</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-suggestions">No suggestions available</div>
        )}
      </div>
    </div>
  );
}

export default RightPanel;
