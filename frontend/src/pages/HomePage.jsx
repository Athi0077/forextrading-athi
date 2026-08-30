import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, TrendingUp, TrendingDown, Clock, Activity, Zap, ChevronRight, BarChart2, Briefcase, Bot, Eye, Plus, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getXauUsdAnalysis } from '../services/marketAnalysis';
import socketClient from '../services/socketClient';
import { createChart } from 'lightweight-charts';
import { getPortfolioAnalytics, getTrades, createTrade, updateTrade, closeTrade } from '../services/tradeService';
import TradeModal from '../components/TradeModal';
import CloseTradeModal from '../components/CloseTradeModal';
import AnnouncementModal from '../components/AnnouncementModal';
import { apiCall } from '../services/api';

export default function HomePage() {
  const { currentUser } = useAuth();
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [livePrices, setLivePrices] = useState({
    'XAU/USD': { price: 2024.50, change: 0.15 }, // Fallback initial state, will be updated by socket
    'EUR/USD': { price: 1.0845, change: -0.05 },
    'GBP/USD': { price: 1.2650, change: 0.22 },
  });
  
  const [analytics, setAnalytics] = useState(null);
  const [openTrades, setOpenTrades] = useState([]);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [currentTrade, setCurrentTrade] = useState(null);
  
  const [unseenAnnouncements, setUnseenAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const lineSeriesRef = useRef(null);

  useEffect(() => {
    // Fetch AI Insight
    const fetchInsight = async () => {
      try {
        const data = await getXauUsdAnalysis();
        setInsight(data?.summary || data?.analysis || 'Market is showing mixed signals across major pairs. Awaiting further confirmation.');
      } catch (error) {
        console.error('Failed to fetch insight', error);
        setInsight('AI Analysis temporarily unavailable.');
      } finally {
        setInsightLoading(false);
      }
    };

    const fetchPortfolioData = async () => {
      try {
        const [statsData, tradesData] = await Promise.all([
          getPortfolioAnalytics(),
          getTrades()
        ]);
        setAnalytics(statsData);
        setOpenTrades(tradesData?.filter(t => t.status === 'OPEN') || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const res = await apiCall('/announcements/active');
        if (res.data && res.data.length > 0) {
          const seenStr = localStorage.getItem('seenAnnouncements');
          const seenIds = seenStr ? JSON.parse(seenStr) : [];
          const unseen = res.data.filter(ann => !seenIds.includes(ann._id));
          if (unseen.length > 0) {
            setUnseenAnnouncements(unseen);
            setShowAnnouncementModal(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };

    fetchInsight();
    fetchPortfolioData();
    fetchAnnouncements();

    // Connect WebSocket for live prices
    const cleanupSocket = socketClient.onPriceUpdate((data) => {
      if (data && data.symbol && data.price) {
        setLivePrices(prev => ({
          ...prev,
          [data.symbol]: {
            price: data.price,
            change: data.change || 0
          }
        }));
      }
    });

    return () => {
      cleanupSocket();
    };
  }, []);

  // Initialize empty chart (no mock data as requested)
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: 'solid', color: 'transparent' },
          textColor: '#a1a1aa', // zinc-400
        },
        grid: {
          vertLines: { color: 'rgba(39, 39, 42, 0.5)' }, // zinc-800
          horzLines: { color: 'rgba(39, 39, 42, 0.5)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
      });

      const lineSeries = chart.addLineSeries({
        color: '#a855f7',
        lineWidth: 2,
        crosshairMarkerVisible: false,
      });
      
      chartRef.current = chart;
      lineSeriesRef.current = lineSeries;

      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      };
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
        chartRef.current = null;
      };
    }

    if (analytics?.equityCurve && analytics.equityCurve.length > 0) {
      const sortedData = [...analytics.equityCurve].sort((a, b) => a.time - b.time);
      const uniqueData = sortedData.filter((item, index, self) => 
        index === 0 || item.time !== self[index - 1].time
      );
      if (uniqueData.length > 0) {
        lineSeriesRef.current.setData(uniqueData);
        chartRef.current.timeScale().fitContent();
      }
    } else if (lineSeriesRef.current) {
      lineSeriesRef.current.setData([]);
    }
  }, [analytics]);

  const refreshData = async () => {
    try {
      const [statsData, tradesData] = await Promise.all([
        getPortfolioAnalytics(),
        getTrades()
      ]);
      setAnalytics(statsData);
      setOpenTrades(tradesData?.filter(t => t.status === 'OPEN') || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTradeSubmit = async (formData) => {
    try {
      const payload = { ...formData };
      if (payload.exitPrice && payload.status === 'OPEN') {
        payload.exitDate = new Date();
      }
      if (currentTrade) {
        await updateTrade(currentTrade._id, payload);
      } else {
        await createTrade(payload);
      }
      setIsTradeModalOpen(false);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to save trade.');
    }
  };

  const handleCloseSubmit = async (id, exitData) => {
    try {
      await closeTrade(id, exitData);
      setIsCloseModalOpen(false);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to close trade.');
    }
  };

  const handleCloseAnnouncements = () => {
    const seenStr = localStorage.getItem('seenAnnouncements');
    const seenIds = seenStr ? JSON.parse(seenStr) : [];
    
    // Add newly seen IDs
    const newSeenIds = [...new Set([...seenIds, ...unseenAnnouncements.map(a => a._id)])];
    localStorage.setItem('seenAnnouncements', JSON.stringify(newSeenIds));
    
    setShowAnnouncementModal(false);
  };

  const getLivePnl = (trade) => {
    const liveInfo = livePrices[trade.pair];
    if (!liveInfo) return null;
    const currentPrice = liveInfo.price;
    const multiplier = trade.pair.includes('JPY') ? 1000 : 100000;
    const diff = trade.type === 'BUY' ? (currentPrice - trade.entryPrice) : (trade.entryPrice - currentPrice);
    return diff * multiplier * trade.lotSize;
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting()}, {currentUser?.name?.split(' ')[0] || 'Trader'}
          </h1>
          <div className="flex items-center text-sm text-zinc-400 mt-1 space-x-4">
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-brand-purple" /> London Session</span>
            <span className="flex items-center"><Activity className="w-4 h-4 mr-1 text-green-400" /> Market Open</span>
            <button 
              onClick={() => { setCurrentTrade(null); setIsTradeModalOpen(true); }}
              className="ml-4 flex items-center px-3 py-1 bg-brand-purple/20 text-brand-purple text-xs font-semibold rounded-lg hover:bg-brand-purple/30 transition-colors"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Trade
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative group hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-brand-purple transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Ask AI Assistant..." 
              className="pl-10 pr-4 py-2 w-64 bg-[#18181b] border border-zinc-800/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple/50 focus:border-brand-purple/50 transition-all text-white placeholder-zinc-500"
            />
          </div>
          <button className="p-2.5 bg-[#18181b] border border-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors relative">
            <Bell className="w-5 h-5 text-zinc-400" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-brand-pink rounded-full"></span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Account Summary Card */}
        <div className="lg:col-span-2 bg-[#121214] border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-brand-purple/10 transition-all duration-700"></div>
          
          <h2 className="text-sm font-semibold text-zinc-400 mb-6 flex items-center">
            <Briefcase className="w-4 h-4 mr-2" /> PORTFOLIO SUMMARY
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-white">
                ${analytics?.stats ? (10000 + analytics.stats.totalPnL).toFixed(2) : '10,000.00'}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Total P/L</p>
              <p className={`text-lg font-semibold ${!analytics?.stats ? 'text-zinc-400' : analytics.stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${analytics?.stats ? analytics.stats.totalPnL.toFixed(2) : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Today's P/L</p>
              <p className={`text-lg font-semibold ${!analytics?.stats ? 'text-zinc-400' : analytics.stats.todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${analytics?.stats ? (analytics.stats.todayPnL || 0).toFixed(2) : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Win Rate</p>
              <p className="text-lg font-semibold text-zinc-400">
                {analytics?.stats ? `${analytics.stats.winRate.toFixed(1)}%` : '0%'}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-300">Performance (30d)</h3>
            </div>
            <div ref={chartContainerRef} className="w-full h-[300px] relative">
               {(!analytics?.equityCurve || analytics.equityCurve.length === 0) && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                   <p className="text-sm text-zinc-600 bg-[#121214]/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-zinc-800/50">No trade data available</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* AI Insight Card */}
          <div className="bg-gradient-to-br from-[#18181b] to-[#121214] border border-brand-purple/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-24 h-24 text-brand-purple" />
            </div>
            <h2 className="text-sm font-semibold text-brand-purple mb-4 flex items-center">
              <Bot className="w-4 h-4 mr-2" /> AI MARKET INSIGHT
            </h2>
            {insightLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-800 rounded w-full"></div>
                <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
              </div>
            ) : (
              <p className="text-sm text-zinc-300 leading-relaxed relative z-10">
                {insight}
              </p>
            )}
            <Link to="/analysis" className="mt-4 inline-flex items-center text-xs text-brand-pink hover:text-brand-purple transition-colors font-medium">
              View full analysis <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          {/* Watchlist Card */}
          <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-400 flex items-center">
                <Eye className="w-4 h-4 mr-2" /> WATCHLIST
              </h2>
              <button className="text-xs text-brand-purple hover:text-brand-pink transition-colors">View All</button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(livePrices).map(([pair, data]) => {
                const isPositive = data.change >= 0;
                return (
                  <div key={pair} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#18181b] transition-colors border border-transparent hover:border-zinc-800/50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{pair}</p>
                        <p className="text-xs text-zinc-500">Forex</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{data.price.toFixed(5)}</p>
                      <p className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{data.change.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Open Trades (Full Width Bottom) */}
        <div className="lg:col-span-3 bg-[#121214] border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-zinc-400 flex items-center">
              <BarChart2 className="w-4 h-4 mr-2" /> ACTIVE TRADES
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800/50">
                  <th className="pb-3 font-medium">Pair</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Entry Price</th>
                  <th className="pb-3 font-medium">Current Price</th>
                  <th className="pb-3 font-medium text-right">P/L</th>
                </tr>
              </thead>
              <tbody>
                {openTrades.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-500">
                      No active trades currently open.
                    </td>
                  </tr>
                ) : (
                  openTrades.map(trade => {
                    const livePnl = getLivePnl(trade);
                    const currentPrice = livePrices[trade.pair]?.price;
                    
                    return (
                      <tr key={trade._id} className="text-white hover:bg-zinc-800/20 transition-colors border-b border-zinc-800/20 last:border-0">
                        <td className="py-3 font-bold">{trade.pair}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-3 font-mono">{trade.entryPrice}</td>
                        <td className="py-3 font-mono text-zinc-400">{currentPrice || '--'}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <span className={`font-bold block ${livePnl === null ? 'text-zinc-500' : livePnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {livePnl === null ? 'Wait...' : `$${livePnl.toFixed(2)}`}
                            </span>
                            <button onClick={() => { setCurrentTrade(trade); setIsCloseModalOpen(true); }} className="p-1.5 text-zinc-400 hover:text-green-400 bg-zinc-800/50 rounded-lg transition-colors" title="Close Trade">
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <TradeModal isOpen={isTradeModalOpen} onClose={() => setIsTradeModalOpen(false)} onSubmit={handleTradeSubmit} initialData={currentTrade} />
      <CloseTradeModal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)} onSubmit={handleCloseSubmit} trade={currentTrade} />
      
      {showAnnouncementModal && (
        <AnnouncementModal 
          announcements={unseenAnnouncements} 
          onClose={handleCloseAnnouncements} 
        />
      )}
    </div>
  );
}
