import { X } from 'lucide-react';

export default function AnnouncementModal({ announcements, onClose }) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-6 border-b border-brand-border bg-brand-elevated/30">
          <h2 className="text-xl font-bold text-brand-text flex items-center">
            <span className="w-2 h-2 rounded-full bg-brand-accent mr-3 animate-pulse"></span>
            Announcements
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-brand-muted hover:text-brand-text hover:bg-brand-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-6">
          {announcements.map((ann, idx) => (
            <div key={ann._id} className={idx !== 0 ? "pt-6 border-t border-brand-border" : ""}>
              <h3 className="font-semibold text-lg text-brand-text mb-2">{ann.title}</h3>
              <div className="text-brand-muted whitespace-pre-wrap leading-relaxed">
                {ann.content}
              </div>
              <p className="text-xs text-brand-muted/50 mt-4">
                {new Date(ann.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-brand-border bg-brand-elevated/20 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-brand-accent text-white font-medium rounded-lg hover:bg-brand-accent/90 transition-colors shadow-lg shadow-brand-accent/20"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
