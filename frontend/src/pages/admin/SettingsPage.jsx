import { useState, useEffect } from 'react';
import { Save, Bell, Shield, Globe, Database, Moon, Sun, RefreshCw } from 'lucide-react';
import { apiCall } from '../../services/api';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: 'ForexTrading Platform',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    defaultTheme: 'dark',
    accentColor: 'Red',
    systemEmail: 'admin@forextrading.com',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiCall('/admin/settings', { method: 'GET' });
        if (res.data) {
          setSettings(res.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const colorMap = {
    Blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', bgSubtle: 'bg-blue-500/10', ring: 'focus:ring-blue-500/50', focusBorder: 'focus:border-blue-500/50', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', peerCheckedBg: 'peer-checked:bg-blue-500' },
    Green: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', bgSubtle: 'bg-green-500/10', ring: 'focus:ring-green-500/50', focusBorder: 'focus:border-green-500/50', shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]', peerCheckedBg: 'peer-checked:bg-green-500' },
    Yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500', bgSubtle: 'bg-yellow-500/10', ring: 'focus:ring-yellow-500/50', focusBorder: 'focus:border-yellow-500/50', shadow: 'shadow-[0_0_10px_rgba(234,179,8,0.5)]', peerCheckedBg: 'peer-checked:bg-yellow-500' },
    Orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', bgSubtle: 'bg-orange-500/10', ring: 'focus:ring-orange-500/50', focusBorder: 'focus:border-orange-500/50', shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.5)]', peerCheckedBg: 'peer-checked:bg-orange-500' },
    Red: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', bgSubtle: 'bg-red-500/10', ring: 'focus:ring-red-500/50', focusBorder: 'focus:border-red-500/50', shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]', peerCheckedBg: 'peer-checked:bg-red-500' },
    Purple: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', bgSubtle: 'bg-purple-500/10', ring: 'focus:ring-purple-500/50', focusBorder: 'focus:border-purple-500/50', shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]', peerCheckedBg: 'peer-checked:bg-purple-500' },
    Violet: { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500', bgSubtle: 'bg-violet-500/10', ring: 'focus:ring-violet-500/50', focusBorder: 'focus:border-violet-500/50', shadow: 'shadow-[0_0_10px_rgba(139,92,246,0.5)]', peerCheckedBg: 'peer-checked:bg-violet-500' },
    Cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', bgSubtle: 'bg-cyan-500/10', ring: 'focus:ring-cyan-500/50', focusBorder: 'focus:border-cyan-500/50', shadow: 'shadow-[0_0_10px_rgba(6,182,212,0.5)]', peerCheckedBg: 'peer-checked:bg-cyan-500' },
    Coral: { bg: 'bg-rose-400', text: 'text-rose-400', border: 'border-rose-400', bgSubtle: 'bg-rose-400/10', ring: 'focus:ring-rose-400/50', focusBorder: 'focus:border-rose-400/50', shadow: 'shadow-[0_0_10px_rgba(251,113,133,0.5)]', peerCheckedBg: 'peer-checked:bg-rose-400' },
  };

  const accentColors = Object.keys(colorMap).map(name => ({ name, class: colorMap[name].bg }));
  const activeTheme = colorMap[settings.accentColor] || colorMap.Red;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall('/admin/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Configure global application preferences and features.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* General Settings */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-zinc-800/50">
            <Globe className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-white">General Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none ${activeTheme.focusBorder} focus:ring-1 ${activeTheme.ring}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">System Email Address</label>
              <input
                type="email"
                name="systemEmail"
                value={settings.systemEmail}
                onChange={handleChange}
                className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none ${activeTheme.focusBorder} focus:ring-1 ${activeTheme.ring}`}
              />
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-zinc-800/50">
            <Shield className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-white">Security & Access</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-white font-medium">Maintenance Mode</p>
                <p className="text-sm text-zinc-500">Temporarily disable access to the platform for all non-admin users.</p>
              </div>
              <div className="relative inline-flex items-center">
                <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                <div className={`w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${activeTheme.peerCheckedBg}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-white font-medium">Allow New Registrations</p>
                <p className="text-sm text-zinc-500">Enable or disable new user sign-ups.</p>
              </div>
              <div className="relative inline-flex items-center">
                <input type="checkbox" name="allowRegistration" checked={settings.allowRegistration} onChange={handleChange} className="sr-only peer" />
                <div className={`w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${activeTheme.peerCheckedBg}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-white font-medium">Require Email Verification</p>
                <p className="text-sm text-zinc-500">Users must verify their email before accessing the platform.</p>
              </div>
              <div className="relative inline-flex items-center">
                <input type="checkbox" name="requireEmailVerification" checked={settings.requireEmailVerification} onChange={handleChange} className="sr-only peer" />
                <div className={`w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${activeTheme.peerCheckedBg}`}></div>
              </div>
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-zinc-800/50">
            <Sun className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-white">Appearance</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Default Theme for New Users</label>
            <div className="flex space-x-4">
              <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-colors ${settings.defaultTheme === 'dark' ? `${activeTheme.border} ${activeTheme.bgSubtle}` : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                <input type="radio" name="defaultTheme" value="dark" checked={settings.defaultTheme === 'dark'} onChange={handleChange} className="sr-only" />
                <Moon className={`w-5 h-5 mr-2 ${settings.defaultTheme === 'dark' ? activeTheme.text : 'text-zinc-300'}`} />
                <span className={`${settings.defaultTheme === 'dark' ? activeTheme.text : 'text-zinc-300'} font-medium`}>Dark Mode</span>
              </label>
              <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-colors ${settings.defaultTheme === 'light' ? `${activeTheme.border} ${activeTheme.bgSubtle}` : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                <input type="radio" name="defaultTheme" value="light" checked={settings.defaultTheme === 'light'} onChange={handleChange} className="sr-only" />
                <Sun className={`w-5 h-5 mr-2 ${settings.defaultTheme === 'light' ? activeTheme.text : 'text-zinc-300'}`} />
                <span className={`${settings.defaultTheme === 'light' ? activeTheme.text : 'text-zinc-300'} font-medium`}>Light Mode</span>
              </label>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800/50">
            <label className="block text-sm font-bold text-white mb-4">Accent color</label>
            <div className="flex flex-wrap gap-6">
              {accentColors.map((color) => (
                <div key={color.name} className="flex flex-col items-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, accentColor: color.name }))}
                    className={`w-12 h-12 rounded-full ${color.class} transition-all relative flex items-center justify-center hover:scale-105`}
                    title={color.name}
                  >
                    {settings.accentColor === color.name && (
                      <span className={`absolute inset-[-4px] border-2 border-white rounded-full ${colorMap[color.name].shadow}`}></span>
                    )}
                  </button>
                  <span className={`text-xs ${settings.accentColor === color.name ? 'text-white font-medium' : 'text-zinc-500'}`}>
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className={`flex items-center px-6 py-2.5 ${activeTheme.bg} hover:opacity-90 text-white font-medium rounded-xl transition-colors disabled:opacity-50`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
