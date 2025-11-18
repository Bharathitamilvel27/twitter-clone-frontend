import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import './Profile.css';

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userTweets, setUserTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    location: '',
    website: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editingTweet, setEditingTweet] = useState(null);
  const [editTweetContent, setEditTweetContent] = useState('');
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [currentUserRes, profileRes, tweetsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/auth/profile/username/${username}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/tweets/user/${username}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setCurrentUser(currentUserRes.data.user);
        setProfileUser(profileRes.data.user);
        setUserTweets(tweetsRes.data);
        setEditForm({
          bio: profileRes.data.user.bio || '',
          location: profileRes.data.user.location || '',
          website: profileRes.data.user.website || ''
        });
        
        // Check if current user is following profile user
        const isFollowingUser = currentUserRes.data.user.following?.includes(profileRes.data.user._id);
        setIsFollowing(isFollowingUser);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [username, navigate]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/auth/follow/${profileUser._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsFollowing(response.data.following);
      
      // Update the profile user's follower count
      setProfileUser(prev => ({
        ...prev,
        followers: response.data.following 
          ? [...prev.followers, currentUser._id]
          : prev.followers.filter(id => id !== currentUser._id)
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Update profile info
      const profileRes = await axios.put(
        'http://localhost:5000/api/auth/profile',
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Upload profile picture if selected
      if (profileImage) {
        const formData = new FormData();
        formData.append('profilePicture', profileImage);
        
        const imageRes = await axios.post(
          'http://localhost:5000/api/auth/profile/picture',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        setCurrentUser(imageRes.data.user);
      }

      setCurrentUser(profileRes.data.user);
      setIsEditing(false);
      setProfileImage(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
  };

  const handleLike = async (tweetId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `http://localhost:5000/api/tweets/${tweetId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the specific tweet in the list
      setUserTweets(prev => prev.map(tweet => {
        if (tweet._id === tweetId) {
          return {
            ...tweet,
            likedByCurrentUser: !tweet.likedByCurrentUser,
            likesCount: tweet.likedByCurrentUser ? tweet.likesCount - 1 : tweet.likesCount + 1
          };
        }
        return tweet;
      }));
    } catch (error) {
      console.error('Error liking tweet:', error);
    }
  };

  const handleEditTweet = (tweet) => {
    setEditingTweet(tweet._id);
    setEditTweetContent(tweet.content);
  };

  const handleSaveEdit = async (tweetId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/tweets/${tweetId}`,
        { content: editTweetContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the tweet in the list
      setUserTweets(prev => prev.map(tweet => {
        if (tweet._id === tweetId) {
          return { ...tweet, content: editTweetContent };
        }
        return tweet;
      }));
      
      setEditingTweet(null);
      setEditTweetContent('');
    } catch (error) {
      console.error('Error updating tweet:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTweet(null);
    setEditTweetContent('');
  };

  const handleDeleteTweet = async (tweetId) => {
    if (!window.confirm('Are you sure you want to delete this tweet?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/tweets/${tweetId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove the tweet from the list
      setUserTweets(prev => prev.filter(tweet => tweet._id !== tweetId));
    } catch (error) {
      console.error('Error deleting tweet:', error);
    }
  };

  const handleShowFollowers = async () => {
    if (followersList.length === 0) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/auth/profile/username/${username}/followers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowersList(response.data.followers);
      } catch (error) {
        console.error('Error fetching followers:', error);
      }
    }
    setShowFollowers(!showFollowers);
    setShowFollowing(false);
  };

  const handleShowFollowing = async () => {
    if (followingList.length === 0) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/auth/profile/username/${username}/following`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowingList(response.data.following);
      } catch (error) {
        console.error('Error fetching following:', error);
      }
    }
    setShowFollowing(!showFollowing);
    setShowFollowers(false);
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!profileUser) {
    return <div className="error-container">User not found</div>;
  }

  const isOwnProfile = currentUser?._id === profileUser._id;

  return (
    <>
      <Header username={currentUser?.username} />
      
      <div className="main-layout">
        <Sidebar />
        
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-cover">
              <div className="profile-avatar">
                <img
                  src={profileUser.profilePicture 
                    ? `http://localhost:5000${profileUser.profilePicture}`
                    : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                  }
                  alt={`@${profileUser.username}`}
                />
                {isOwnProfile && (
                  <label className="avatar-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    📷
                  </label>
                )}
              </div>
            </div>
            
            <div className="profile-info">
              <div className="profile-actions">
                {isOwnProfile ? (
                  <button 
                    className="edit-profile-btn"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                ) : (
                  <button 
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              
              <h1 className="profile-name">@{profileUser.username}</h1>
              
              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="edit-form">
                  <div className="form-group">
                    <label>Bio:</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      maxLength={160}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Location:</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Where are you?"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Website:</label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <button type="submit" className="save-btn">Save Changes</button>
                </form>
              ) : (
                <div className="profile-details">
                  {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}
                  {profileUser.location && <p className="profile-location">📍 {profileUser.location}</p>}
                  {profileUser.website && (
                    <p className="profile-website">
                      <a href={profileUser.website} target="_blank" rel="noopener noreferrer">
                        🔗 {profileUser.website}
                      </a>
                    </p>
                  )}
                </div>
              )}
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{userTweets.length}</span>
                  <span className="stat-label">Tweets</span>
                </div>
                <div className="stat clickable" onClick={handleShowFollowing}>
                  <span className="stat-number">{profileUser.following?.length || 0}</span>
                  <span className="stat-label">Following</span>
                </div>
                <div className="stat clickable" onClick={handleShowFollowers}>
                  <span className="stat-number">{profileUser.followers?.length || 0}</span>
                  <span className="stat-label">Followers</span>
                </div>
              </div>

              {/* Followers/Following Lists */}
              {(showFollowers || showFollowing) && (
                <div 
                  className="followers-following-modal"
                  onClick={(e) => {
                    if (e.target.className === 'followers-following-modal') {
                      setShowFollowers(false);
                      setShowFollowing(false);
                    }
                  }}
                >
                  <div className="modal-header">
                    <h3>{showFollowers ? 'Followers' : 'Following'}</h3>
                    <button 
                      className="close-modal-btn"
                      onClick={() => {
                        setShowFollowers(false);
                        setShowFollowing(false);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-content">
                    {showFollowers && (
                      <div className="users-list">
                        {followersList.length > 0 ? (
                          followersList.map((follower) => (
                            <div key={follower._id} className="user-item">
                              <img
                                src={follower.profilePicture 
                                  ? `http://localhost:5000${follower.profilePicture}`
                                  : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                                }
                                alt={`@${follower.username}`}
                                className="user-avatar"
                              />
                              <div className="user-info">
                                <span className="user-username">@{follower.username}</span>
                                {follower.bio && <span className="user-bio">{follower.bio}</span>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-users">No followers yet</div>
                        )}
                      </div>
                    )}
                    {showFollowing && (
                      <div className="users-list">
                        {followingList.length > 0 ? (
                          followingList.map((following) => (
                            <div key={following._id} className="user-item">
                              <img
                                src={following.profilePicture 
                                  ? `http://localhost:5000${following.profilePicture}`
                                  : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                                }
                                alt={`@${following.username}`}
                                className="user-avatar"
                              />
                              <div className="user-info">
                                <span className="user-username">@{following.username}</span>
                                {following.bio && <span className="user-bio">{following.bio}</span>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-users">Not following anyone yet</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-tweets">
            <h2>Tweets</h2>
            {userTweets.length === 0 ? (
              <div className="no-tweets">
                <p>No tweets yet!</p>
              </div>
            ) : (
              <div className="tweet-list">
                {userTweets.map((tweet) => (
                  <div key={tweet._id} className="tweet-card">
                    <div className="tweet-user">
                      <img
                        src={profileUser.profilePicture 
                          ? `http://localhost:5000${profileUser.profilePicture}`
                          : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                        }
                        alt={`@${profileUser.username}`}
                        className="tweet-avatar"
                      />
                      <div className="tweet-user-info">
                        <span className="tweet-username">@{profileUser.username}</span>
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
                    ) : editingTweet === tweet._id ? (
                      <div className="tweet-edit-mode">
                        <textarea
                          value={editTweetContent}
                          onChange={(e) => setEditTweetContent(e.target.value)}
                          className="tweet-edit-textarea"
                          placeholder="Edit your tweet..."
                        />
                        <div className="tweet-edit-actions">
                          <button 
                            onClick={() => handleSaveEdit(tweet._id)}
                            className="save-edit-btn"
                          >
                            Save
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="cancel-edit-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="tweet-text">{tweet.content}</div>
                    )}

                    {!tweet.isDeleted && tweet.image && (
                      <img
                        src={`http://localhost:5000${tweet.image}`}
                        alt="Tweet attachment"
                        className="tweet-image"
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
                            ❤️ {tweet.likesCount || 0}
                          </span>
                          
                          {isOwnProfile && editingTweet !== tweet._id && (
                            <>
                              <span
                                className="edit-button"
                                onClick={() => handleEditTweet(tweet)}
                                title="Edit tweet"
                              >
                                ✏️
                              </span>
                              <span
                                className="delete-button"
                                onClick={() => handleDeleteTweet(tweet._id)}
                                title="Delete tweet"
                              >
                                🗑️
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      <span className="tweet-time">
                        {formatDistanceToNow(new Date(tweet.createdAt))} ago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <RightPanel />
        </div>
      </div>
    </>
  );
}

export default Profile; 