import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Eye, Bell, Plus, Trash2, CheckCircle, Activity, ChevronRight, X, TrendingUp, TrendingDown } from 'lucide-react';
import { getWatchlist, updateWatchlist, getAlerts, createAlert, updateAlert, deleteAlert } from '../services/toolsService';
import socketClient from '../services/socketClient';

export default function TradingToolsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('RISK'); // RISK, WATCHLIST, ALERTS
  
  // Data States
  const [watchlistPairs, setWatchlistPairs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [liveData, setLiveData] = useState({});
  const [notifications, setNotifications] = useState([]);
  
  // Risk Calc State
  const [riskData, setRiskData] = useState({
    balance: '1000',
    riskPercent: '1',
    pair: 'EUR/USD',
    entry: '',
    sl: '',
    tp: ''
  });

  // Modals
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({ pair: 'EUR/USD', condition: 'ABOVE', targetPrice: '' });
  
  // Init
  useEffect(() => {
    const fetchToolsData = async () => {
      try {
        const [wlData, alData] = await Promise.all([
          getWatchlist(),
          getAlerts()
        ]);
        setWatchlistPairs(wlData?.pairs || []);
        setAlerts(alData || []);
      } catch (error) {
        console.error("Failed to load tools data", error);
      }
    };
    fetchToolsData();
  }, []);

  // Socket
  useEffect(() => {
    const cleanup = socketClient.onPriceUpdate((data) => {
      if (data && data.symbol) {
        setLiveData(prev => {
          const newData = { ...prev };
          newData[data.symbol] = {
            price: data.price,
            change: data.change || 0,
            changePercent: data.changePercent || 0
          };
          return newData;
        });

        // Check Alerts
        setAlerts(prevAlerts => {
          let updated = false;
          const newAlerts = prevAlerts.map(alert => {
            if (alert.status === 'ACTIVE' && alert.pair === data.symbol) {
              const hit = alert.condition === 'ABOVE' ? data.price >= alert.targetPrice : data.price <= alert.targetPrice;
              if (hit) {
                updated = true;
                handleAlertTrigger(alert._id, alert.pair, alert.condition, alert.targetPrice);
                return { ...alert, status: 'TRIGGERED', triggeredAt: new Date() };
              }
            }
            return alert;
          });
          return updated ? newAlerts : prevAlerts;
        });
      }
    });

    return () => cleanup();
  }, []);

  const handleAlertTrigger = async (id, pair, condition, targetPrice) => {
    // Show toast
    setNotifications(prev => [...prev, { id: Date.now(), msg: `ALERT TRIGGERED: ${pair} went ${condition} ${targetPrice}` }]);
    // Hide toast after 5s
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
    
    // Update DB
    try {
      await updateAlert(id, { status: 'TRIGGERED', triggeredAt: new Date() });
    } catch (err) {
      console.error(err);
    }
  };

  // Watchlist Handlers
  const [newWlPair, setNewWlPair] = useState('');
  const handleAddWatchlist = async (e) => {
    e.preventDefault();
    if (!newWlPair) return;
    const pair = newWlPair.toUpperCase();
    if (watchlistPairs.includes(pair)) return setNewWlPair('');
    
    try {
      const updatedPairs = [...watchlistPairs, pair];
      await updateWatchlist(updatedPairs);
      setWatchlistPairs(updatedPairs);
      setNewWlPair('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveWatchlist = async (pair) => {
    try {
      const updatedPairs = watchlistPairs.filter(p => p !== pair);
      await updateWatchlist(updatedPairs);
      setWatchlistPairs(updatedPairs);
    } catch (err) {
      console.error(err);
    }
  };

  // Alert Handlers
  const handleSaveAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await createAlert(alertForm);
      setAlerts([res, ...alerts]);
      setIsAlertModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts(alerts.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Risk Calculations
  const calculateRisk = () => {
    const bal = parseFloat(riskData.balance);
    const riskP = parseFloat(riskData.riskPercent);
    const en = parseFloat(riskData.entry);
    const sl = parseFloat(riskData.sl);
    const tp = parseFloat(riskData.tp);

    if (isNaN(bal) || isNaN(riskP) || isNaN(en) || isNaN(sl)) {
      return { riskAmt: 0, rewardAmt: 0, rr: '0.00', lotSize: 0, slPips: 0 };
    }

    const riskAmt = bal * (riskP / 100);
    const riskDiff = Math.abs(en - sl);
    const pipValue = 10; // Assumption for standard lots
    const slPips = riskDiff * 10000; // Roughly 
    const lotSize = (riskAmt / (riskDiff * pipValue * 10)).toFixed(2);
    
    let rewardAmt = 0;
    let rr = '0.00';
    if (!isNaN(tp)) {
      const rewardDiff = Math.abs(tp - en);
      rewardAmt = rewardDiff * pipValue * parseFloat(lotSize) * 10;
      if (riskDiff > 0) rr = (rewardDiff / riskDiff).toFixed(2);
    }

    return { riskAmt, rewardAmt, rr, lotSize, slPips: riskDiff.toFixed(5) };
  };

  const riskRes = calculateRisk();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-brand-text relative">
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(n => (
          <div key={n.id} className="bg-brand-elevated border-l-4 border-brand-pink p-4 rounded-lg shadow-2xl flex items-center shadow-brand-pink/20">
            <Bell className="w-5 h-5 text-brand-pink mr-3 animate-bounce" />
            <span className="font-bold text-brand-text">{n.msg}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Trading Tools</h1>
        <p className="text-sm text-brand-muted opacity-80 mt-1">Plan your trades, track important pairs and manage price alerts.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-brand-surface border border-brand-border p-1 rounded-xl w-full max-w-md">
        <button onClick={() => setActiveTab('RISK')} className={`flex-1 py-2 text-sm font-medium flex items-center justify-center rounded-lg transition-all ${activeTab === 'RISK' ? 'bg-brand-elevated text-brand-text shadow' : 'text-brand-muted opacity-80 hover:text-brand-text'}`}>
          <Calculator className="w-4 h-4 mr-2" /> Calculator
        </button>
        <button onClick={() => setActiveTab('WATCHLIST')} className={`flex-1 py-2 text-sm font-medium flex items-center justify-center rounded-lg transition-all ${activeTab === 'WATCHLIST' ? 'bg-brand-elevated text-brand-text shadow' : 'text-brand-muted opacity-80 hover:text-brand-text'}`}>
          <Eye className="w-4 h-4 mr-2" /> Watchlist
        </button>
        <button onClick={() => setActiveTab('ALERTS')} className={`flex-1 py-2 text-sm font-medium flex items-center justify-center rounded-lg transition-all ${activeTab === 'ALERTS' ? 'bg-brand-elevated text-brand-text shadow' : 'text-brand-muted opacity-80 hover:text-brand-text'}`}>
          <Bell className="w-4 h-4 mr-2" /> Alerts
        </button>
      </div>

      <div className="bg-[#0c0c0e] border border-brand-border rounded-2xl p-6 min-h-[500px]">
        
        {/* RISK CALCULATOR */}
        {activeTab === 'RISK' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="font-bold text-brand-text flex items-center border-b border-brand-border pb-3">
                <Calculator className="w-4 h-4 mr-2 text-brand-purple" /> Risk Parameters
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-brand-muted opacity-80 mb-1">Account Balance ($)</label>
                  <input type="number" value={riskData.balance} onChange={e => setRiskData({...riskData, balance: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-brand-muted opacity-80 mb-1">Risk %</label>
                  <input type="number" step="0.1" value={riskData.riskPercent} onChange={e => setRiskData({...riskData, riskPercent: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-brand-muted opacity-80 mb-1">Currency Pair</label>
                  <input type="text" value={riskData.pair} onChange={e => setRiskData({...riskData, pair: e.target.value.toUpperCase()})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-brand-muted opacity-80 mb-1">Entry Price</label>
                  <input type="number" step="0.00001" value={riskData.entry} onChange={e => setRiskData({...riskData, entry: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-brand-muted opacity-80 mb-1">Stop Loss</label>
                  <input type="number" step="0.00001" value={riskData.sl} onChange={e => setRiskData({...riskData, sl: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none focus:border-red-500/50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-brand-muted opacity-80 mb-1">Take Profit (Optional)</label>
                  <input type="number" step="0.00001" value={riskData.tp} onChange={e => setRiskData({...riskData, tp: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none focus:border-green-500/50" />
                </div>
              </div>
            </div>

            <div>
               <h3 className="font-bold text-brand-text flex items-center border-b border-brand-border pb-3 mb-5">
                <Activity className="w-4 h-4 mr-2 text-brand-pink" /> Calculation Results
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
                  <p className="text-xs text-brand-muted opacity-80 mb-1">Risk Amount</p>
                  <p className="text-2xl font-bold text-red-400">${riskRes.riskAmt.toFixed(2)}</p>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
                  <p className="text-xs text-brand-muted opacity-80 mb-1">Potential Reward</p>
                  <p className="text-2xl font-bold text-green-400">${riskRes.rewardAmt.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="bg-brand-elevated border border-brand-border rounded-xl p-5 text-center mb-6 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 to-brand-pink/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <p className="text-xs text-brand-muted opacity-80 mb-1 uppercase tracking-wider font-semibold">Suggested Lot Size</p>
                 <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">
                   {isFinite(riskRes.lotSize) && riskRes.lotSize > 0 ? riskRes.lotSize : '0.00'}
                 </p>
                 <div className="flex justify-between mt-4 px-8 text-sm font-medium">
                   <div className="text-brand-muted">SL Dist: <span className="text-brand-text">{riskRes.slPips}</span></div>
                   <div className="text-brand-muted">R/R: <span className="text-brand-text">1 : {riskRes.rr}</span></div>
                 </div>
              </div>

              <button 
                onClick={() => navigate('/journal', { state: { prefill: riskData } })}
                className="w-full py-3 bg-brand-elevated hover:bg-brand-elevated border border-brand-border/80 rounded-xl font-bold text-brand-text transition-colors flex items-center justify-center"
              >
                Add Trade to Journal <ChevronRight className="w-4 h-4 ml-2" />
              </button>
              <p className="text-xs text-zinc-600 text-center mt-2">* Calculations are estimates based on standard pip values.</p>
            </div>
          </div>
        )}

        {/* WATCHLIST */}
        {activeTab === 'WATCHLIST' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
              <form onSubmit={handleAddWatchlist} className="flex space-x-2">
                <input required type="text" value={newWlPair} onChange={e=>setNewWlPair(e.target.value)} placeholder="e.g. GBP/JPY" className="bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none uppercase w-48" />
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-pink text-brand-text text-sm font-semibold rounded-lg hover:opacity-90">Add Pair</button>
              </form>
            </div>
            
            {watchlistPairs.length === 0 ? (
              <div className="text-center py-16 border border-brand-border rounded-2xl bg-brand-surface">
                <Eye className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-brand-text mb-2">Your watchlist is empty</h3>
                <p className="text-brand-muted opacity-80 text-sm">Add your favorite Forex pairs to monitor them quickly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlistPairs.map(pair => {
                  const data = liveData[pair] || { price: 0, change: 0, changePercent: 0 };
                  const isUp = data.change >= 0;
                  return (
                    <div key={pair} className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-purple/30 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-brand-text text-lg">{pair}</h4>
                        <div className="flex space-x-2">
                          <button onClick={() => navigate('/analysis')} className="text-xs text-brand-purple hover:underline">Chart</button>
                          <button onClick={() => handleRemoveWatchlist(pair)} className="text-zinc-600 hover:text-red-400"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-2xl font-black text-brand-text">
                          {data.price > 0 ? data.price.toFixed(5) : '--'}
                        </p>
                        <div className={`flex flex-col items-end text-sm font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                          <span className="flex items-center">
                            {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {data.change > 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PRICE ALERTS */}
        {activeTab === 'ALERTS' && (
          <div>
            <div className="flex justify-between mb-6">
              <h3 className="font-bold text-brand-text flex items-center">
                <Bell className="w-4 h-4 mr-2 text-brand-pink" /> Active Alerts
              </h3>
              <button onClick={() => setIsAlertModalOpen(true)} className="px-4 py-2 bg-brand-elevated border border-brand-border rounded-lg text-sm font-medium hover:bg-brand-elevated transition-colors flex items-center">
                <Plus className="w-4 h-4 mr-2" /> Create Alert
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-16 border border-brand-border rounded-2xl bg-brand-surface">
                <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-brand-text mb-2">You're not tracking any price alerts yet.</h3>
                <button onClick={() => setIsAlertModalOpen(true)} className="mt-4 text-brand-pink hover:underline text-sm font-semibold">Create Your First Alert</button>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => {
                  const currentPrice = liveData[alert.pair]?.price;
                  const distance = currentPrice ? Math.abs(alert.targetPrice - currentPrice).toFixed(4) : '--';
                  
                  return (
                    <div key={alert._id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${alert.status === 'TRIGGERED' ? 'bg-brand-pink/5 border-brand-pink/20' : 'bg-brand-surface border-brand-border'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.status === 'TRIGGERED' ? 'bg-brand-pink/20 text-brand-pink' : 'bg-brand-elevated text-brand-muted'}`}>
                          {alert.status === 'TRIGGERED' ? <CheckCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-text">{alert.pair}</h4>
                          <p className="text-xs text-brand-muted">
                            {alert.condition} <span className="text-brand-text font-mono">{alert.targetPrice}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 sm:mt-0 flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-xs text-brand-muted opacity-80">Current</p>
                          <p className="text-sm font-mono text-brand-text">{currentPrice || '--'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-brand-muted opacity-80">Distance</p>
                          <p className="text-sm font-mono text-brand-text">{distance}</p>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${alert.status === 'TRIGGERED' ? 'bg-brand-pink text-brand-text' : 'bg-brand-elevated text-brand-muted'}`}>
                            {alert.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleDeleteAlert(alert._id)} className="p-2 bg-brand-elevated border border-brand-border rounded-lg hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE ALERT MODAL */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0c0c0e] border border-brand-border/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-brand-border">
              <h3 className="text-lg font-bold text-brand-text flex items-center"><Bell className="w-4 h-4 mr-2 text-brand-pink" /> Create Alert</h3>
              <button onClick={() => setIsAlertModalOpen(false)} className="text-brand-muted hover:text-brand-text"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveAlert} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-brand-muted mb-1">Currency Pair</label>
                <input required type="text" value={alertForm.pair} onChange={e => setAlertForm({...alertForm, pair: e.target.value.toUpperCase()})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-brand-muted mb-1">Condition</label>
                <select value={alertForm.condition} onChange={e => setAlertForm({...alertForm, condition: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none">
                  <option value="ABOVE">Price Rises Above</option>
                  <option value="BELOW">Price Drops Below</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-brand-muted mb-1">Target Price</label>
                <input required type="number" step="0.00001" value={alertForm.targetPrice} onChange={e => setAlertForm({...alertForm, targetPrice: e.target.value})} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-purple focus:outline-none" />
              </div>

              {liveData[alertForm.pair]?.price && alertForm.targetPrice && (
                <div className="bg-brand-surface p-3 rounded-lg border border-brand-border text-xs text-brand-muted">
                  <p>Current: <span className="text-brand-text font-mono">{liveData[alertForm.pair].price}</span></p>
                  <p>Distance: <span className="text-brand-text font-mono">{Math.abs(alertForm.targetPrice - liveData[alertForm.pair].price).toFixed(4)}</span></p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border">
                <button type="button" onClick={() => setIsAlertModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-brand-text transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-brand-text bg-brand-pink hover:bg-brand-pink/90 transition-colors shadow-lg shadow-brand-pink/20">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
