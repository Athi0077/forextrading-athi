const Announcement = require('../models/Announcement');

// Get all active announcements (for users)
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active announcements' });
  }
};
