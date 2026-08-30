const Setting = require('../../models/Setting');

// Default initial settings
const defaultSettings = {
  siteName: 'Liquiva Platform',
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: false,
  defaultTheme: 'dark',
  accentColor: 'Red',
  systemEmail: 'admin@forextrading.com'
};

const getSettings = async (req, res) => {
  try {
    const settingsDocs = await Setting.find({});
    let settings = {};
    
    // If no settings exist in DB, use defaults
    if (settingsDocs.length === 0) {
      settings = { ...defaultSettings };
      // Pre-populate DB with defaults
      const promises = Object.keys(settings).map(key => 
        Setting.create({ key, value: settings[key] })
      );
      await Promise.all(promises);
    } else {
      // Convert array of docs to object
      settingsDocs.forEach(doc => {
        settings[doc.key] = doc.value;
      });
      // Merge with defaults to ensure all keys exist
      settings = { ...defaultSettings, ...settings };
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: { message: 'Server error fetching settings' } });
  }
};

const updateSettings = async (req, res) => {
  try {
    const newSettings = req.body;
    const promises = Object.keys(newSettings).map(key => 
      Setting.findOneAndUpdate(
        { key },
        { value: newSettings[key] },
        { upsert: true, new: true }
      )
    );
    
    await Promise.all(promises);
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: { message: 'Server error updating settings' } });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
