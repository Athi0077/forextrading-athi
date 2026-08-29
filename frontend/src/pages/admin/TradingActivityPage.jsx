import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import { Search, RefreshCw, Layers, TrendingUp, TrendingDown, ArrowRight, X } from 'lucide-react';

export default function TradingActivityPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userSummary, setUserSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await apiCall('/admin/trades', { method: 'GET' });
      setTrades(res.data);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSummary = async (userId) => {
    try {
      setLoadingSummary(true);
      setSelectedUserId(userId);
      const res = await apiCall(`/admin/users/${userId}/trades`, { method: 'GET' });
      setUserSummary(res.data);
    } catch (error) {
      console.error('Failed to fetch user summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const closeModal = () => {
    setSelectedUserId(null);
    setUserSummary(null);
  };

  const filteredTrades = trades.filter(t => 
    t.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trading Activity</h1>
          <p className="text-zinc-400 text-sm mt-1">Monitor all user trades across the platform.</p>
        </div>
        
        <div className="relative w-full sm:w-64 flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search user or pair..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            />
          </div>
          <button onClick={fetchTrades} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
            <RefreshCw className={`h-5 w-5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-900/50 text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Pair & Type</th>
                <th className="px-6 py-4 font-semibold">Entry → Exit</th>
                <th className="px-6 py-4 font-semibold">Lot Size</th>
                <th className="px-6 py-4 font-semibold text-right">Profit / Loss</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading trades...
                  </td>
                </tr>
              ) : filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">
                    No trades found.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => (
                  <tr key={trade._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => fetchUserSummary(trade.userId?._id)}>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {trade.userId?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="text-white font-medium hover:text-red-400 transition-colors">{trade.userId?.name || 'Unknown'}</div>
                          <div className="text-zinc-500 text-xs">{new Date(trade.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{trade.pair}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {trade.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-zinc-300">
                      <div className="flex items-center space-x-1">
                        <span>{trade.entryPrice.toFixed(4)}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-600" />
                        <span>{trade.exitPrice ? trade.exitPrice.toFixed(4) : '--'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trade.lotSize}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`font-bold ${trade.pnl > 0 ? 'text-green-500' : trade.pnl < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                        {trade.pnl > 0 ? '+' : ''}{trade.pnl ? trade.pnl.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.status === 'CLOSED' ? 'bg-zinc-800 text-zinc-300' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Summary Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">User Trade Summary</h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingSummary ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
                </div>
              ) : userSummary ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Total Trades</p>
                    <p className="text-xl font-bold text-white">{userSummary.totalTrades}</p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Win Rate</p>
                    <p className="text-xl font-bold text-white">{userSummary.winRate?.toFixed(1)}%</p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Net P/L</p>
                    <p className={`text-xl font-bold ${userSummary.netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${userSummary.netPnl?.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Open Trades</p>
                    <p className="text-xl font-bold text-blue-400">{userSummary.openTrades}</p>
                  </div>
                  
                  <div className="col-span-2 bg-green-500/5 p-4 rounded-xl border border-green-500/20">
                    <p className="text-xs text-green-500/70 mb-1">Winning Trades & Total Profit</p>
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-bold text-green-500">{userSummary.winningTrades}</p>
                      <p className="text-lg font-medium text-green-400">+${userSummary.totalProfit?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-2 bg-red-500/5 p-4 rounded-xl border border-red-500/20">
                    <p className="text-xs text-red-500/70 mb-1">Losing Trades & Total Loss</p>
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-bold text-red-500">{userSummary.losingTrades}</p>
                      <p className="text-lg font-medium text-red-400">-${Math.abs(userSummary.totalLoss || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-12">Failed to load summary.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
