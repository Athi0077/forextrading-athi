import { useState } from 'react';
import { X } from 'lucide-react';

export default function CloseTradeModal({ isOpen, onClose, onSubmit, trade }) {
  const [exitPrice, setExitPrice] = useState('');
  
  if (!isOpen || !trade) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exitPrice) return;
    onSubmit(trade._id, {
      exitPrice: parseFloat(exitPrice),
      exitDate: new Date()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
          <h3 className="text-lg font-bold text-white">Close Trade</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <p className="text-sm text-zinc-400 mb-4">
              Closing <span className="font-bold text-white">{trade.type} {trade.lotSize} {trade.pair}</span> (Entry: {trade.entryPrice})
            </p>
            <label className="block text-xs text-zinc-400 mb-1">Exit Price</label>
            <input 
              required 
              type="number" 
              step="any"
              value={exitPrice} 
              onChange={e => setExitPrice(e.target.value)} 
              className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple focus:outline-none" 
              placeholder="Enter closing price..." 
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800/50 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-brand-darker bg-brand-gold hover:bg-brand-goldHover transition-colors">
              Confirm Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
