import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import { Plus, Trash2, Edit3, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await apiCall('/admin/announcements');
      setAnnouncements(res.data || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSaving(true);
      if (editingId) {
        const res = await apiCall(`/admin/announcements/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ title, content, isPublished })
        });
        setAnnouncements(announcements.map(a => a._id === editingId ? res.data : a));
      } else {
        const res = await apiCall('/admin/announcements', {
          method: 'POST',
          body: JSON.stringify({ title, content, isPublished })
        });
        setAnnouncements([res.data, ...announcements]);
      }
      handleCancelEdit();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      alert('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement._id);
    setTitle(announcement.title);
    setContent(announcement.content);
    setIsPublished(announcement.isPublished);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsPublished(true);
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const res = await apiCall(`/admin/announcements/${id}/toggle`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: !currentStatus })
      });
      setAnnouncements(announcements.map(a => a._id === id ? res.data : a));
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await apiCall(`/admin/announcements/${id}`, {
        method: 'DELETE'
      });
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-text">Announcements Management</h1>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-text">
            {editingId ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          {editingId && (
            <button 
              onClick={handleCancelEdit}
              className="text-sm text-brand-muted hover:text-brand-text transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-brand-base border border-brand-border rounded-lg px-4 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              placeholder="e.g., Scheduled Maintenance"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1">Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-brand-base border border-brand-border rounded-lg px-4 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent/50 min-h-[100px]"
              placeholder="Type your announcement message here..."
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded bg-brand-base border-brand-border text-brand-accent focus:ring-brand-accent"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-brand-text">
              Publish immediately
            </label>
          </div>
          <button
            type="submit"
            disabled={saving || !title.trim() || !content.trim()}
            className="flex items-center px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (editingId ? <Edit3 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />)}
            {editingId ? 'Update Announcement' : 'Save Announcement'}
          </button>
        </form>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border">
          <h2 className="text-lg font-semibold text-brand-text">All Announcements</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-brand-muted">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center text-brand-muted">No announcements found.</div>
        ) : (
          <div className="divide-y divide-brand-border">
            {announcements.map((ann) => (
              <div key={ann._id} className="p-6 flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-semibold text-brand-text">{ann.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${ann.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-zinc-500/10 text-zinc-400'}`}>
                      {ann.isPublished ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted whitespace-pre-wrap mt-2">{ann.content}</p>
                  <p className="text-xs text-brand-muted/70 mt-3">
                    Created: {new Date(ann.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(ann)}
                    className="p-2 text-brand-muted hover:text-brand-accent rounded-lg hover:bg-brand-accent/10 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleTogglePublish(ann._id, ann.isPublished)}
                    className="p-2 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-elevated transition-colors"
                    title={ann.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {ann.isPublished ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-2 text-red-500/70 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
