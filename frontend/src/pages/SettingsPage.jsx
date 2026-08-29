import { useState, useEffect } from 'react';
import { User, Shield, Palette, Loader2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateMe, updatePassword } from '../services/userService';

const ACCENT_COLORS = [
  { name: 'Blue', class: 'bg-blue-500 shadow-blue-500/50' },
  { name: 'Green', class: 'bg-emerald-500 shadow-emerald-500/50' },
  { name: 'Yellow', class: 'bg-yellow-500 shadow-yellow-500/50' },
  { name: 'Orange', class: 'bg-orange-500 shadow-orange-500/50' },
  { name: 'Red', class: 'bg-red-500 shadow-red-500/50' },
  { name: 'Purple', class: 'bg-purple-500 shadow-purple-500/50' },
  { name: 'Violet', class: 'bg-violet-500 shadow-violet-500/50' },
  { name: 'Cyan', class: 'bg-cyan-500 shadow-cyan-500/50' },
  { name: 'Coral', class: 'bg-[#ff7f50] shadow-[#ff7f50]/50' },
];

export default function SettingsPage() {
  const { currentUser, setCurrentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('APPEARANCE');
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '', 
  });

  // Theme State
  const [themeMode, setThemeMode] = useState('Dark');
  const [accentColor, setAccentColor] = useState('Coral');

  // Security State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load preferences from context if available
  useEffect(() => {
    if (currentUser?.themePreferences) {
      setThemeMode(currentUser.themePreferences.mode || 'Dark');
      setAccentColor(currentUser.themePreferences.accentColor || 'Coral');
    }
  }, [currentUser]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await updateMe({ name: profileData.name });
      setCurrentUser(res.user);
      showMessage('Profile updated successfully!');
    } catch (err) {
      showMessage(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showMessage('New passwords do not match', 'error');
    }
    
    setIsLoading(true);
    try {
      await updatePassword(passwords.currentPassword, passwords.newPassword);
      showMessage('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMessage(err.message || 'Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (mode, color) => {
    setThemeMode(mode);
    setAccentColor(color);
    try {
      const res = await updateMe({ 
        themePreferences: { mode, accentColor: color }
      });
      setCurrentUser(res.user);
      // showMessage('Theme updated successfully!');
    } catch (err) {
      console.error('Failed to save theme', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-brand-text">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Settings</h1>
        <p className="text-sm text-brand-muted mt-1">Manage your account preferences, security, and workspace appearance.</p>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-bold border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('APPEARANCE')} 
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'APPEARANCE' ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' : 'text-zinc-500 hover:text-brand-text hover:bg-brand-elevated/50'}`}
          >
            <Palette className="w-4 h-4 mr-3" /> Appearance
          </button>
          <button 
            onClick={() => setActiveTab('PROFILE')} 
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'PROFILE' ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' : 'text-zinc-500 hover:text-brand-text hover:bg-brand-elevated/50'}`}
          >
            <User className="w-4 h-4 mr-3" /> Profile Data
          </button>
          <button 
            onClick={() => setActiveTab('SECURITY')} 
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'SECURITY' ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' : 'text-zinc-500 hover:text-brand-text hover:bg-brand-elevated/50'}`}
          >
            <Shield className="w-4 h-4 mr-3" /> Security
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-brand-surface border border-brand-border rounded-2xl p-6 lg:p-8">
          
          {/* APPEARANCE TAB */}
          {activeTab === 'APPEARANCE' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-xl font-bold text-brand-text">Themes</h3>
                <p className="text-sm text-brand-muted mt-1 mb-6">Customize the visual style of your workspace.</p>
                
                <div className="inline-flex bg-brand-elevated p-1 rounded-full border border-brand-border">
                  {['Auto', 'Light', 'Dark'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleThemeChange(mode, accentColor)}
                      className={`px-8 py-2 rounded-full text-sm font-semibold transition-all ${themeMode === mode ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-zinc-500 hover:text-brand-text'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-brand-border">
                <h4 className="text-sm font-bold text-brand-text mb-4">Accent color</h4>
                <div className="flex flex-wrap gap-4">
                  {ACCENT_COLORS.map(color => (
                    <div key={color.name} className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => handleThemeChange(themeMode, color.name)}
                        className={`w-10 h-10 rounded-full transition-all flex items-center justify-center relative ${color.class} ${accentColor === color.name ? 'ring-2 ring-offset-2 ring-offset-brand-surface ring-brand-text scale-110 shadow-lg' : 'opacity-80 hover:opacity-100 hover:scale-105'}`}
                      >
                        {accentColor === color.name && <div className="absolute inset-0 rounded-full border border-brand-surface m-0.5"></div>}
                      </button>
                      <span className={`text-xs ${accentColor === color.name ? 'text-brand-text font-medium' : 'text-brand-muted'}`}>{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'PROFILE' && (
            <form onSubmit={handleProfileSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-xl font-bold text-brand-text">Profile Data</h3>
                <p className="text-sm text-brand-muted mt-1">Update your personal information.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    disabled
                    value={profileData.email}
                    className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-600 mt-1">Contact support to change your email address.</p>
                </div>
              </div>

              <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-6 py-3 bg-brand-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-accent/20 hover:opacity-90 transition-opacity flex items-center"
                  >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'SECURITY' && (
            <form onSubmit={handlePasswordSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-xl font-bold text-brand-text">Security</h3>
                <p className="text-sm text-brand-muted mt-1">Update your password to keep your account secure.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase">New Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
              </div>

              <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-6 py-3 bg-brand-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-accent/20 hover:opacity-90 transition-opacity flex items-center"
                  >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Update Password
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
