import { useState } from 'react';
import { Save, Bell, Shield, Globe, Database, Moon, Sun } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'ForexTrading Platform',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    defaultTheme: 'dark',
    accentColor: 'Red',
    systemEmail: 'admin@forextrading.com',
  });

  const accentColors = [
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Green', class: 'bg-green-500' },
    { name: 'Yellow', class: 'bg-yellow-500' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Red', class: 'bg-red-500' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Violet', class: 'bg-violet-500' },
    { name: 'Cyan', class: 'bg-cyan-500' },
    { name: 'Coral', class: 'bg-rose-400' },
  ];

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
    // Simulate API save
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully!');
    }, 800);
  };

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
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">System Email Address</label>
              <input
                type="email"
                name="systemEmail"
                value={settings.systemEmail}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
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
                <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-white font-medium">Allow New Registrations</p>
                <p className="text-sm text-zinc-500">Enable or disable new user sign-ups.</p>
              </div>
              <div className="relative inline-flex items-center">
                <input type="checkbox" name="allowRegistration" checked={settings.allowRegistration} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-white font-medium">Require Email Verification</p>
                <p className="text-sm text-zinc-500">Users must verify their email before accessing the platform.</p>
              </div>
              <div className="relative inline-flex items-center">
                <input type="checkbox" name="requireEmailVerification" checked={settings.requireEmailVerification} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
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
              <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-colors ${settings.defaultTheme === 'dark' ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                <input type="radio" name="defaultTheme" value="dark" checked={settings.defaultTheme === 'dark'} onChange={handleChange} className="sr-only" />
                <Moon className="w-5 h-5 text-zinc-300 mr-2" />
                <span className="text-zinc-300 font-medium">Dark Mode</span>
              </label>
              <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-colors ${settings.defaultTheme === 'light' ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                <input type="radio" name="defaultTheme" value="light" checked={settings.defaultTheme === 'light'} onChange={handleChange} className="sr-only" />
                <Sun className="w-5 h-5 text-zinc-300 mr-2" />
                <span className="text-zinc-300 font-medium">Light Mode</span>
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
                      <span className="absolute inset-[-4px] border-2 border-white rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
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
            className="flex items-center px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
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
