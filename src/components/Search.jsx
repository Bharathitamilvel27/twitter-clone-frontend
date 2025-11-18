import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Search.css';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('tweets'); // 'tweets' or 'users'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchTweets = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/tweets/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchTweets, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType]);

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const formatDistanceToNow = (date) => {
    const now = new Date();
    const tweetDate = new Date(date);
    const diffInSeconds = Math.floor((now - tweetDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h2>Search</h2>
        <div className="search-tabs">
          <button
            className={`search-tab ${searchType === 'tweets' ? 'active' : ''}`}
            onClick={() => setSearchType('tweets')}
          >
            Tweets
          </button>
          <button
            className={`search-tab ${searchType === 'users' ? 'active' : ''}`}
            onClick={() => setSearchType('users')}
          >
            Users
          </button>
        </div>
      </div>

      <div className="search-input-container">
        <input
          type="text"
          placeholder={`Search ${searchType}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {loading && <div className="search-spinner">🔍</div>}
      </div>

      <div className="search-results">
        {loading ? (
          <div className="search-loading">Searching...</div>
        ) : searchQuery.trim() && searchResults.length === 0 ? (
          <div className="no-results">No {searchType} found</div>
        ) : (
          searchResults.map((result) => (
            <div key={result._id} className="search-result-item">
              {searchType === 'tweets' ? (
                <div className="tweet-result">
                  <div className="tweet-result-header">
                    <img
                      src={result.user.profilePicture 
                        ? `http://localhost:5000${result.user.profilePicture}`
                        : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                      }
                      alt={`@${result.user.username}`}
                      className="tweet-result-avatar"
                    />
                    <div className="tweet-result-info">
                      <span className="tweet-result-username">@{result.user.username}</span>
                      <span className="tweet-result-time">{formatDistanceToNow(result.createdAt)} ago</span>
                    </div>
                  </div>
                  <div className="tweet-result-content">{result.content}</div>
                  {result.image && (
                    <img
                      src={`http://localhost:5000${result.image}`}
                      alt="Tweet attachment"
                      className="tweet-result-image"
                    />
                  )}
                </div>
              ) : (
                <div 
                  className="user-result"
                  onClick={() => handleUserClick(result.username)}
                >
                  <img
                    src={result.profilePicture 
                      ? `http://localhost:5000${result.profilePicture}`
                      : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                    }
                    alt={`@${result.username}`}
                    className="user-result-avatar"
                  />
                  <div className="user-result-info">
                    <span className="user-result-username">@{result.username}</span>
                    {result.bio && <span className="user-result-bio">{result.bio}</span>}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Search; 