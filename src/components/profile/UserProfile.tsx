import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Settings, Save, X, Camera, Bell, Shield, Palette } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    company: user?.company || '',
    role: user?.role || '',
  });
  const [preferences, setPreferences] = useState(user?.preferences || {
    theme: 'dark' as const,
    notifications: true,
    autoScan: false,
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company || '',
        role: user.role || '',
      });
      setPreferences(user.preferences);
    }
  }, [user]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    try {
      await updateProfile({
        ...formData,
        preferences,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company || '',
      role: user.role || '',
    });
    setPreferences(user.preferences);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        pointerEvents: 'auto'
      }}
    >
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '48rem',
          maxHeight: '85vh',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(88, 28, 135, 0.95))',
          backdropFilter: 'blur(12px)',
          borderRadius: '1rem',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header - Fixed */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
          flexShrink: 0
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
            User Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              color: 'rgba(196, 181, 253, 1)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'white'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(196, 181, 253, 1)'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs - Fixed */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
          flexShrink: 0
        }}>
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'preferences', label: 'Preferences', icon: Settings },
            { id: 'security', label: 'Security', icon: Shield }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                ...(activeTab === id ? {
                  color: 'white',
                  background: 'rgba(147, 51, 234, 0.3)',
                  borderBottom: '2px solid rgba(168, 85, 247, 1)'
                } : {
                  color: 'rgba(196, 181, 253, 1)',
                  background: 'transparent'
                })
              }}
              onMouseOver={(e) => {
                if (activeTab !== id) {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== id) {
                  e.currentTarget.style.color = 'rgba(196, 181, 253, 1)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content - Scrollable */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Avatar Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={user.avatar}
                    alt="Profile"
                    style={{
                      width: '5rem',
                      height: '5rem',
                      borderRadius: '50%',
                      border: '4px solid rgba(168, 85, 247, 0.3)'
                    }}
                  />
                  <button style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'rgba(147, 51, 234, 1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '0.375rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}>
                    <Camera size={12} />
                  </button>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <p style={{
                    color: 'rgba(196, 181, 253, 1)',
                    margin: '0.25rem 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.email}
                  </p>
                  <p style={{
                    color: 'rgba(196, 181, 253, 0.8)',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    {user.role}
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'rgba(196, 181, 253, 1)',
                      marginBottom: '0.5rem'
                    }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        opacity: isEditing ? 1 : 0.5,
                        cursor: isEditing ? 'text' : 'not-allowed'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'rgba(196, 181, 253, 1)',
                      marginBottom: '0.5rem'
                    }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        opacity: isEditing ? 1 : 0.5,
                        cursor: isEditing ? 'text' : 'not-allowed'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'rgba(196, 181, 253, 1)',
                    marginBottom: '0.5rem'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(51, 65, 85, 0.3)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      opacity: 0.5,
                      cursor: 'not-allowed'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'rgba(196, 181, 253, 1)',
                    marginBottom: '0.5rem'
                  }}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      opacity: isEditing ? 1 : 0.5,
                      cursor: isEditing ? 'text' : 'not-allowed'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'rgba(196, 181, 253, 1)',
                    marginBottom: '0.5rem'
                  }}>
                    Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      opacity: isEditing ? 1 : 0.5,
                      cursor: isEditing ? 'text' : 'not-allowed'
                    }}
                  />
                </div>

                {/* Account Info */}
                <div style={{
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(196, 181, 253, 1)', fontSize: '0.875rem' }}>Member since</span>
                    <span style={{ color: 'white', fontSize: '0.875rem' }}>{formatDate(user.createdAt)}</span>
                  </div>
                  {user.lastLogin && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'rgba(196, 181, 253, 1)', fontSize: '0.875rem' }}>Last login</span>
                      <span style={{ color: 'white', fontSize: '0.875rem' }}>{formatDate(user.lastLogin)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(196, 181, 253, 1)', fontSize: '0.875rem' }}>Storage</span>
                    <span style={{ color: 'rgba(34, 197, 94, 1)', fontSize: '0.875rem' }}>Browser localStorage</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  Application Preferences
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Palette size={20} style={{ color: 'rgba(168, 85, 247, 1)' }} />
                      <div>
                        <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>Theme</p>
                        <p style={{ color: 'rgba(196, 181, 253, 1)', fontSize: '0.875rem', margin: 0 }}>Choose your preferred theme</p>
                      </div>
                    </div>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                      style={{
                        background: 'rgba(51, 65, 85, 1)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Bell size={20} style={{ color: 'rgba(168, 85, 247, 1)' }} />
                      <div>
                        <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>Notifications</p>
                        <p style={{ color: 'rgba(196, 181, 253, 1)', fontSize: '0.875rem', margin: 0 }}>Receive scan completion notifications</p>
                      </div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        width: '2.75rem',
                        height: '1.5rem',
                        background: preferences.notifications ? 'rgba(147, 51, 234, 1)' : 'rgba(51, 65, 85, 1)',
                        borderRadius: '0.75rem',
                        position: 'relative',
                        transition: 'background 0.2s'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          left: preferences.notifications ? '1.375rem' : '2px',
                          width: '1.25rem',
                          height: '1.25rem',
                          background: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }} />
                      </div>
                    </label>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Settings size={20} style={{ color: 'rgba(168, 85, 247, 1)' }} />
                      <div>
                        <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>Auto Scan</p>
                        <p style={{ color: 'rgba(196, 181, 253, 1)', fontSize: '0.875rem', margin: 0 }}>Automatically scan on login</p>
                      </div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.autoScan}
                        onChange={(e) => setPreferences(prev => ({ ...prev, autoScan: e.target.checked }))}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        width: '2.75rem',
                        height: '1.5rem',
                        background: preferences.autoScan ? 'rgba(147, 51, 234, 1)' : 'rgba(51, 65, 85, 1)',
                        borderRadius: '0.75rem',
                        position: 'relative',
                        transition: 'background 0.2s'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          left: preferences.autoScan ? '1.375rem' : '2px',
                          width: '1.25rem',
                          height: '1.25rem',
                          background: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }} />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  Security Settings
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: '0.5rem'
                  }}>
                    <h4 style={{ color: 'white', fontWeight: '500', marginBottom: '0.5rem' }}>Password</h4>
                    <p style={{ color: 'rgba(196, 181, 253, 1)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Password is securely hashed with bcrypt</p>
                    <button style={{
                      background: 'rgba(147, 51, 234, 1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}>
                      Change Password
                    </button>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: '0.5rem'
                  }}>
                    <h4 style={{ color: 'white', fontWeight: '500', marginBottom: '0.5rem' }}>Browser Storage Security</h4>
                    <p style={{ color: 'rgba(196, 181, 253, 1)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Your data is stored securely in your browser's localStorage</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        { label: 'Password Encryption', value: 'bcrypt (10 rounds)' },
                        { label: 'Session Storage', value: 'localStorage' },
                        { label: 'Storage Type', value: 'Browser (Local)' }
                      ].map(({ label, value }) => (
                        <div key={label} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem',
                          background: 'rgba(51, 65, 85, 0.3)',
                          borderRadius: '0.25rem'
                        }}>
                          <span style={{ color: 'white', fontSize: '0.875rem' }}>{label}</span>
                          <span style={{ color: 'rgba(34, 197, 94, 1)', fontSize: '0.75rem' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          borderTop: '1px solid rgba(168, 85, 247, 0.3)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {activeTab === 'profile' && (
              <>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: 'rgba(147, 51, 234, 1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(126, 34, 206, 1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(147, 51, 234, 1)'}
                  >
                    <Settings size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      style={{
                        background: 'rgba(34, 197, 94, 1)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: isLoading ? 0.5 : 1,
                        transition: 'background 0.2s'
                      }}
                    >
                      {isLoading ? (
                        <div style={{
                          width: '1rem',
                          height: '1rem',
                          border: '2px solid white',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      style={{
                        background: 'rgba(51, 65, 85, 1)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(71, 85, 105, 1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(51, 65, 85, 1)'}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}
            {(activeTab === 'preferences' || activeTab === 'security') && (
              <button
                onClick={handleSave}
                disabled={isLoading}
                style={{
                  background: 'rgba(147, 51, 234, 1)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => !isLoading && (e.currentTarget.style.background = 'rgba(126, 34, 206, 1)')}
                onMouseOut={(e) => !isLoading && (e.currentTarget.style.background = 'rgba(147, 51, 234, 1)')}
              >
                {isLoading ? (
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render modal outside the normal DOM tree
  return createPortal(modalContent, document.body);
};

export default UserProfile;