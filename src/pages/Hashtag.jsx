import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';

function Hashtag() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    (async () => {
      try {
        const [meRes, listRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5000/api/tweets/hashtag/${encodeURIComponent(tag)}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUser(meRes.data.user);
        setTweets(listRes.data);
      } catch (e) {
        console.error('Hashtag load failed', e.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [tag, navigate]);

  const renderContentWithHashtags = (text) => {
    if (!text) return null;
    const parts = text.split(/(#[\p{L}\p{N}_]+)/u);
    return parts.map((part, idx) => {
      if (part.startsWith && part.startsWith('#')) {
        const h = part.slice(1);
        return (
          <Link key={idx} to={`/hashtag/${encodeURIComponent(h)}`} style={{ color: '#1DA1F2' }}>{part}</Link>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <>
      <Header username={user?.username} />
      <div className="main-layout">
        <Sidebar />
        <div className="tweet-feed" style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 10 }}>#{tag}</h2>
          <div className="tweet-list">
            {tweets.map((t) => (
              <div key={t._id} className="tweet-card">
                <div className="tweet-user">
                  <img
                    src={t.user.profilePicture 
                      ? `http://localhost:5000${t.user.profilePicture}`
                      : 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'}
                    alt={`@${t.user.username}`}
                    className="tweet-avatar"
                  />
                  <div className="tweet-user-info">
                    <span className="tweet-username">@{t.user.username}</span>
                  </div>
                </div>

                {t.isDeleted ? (
                  <div className="tweet-text" style={{ background:'#f5f8fa', border:'1px solid #e6ecf0', padding:'10px', borderRadius:8, color:'#657786' }}>
                    <strong>Removed by admin</strong>
                    <div style={{ marginTop: 4 }}>Reason: {t.deletedReason || 'Not specified'}</div>
                    {t.deletedAt && (
                      <div style={{ fontSize: 12, marginTop: 4 }}>On: {new Date(t.deletedAt).toLocaleString()}</div>
                    )}
                  </div>
                ) : (
                  <div className="tweet-text">{renderContentWithHashtags(t.content)}</div>
                )}

                {!t.isDeleted && t.image && (
                  <img
                    src={`http://localhost:5000${t.image}`}
                    alt="Tweet attachment"
                    className="tweet-image"
                    style={{ marginTop:'10px', maxWidth:'100%', borderRadius:'10px' }}
                  />
                )}
                {!t.isDeleted && t.video && (
                  <video
                    controls
                    src={`http://localhost:5000${t.video}`}
                    className="tweet-image"
                    style={{ marginTop:'10px', maxWidth:'100%', borderRadius:'10px' }}
                  />
                )}

                <div className="tweet-footer">
                  <span className="tweet-time">{formatDistanceToNow(new Date(t.createdAt))} ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <RightPanel />
      </div>
    </>
  );
}

export default Hashtag;
