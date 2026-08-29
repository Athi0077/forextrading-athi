import { useState, useEffect } from 'react';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Edit2, Trash2, X, Check } from 'lucide-react';
import { getTrades, createTrade, updateTrade, deleteTrade } from '../services/tradeService';

export default function TradeJournalPage() {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTrade, setCurrentTrade] = useState(null); // null = add, object = edit

  // Form state
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

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      const data = await getTrades();
      setTrades(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleOpenModal = (trade = null) => {
    if (trade) {
      setCurrentTrade(trade);
      setFormData({
        pair: trade.pair,
        type: trade.type,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice || '',
        lotSize: trade.lotSize,
        stopLoss: trade.stopLoss || '',
        takeProfit: trade.takeProfit || '',
        notes: trade.notes || '',
        status: trade.status
      });
    } else {
      setCurrentTrade(null);
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
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // Auto-set date if marking as closed
      if (payload.exitPrice && payload.status === 'OPEN') {
        payload.exitDate = new Date();
      }

      if (currentTrade) {
        await updateTrade(currentTrade._id, payload);
      } else {
        await createTrade(payload);
      }
      setIsModalOpen(false);
      fetchTrades();
    } catch (err) {
      console.error(err);
      alert('Failed to save trade.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      try {
        await deleteTrade(id);
        fetchTrades();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCloseTrade = async (trade) => {
    const exitPrice = prompt(`Enter exit price for ${trade.pair}:`);
    if (exitPrice) {
      try {
        await updateTrade(trade._id, { 
          exitPrice: parseFloat(exitPrice), 
          exitDate: new Date(),
          status: 'CLOSED'
        });
        fetchTrades();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredTrades = trades.filter(t => t.pair.toLowerCase().includes(searchQuery.toLowerCase()));
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  
  const totalTrades = closedTrades.length;
  const totalPnL = closedTrades.reduce((acc, t) => acc + t.pnl, 0);
  const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
  const losingTrades = closedTrades.filter(t => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // Real-time risk/reward calculation for modal
  const calcRiskReward = () => {
    const ep = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit);
    const lot = parseFloat(formData.lotSize);
    
    if (isNaN(ep) || isNaN(sl) || isNaN(tp) || isNaN(lot)) return { risk: 0, reward: 0, rr: '0.0' };
    
    const pipValue = 10;
    const riskDiff = Math.abs(ep - sl);
    const rewardDiff = Math.abs(tp - ep);
    
    const risk = riskDiff * pipValue * lot * 10;
    const reward = rewardDiff * pipValue * lot * 10;
    const rr = riskDiff > 0 ? (rewardDiff / riskDiff).toFixed(2) : '0.0';
    
    return { risk, reward, rr };
  };
  const { risk, reward, rr } = calcRiskReward();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-zinc-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade Journal</h1>
          <p className="text-sm text-zinc-500 mt-1">Record and review your market executions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search pair..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#18181b] border border-zinc-800/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple/50 text-white"
            />
          </div>
          <button className="p-2 bg-[#18181b] border border-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
            <Filter className="w-5 h-5 text-zinc-400" />
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-pink text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Trade
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Trades</p>
          <p className="text-xl font-bold text-white">{totalTrades}</p>
        </div>
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Win Rate</p>
          <p className="text-xl font-bold text-white">{winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Winning Trades</p>
          <p className="text-xl font-bold text-green-400">{winningTrades}</p>
        </div>
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Losing Trades</p>
          <p className="text-xl font-bold text-red-400">{losingTrades}</p>
        </div>
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Total P/L</p>
          <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${totalPnL.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Trade Table */}
      <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#121214] text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Pair</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Entry</th>
                <th className="px-6 py-4 font-medium">Exit</th>
                <th className="px-6 py-4 font-medium">Size</th>
                <th className="px-6 py-4 font-medium">P/L</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-zinc-500">Loading trades...</td>
                </tr>
              ) : filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-zinc-500">
                    <p>No trades found.</p>
                    <button onClick={() => handleOpenModal()} className="mt-4 text-brand-purple hover:underline">Add your first trade</button>
                  </td>
                </tr>
              ) : (
                filteredTrades.map(trade => (
                  <tr key={trade._id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{trade.pair}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{trade.entryPrice}</td>
                    <td className="px-6 py-4 font-mono text-zinc-400">{trade.exitPrice || '--'}</td>
                    <td className="px-6 py-4">{trade.lotSize}</td>
                    <td className="px-6 py-4">
                      {trade.status === 'CLOSED' ? (
                        <span className={`font-bold flex items-center ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.pnl >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          ${trade.pnl.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-zinc-500">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${trade.status === 'OPEN' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-zinc-800 text-zinc-400'}`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {trade.status === 'OPEN' && (
                        <button onClick={() => handleCloseTrade(trade)} className="p-1.5 text-zinc-400 hover:text-green-400 bg-zinc-800/50 rounded-lg transition-colors" title="Close Trade">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleOpenModal(trade)} className="p-1.5 text-zinc-400 hover:text-brand-purple bg-zinc-800/50 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(trade._id)} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800/50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
              <h3 className="text-lg font-bold text-white">{currentTrade ? 'Edit Trade' : 'Add New Trade'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Currency Pair</label>
                  <input required type="text" value={formData.pair} onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})} className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple focus:outline-none" placeholder="e.g. EUR/USD" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple focus:outline-none">
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Entry Price</label>
                  <input required type="number" step="0.00001" value={formData.entryPrice} onChange={e => setFormData({...formData, entryPrice: e.target.value})} className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Stop Loss</label>
                  <input type="number" step="0.00001" value={formData.stopLoss} onChange={e => setFormData({...formData, stopLoss: e.target.value})} className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Take Profit</label>
                  <input type="number" step="0.00001" value={formData.takeProfit} onChange={e => setFormData({...formData, takeProfit: e.target.value})} className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Lot Size</label>
                  <input required type="number" step="0.01" value={formData.lotSize} onChange={e => setFormData({...formData, lotSize: e.target.value})} className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Exit Price (Optional)</label>
                  <input type="number" step="0.00001" value={formData.exitPrice} onChange={e => setFormData({...formData, exitPrice: e.target.value})} className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple focus:outline-none" placeholder="Closes trade if set" />
                </div>
              </div>
              
              <div className="bg-[#121214] border border-zinc-800/50 rounded-lg p-3 flex justify-between items-center text-sm">
                <div>
                  <span className="text-zinc-500 text-xs block">Risk</span>
                  <span className="text-red-400 font-semibold">${risk.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block">Reward</span>
                  <span className="text-green-400 font-semibold">${reward.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 text-xs block">Risk/Reward</span>
                  <span className="text-white font-bold">1:{rr}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows="2" className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple focus:outline-none"></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800/50 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 transition-opacity">
                  {currentTrade ? 'Update Trade' : 'Save Trade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
