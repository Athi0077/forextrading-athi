import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function TradeModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    pair: 'EUR/USD',
    type: 'BUY',
    entryPrice: '',
    exitPrice: '',
    lotSize: '1.00',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    status: 'OPEN'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        pair: initialData.pair,
        type: initialData.type,
        entryPrice: initialData.entryPrice,
        exitPrice: initialData.exitPrice || '',
        lotSize: initialData.lotSize,
        stopLoss: initialData.stopLoss || '',
        takeProfit: initialData.takeProfit || '',
        notes: initialData.notes || '',
        status: initialData.status
      });
    } else {
      setFormData({
        pair: 'EUR/USD',
        type: 'BUY',
        entryPrice: '',
        exitPrice: '',
        lotSize: '1.00',
        stopLoss: '',
        takeProfit: '',
        notes: '',
        status: 'OPEN'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = { ...formData };
    
    // Sanitize numerical fields for Mongoose validation
    ['entryPrice', 'exitPrice', 'stopLoss', 'takeProfit', 'lotSize'].forEach(field => {
      if (payload[field] === '') {
        delete payload[field]; // Remove empty strings so Mongoose defaults or ignores them
      } else {
        payload[field] = Number(payload[field]);
      }
    });

    onSubmit(payload);
  };

  const calcRiskReward = () => {
    const ep = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit);
    const lot = parseFloat(formData.lotSize);
    
    if (isNaN(ep) || isNaN(sl) || isNaN(tp) || isNaN(lot)) return { risk: 0, reward: 0, rr: '0.0' };
    
    const multiplier = formData.pair.includes('JPY') ? 1000 : 100000;
    const riskDiff = Math.abs(ep - sl);
    const rewardDiff = Math.abs(tp - ep);
    
    const risk = riskDiff * multiplier * lot;
    const reward = rewardDiff * multiplier * lot;
    const rr = riskDiff > 0 ? (rewardDiff / riskDiff).toFixed(2) : '0.0';
    
    return { risk, reward, rr };
  };

  const { risk, reward, rr } = calcRiskReward();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-surface border border-brand-border/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-brand-border">
          <h3 className="text-lg font-bold text-brand-text">{initialData ? 'Edit Trade' : 'Add New Trade'}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-brand-muted mb-1">Currency Pair</label>
              <input required type="text" value={formData.pair} onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" placeholder="e.g. EUR/USD" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none">
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-brand-muted mb-1">Entry Price</label>
              <input required type="number" step="any" value={formData.entryPrice} onChange={e => setFormData({...formData, entryPrice: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1">Stop Loss</label>
              <input type="number" step="any" value={formData.stopLoss} onChange={e => setFormData({...formData, stopLoss: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1">Take Profit</label>
              <input type="number" step="any" value={formData.takeProfit} onChange={e => setFormData({...formData, takeProfit: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-brand-muted mb-1">Lot Size</label>
              <input required type="number" step="any" value={formData.lotSize} onChange={e => setFormData({...formData, lotSize: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1">Exit Price (Optional)</label>
              <input type="number" step="any" value={formData.exitPrice} onChange={e => setFormData({...formData, exitPrice: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" placeholder="Closes trade if set" />
            </div>
          </div>
          
          <div className="bg-brand-surface border border-brand-border rounded-lg p-3 flex justify-between items-center text-sm">
            <div>
              <span className="text-brand-muted opacity-80 text-xs block">Risk</span>
              <span className="text-red-400 font-semibold">${risk.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-brand-muted opacity-80 text-xs block">Reward</span>
              <span className="text-green-400 font-semibold">${reward.toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-brand-muted opacity-80 text-xs block">Risk/Reward</span>
              <span className="text-brand-text font-bold">1:{rr}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-brand-muted mb-1">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows="2" className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none"></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-brand-text transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 transition-opacity">
              {initialData ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
