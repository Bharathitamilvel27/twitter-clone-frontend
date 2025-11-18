import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function Admin() {
  const [user, setUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasonMap, setReasonMap] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    (async () => {
      try {
        const [me, list] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/tweets', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (!me.data.user?.isAdmin) {
          window.location.href = '/home';
          return;
        }
        setUser(me.data.user);
        setTweets(list.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (tweetId) => {
    const token = localStorage.getItem('token');
    const reason = reasonMap[tweetId] || 'Violation of community guidelines';
    if (!window.confirm('Delete this tweet?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/tweets/${tweetId}`,
        { data: { reason }, headers: { Authorization: `Bearer ${token}` } }
      );
      setTweets(prev => prev.filter(t => t._id !== tweetId));
    } catch (e) {
      console.error('Admin delete failed', e.response?.data || e.message);
      alert('Failed to delete tweet');
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <>
      <Header username={user?.username} />
      <div className="main-layout" style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Admin Moderation</h2>
          <p>Logged in as: @{user?.username}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tweets.map(t => (
              <div key={t._id} style={{ background: '#fff', border: '1px solid #e6ecf0', padding: 16, borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>@{t.user?.username}</strong>
                  <span style={{ color: '#888' }}>{new Date(t.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ marginTop: 8 }}>{t.content}</div>
                {t.image && (
                  <img src={`http://localhost:5000${t.image}`} alt="attachment" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <label htmlFor={`reason-${t._id}`} style={{ fontSize: 13, color: '#555' }}>
                    Reason for removal (will be emailed to the author)
                  </label>
                  <textarea
                    id={`reason-${t._id}`}
                    rows={2}
                    placeholder="e.g., Spam, offensive content, personal info, etc."
                    value={reasonMap[t._id] || ''}
                    onChange={(e) => setReasonMap(prev => ({ ...prev, [t._id]: e.target.value }))}
                    style={{ width: '100%', resize: 'vertical', border: '1px solid #cfd9de', borderRadius: 8, padding: 10, outline: 'none', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      style={{ background: '#e0245e', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => handleDelete(t._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
