import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import './Home.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [user, setUser] = useState(null);
  const [tweet, setTweet] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get('http://localhost:5000/api/tweets', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([userRes, tweetsRes]) => {
        setUser(userRes.data.user);
        setTweets(tweetsRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      });
  }, [navigate]);

  const handleTweet = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      let imageUrl = '';
      let videoUrl = '';

      // ✅ Upload image if present
      if (image) {
        const formData = new FormData();
        // use unified 'media' field (backend supports legacy too)
        formData.append('media', image);

        const uploadRes = await axios.post(
          'http://localhost:5000/api/upload/tweet',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        if (uploadRes.data?.type === 'video') {
          videoUrl = uploadRes.data.videoUrl;
        } else {
          imageUrl = uploadRes.data.imageUrl;
        }
      }

      // ✅ Now post tweet with text and optional image
      const res = await axios.post(
        'http://localhost:5000/api/tweets',
        { content: tweet, image: imageUrl, video: videoUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newTweet = {
        ...res.data,
        likesCount: 0,
      };
      setTweets((prev) => [newTweet, ...prev]);
      setTweet('');
      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error('Tweet error:', err);
      alert('Failed to post tweet');
    }
  };

  const handleLike = async (tweetId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `http://localhost:5000/api/tweets/${tweetId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch the tweet to get updated likes and likedByCurrentUser
      const tweetRes = await axios.get(`http://localhost:5000/api/tweets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTweets(tweetRes.data);
    } catch (err) {
      console.error('Like error:', err.response?.data || err.message);
    }
  };

  const handleRetweet = async (tweetId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `http://localhost:5000/api/tweets/${tweetId}/retweet`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch tweets to get updated retweet status
      const tweetRes = await axios.get(`http://localhost:5000/api/tweets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTweets(tweetRes.data);
    } catch (err) {
      console.error('Retweet error:', err.response?.data || err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const renderContentWithHashtags = (text) => {
    if (!text) return null;
    const parts = text.split(/(#[\p{L}\p{N}_]+)/u);
    return parts.map((part, idx) => {
      if (part.startsWith && part.startsWith('#')) {
        const tag = part.slice(1);
        return (
          <a key={idx} href={`/hashtag/${encodeURIComponent(tag)}`} style={{ color: '#1DA1F2' }}>{part}</a>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const handleCommentInputChange = (tweetId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [tweetId]: value,
    }));
  };

  const handleCommentSubmit = async (e, tweetId) => {
    e.preventDefault();
    const text = commentInputs[tweetId];
    if (!text || !text.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/tweets/${tweetId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch the tweet to get updated comments
      const tweetRes = await axios.get(`http://localhost:5000/api/tweets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTweets(tweetRes.data);
      setCommentInputs((prev) => ({
        ...prev,
        [tweetId]: '',
      }));
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const toggleComments = (tweetId) => {
    setShowComments((prev) => ({
      ...prev,
      [tweetId]: !prev[tweetId],
    }));
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <>
      <Header username={user?.username} />

      <div className="main-layout">
        <Sidebar />

        <div className="tweet-feed">
          <h2 className="welcome-text">Hello, @{user?.username} 👋</h2>

          <form onSubmit={handleTweet} className="tweet-form">
            <textarea
              placeholder="What's happening?"
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
              maxLength={280}
              required
            />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
              <small style={{ color: tweet.length > 260 ? '#e0245e' : '#657786' }}>{tweet.length}/280</small>
            </div>

            <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
            {preview && (
              image && image.type?.startsWith('video/') ? (
                <video controls src={preview} style={{ marginTop:'10px', maxWidth:'100%', borderRadius:'10px' }} />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ marginTop:'10px', maxWidth:'100%', borderRadius:'10px' }}
                />
              )
            )}
            <button type="submit">Tweet</button>
          </form>

          <div className="tweet-list">
            {tweets.map((tweet) => (
              <div key={tweet._id} className="tweet-card">
                <div className="tweet-user">
                  <img
                    src={tweet.user.profilePicture 
                      ? `http://localhost:5000${tweet.user.profilePicture}`
                      : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                    }
                    alt={`@${tweet.user.username}`}
                    className="tweet-avatar"
                  />
                  <div className="tweet-user-info">
                    <span className="tweet-username">@{tweet.user.username}</span>
                  </div>
                </div>

                {tweet.isDeleted ? (
                  <div className="tweet-text" style={{ background:'#f5f8fa', border:'1px solid #e6ecf0', padding:'10px', borderRadius:8, color:'#657786' }}>
                    <strong>Removed by admin</strong>
                    <div style={{ marginTop: 4 }}>Reason: {tweet.deletedReason || 'Not specified'}</div>
                    {tweet.deletedAt && (
                      <div style={{ fontSize: 12, marginTop: 4 }}>On: {new Date(tweet.deletedAt).toLocaleString()}</div>
                    )}
                  </div>
                ) : (
                  <div className="tweet-text">{renderContentWithHashtags(tweet.content)}</div>
                )}

                {!tweet.isDeleted && tweet.image && (
                  <img
                    src={`http://localhost:5000${tweet.image}`}
                    alt="Tweet attachment"
                    className="tweet-image"
                    style={{
                      marginTop: '10px',
                      maxWidth: '100%',
                      borderRadius: '10px',
                    }}
                  />
                )}
                {!tweet.isDeleted && tweet.video && (
                  <video
                    controls
                    src={`http://localhost:5000${tweet.video}`}
                    className="tweet-image"
                    style={{ marginTop:'10px', maxWidth:'100%', borderRadius:'10px' }}
                  />
                )}

                <div className="tweet-footer">
                  {!tweet.isDeleted && (
                    <div className="tweet-actions">
                      <span
                        className="like-button"
                        onClick={() => handleLike(tweet._id)}
                        style={{ color: tweet.likedByCurrentUser ? '#e0245e' : '#888' }}
                      >
                        ❤️ {tweet.likesCount}
                      </span>
                      
                      <span
                        className="retweet-button"
                        onClick={() => handleRetweet(tweet._id)}
                        style={{ color: tweet.retweetedByCurrentUser ? '#17bf63' : '#888' }}
                      >
                        🔄 {tweet.retweetsCount || 0}
                      </span>
                    </div>
                  )}
                  <span className="tweet-time">
                    {formatDistanceToNow(new Date(tweet.createdAt))} ago
                  </span>
                </div>

                {!tweet.isDeleted && (
                  <div className="tweet-comments-section">
                    <div className="tweet-comments-list">
                      {tweet.comments && tweet.comments.length > 0 ? (
                        tweet.comments.map((comment, i) => (
                          <div key={i} className="comment">
                            <span className="comment-username">
                              @{comment.user?.username || 'anon'}
                            </span>
                            {comment.text}
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#888', fontSize: '0.95em', marginBottom: '10px' }}>
                          No comments yet.
                        </div>
                      )}
                    </div>
                    <form onSubmit={(e) => handleCommentSubmit(e, tweet._id)}>
                      <input
                        type="text"
                        value={commentInputs[tweet._id] || ''}
                        onChange={(e) => handleCommentInputChange(tweet._id, e.target.value)}
                        placeholder="💬 Write a comment..."
                      />
                      <button type="submit">Post</button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <RightPanel />
      </div>
    </>
  );
}

export default Home;
