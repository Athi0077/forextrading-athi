import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createChart } from 'lightweight-charts';
import { Activity, TrendingUp, Zap, PieChart, BarChart3 } from 'lucide-react';
import { getPortfolioAnalytics, getPerformanceInsight } from '../services/tradeService';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const lineSeriesRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [analyticsData, insightData] = await Promise.all([
          getPortfolioAnalytics(),
          getPerformanceInsight()
        ]);
        setAnalytics(analyticsData);
        setInsight(insightData?.insight || 'No insight available yet.');
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Initialize Chart
  useEffect(() => {
    if (!analytics || !chartContainerRef.current || analytics.equityCurve.length === 0) return;

    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: 'solid', color: 'transparent' },
          textColor: '#A1A1AA', // zinc-400
        },
        grid: {
          vertLines: { color: 'rgba(39, 39, 42, 0.4)' },
          horzLines: { color: 'rgba(39, 39, 42, 0.4)' },
        },
        rightPriceScale: {
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: '#c084fc',
            width: 1,
            style: 3,
          },
          horzLine: {
            color: '#c084fc',
            width: 1,
            style: 3,
          },
        },
      });

      const lineSeries = chart.addLineSeries({
        color: '#c084fc',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      });

      // Add baseline zero
      lineSeries.createPriceLine({
        price: 0,
        color: 'rgba(255, 255, 255, 0.2)',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Breakeven',
      });

      chartRef.current = chart;
      lineSeriesRef.current = lineSeries;

      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      };
      window.addEventListener('resize', handleResize);
      
      // Clean up on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
        chartRef.current = null;
      };
    }

    if (lineSeriesRef.current) {
      // Sort points by time and map
      const sortedData = [...analytics.equityCurve].sort((a, b) => a.time - b.time);
      
      // Filter out duplicate timestamps (lightweight-charts requires strictly increasing time)
      const uniqueData = sortedData.filter((item, index, self) => 
        index === 0 || item.time !== self[index - 1].time
      );

      if (uniqueData.length > 0) {
        lineSeriesRef.current.setData(uniqueData);
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Activity className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  const { stats, byPair, byType } = analytics || {};

  // Empty State
  if (!stats || stats.totalTrades === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] max-w-2xl mx-auto text-center px-4">
        <div className="w-20 h-20 bg-brand-purple/10 rounded-full flex items-center justify-center mb-6 border border-brand-purple/20 shadow-[0_0_30px_rgba(192,132,252,0.15)]">
          <BarChart3 className="w-10 h-10 text-brand-purple" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">No trades yet</h1>
        <p className="text-zinc-400 mb-8 max-w-md leading-relaxed">
          Start recording your trades to build your performance history. Your analytics dashboard will automatically populate here.
        </p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/journal')} className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">
            Add Your First Trade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-zinc-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Portfolio Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Review your trading performance and AI insights.</p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-purple/10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
          <p className="text-sm font-medium text-zinc-500 mb-2">Total P/L</p>
          <p className={`text-3xl font-black ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${stats.totalPnL.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-5">
          <p className="text-sm font-medium text-zinc-500 mb-2">Win Rate</p>
          <p className="text-3xl font-black text-white">{stats.winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-5">
          <p className="text-sm font-medium text-zinc-500 mb-2">Profit Factor</p>
          <p className="text-3xl font-black text-white">{stats.profitFactor.toFixed(2)}</p>
        </div>
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-5">
          <p className="text-sm font-medium text-zinc-500 mb-2">Total Trades</p>
          <p className="text-3xl font-black text-white">{stats.totalTrades}</p>
        </div>
      </div>

      {/* Main Chart and AI Insight Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* P/L Chart */}
        <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-brand-purple" /> Equity Curve
            </h3>
            <div className="flex bg-[#18181b] rounded-lg p-1 border border-zinc-800/50 text-xs">
              {['1M', '3M', 'All'].map(range => (
                <button key={range} className="px-3 py-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">{range}</button>
              ))}
            </div>
          </div>
          <div ref={chartContainerRef} className="w-full h-[300px]" />
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-br from-[#0c0c0e] to-[#121214] border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-purple/10 rounded-full blur-3xl"></div>
          <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink flex items-center mb-6">
            <Zap className="w-5 h-5 mr-2 text-brand-purple" /> AI Performance Insight
          </h3>
          <p className="text-zinc-300 leading-relaxed text-sm relative z-10">
            "{insight}"
          </p>
          
          <div className="mt-8 space-y-4 relative z-10">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Average Win</span>
              <span className="text-green-400 font-bold">${stats.averageWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Average Loss</span>
              <span className="text-red-400 font-bold">${stats.averageLoss.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* By Pair */}
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-5">
          <h3 className="font-bold text-white flex items-center mb-4">
            <PieChart className="w-4 h-4 mr-2 text-brand-pink" /> Performance by Pair
          </h3>
          <div className="space-y-3">
            {byPair.map(pair => (
              <div key={pair._id} className="flex items-center justify-between p-3 bg-[#18181b] rounded-xl border border-zinc-800/30">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-white">{pair._id}</span>
                  <span className="text-xs text-zinc-500">{pair.trades} trades</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${pair.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${pair.pnl.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-500">{((pair.wins / pair.trades) * 100).toFixed(0)}% WR</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Direction */}
        <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-5">
          <h3 className="font-bold text-white flex items-center mb-4">
            <BarChart3 className="w-4 h-4 mr-2 text-brand-purple" /> Performance by Direction
          </h3>
          <div className="space-y-3">
            {byType.map(dir => (
              <div key={dir._id} className="flex items-center justify-between p-3 bg-[#18181b] rounded-xl border border-zinc-800/30">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${dir._id === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {dir._id}
                  </span>
                  <span className="text-xs text-zinc-500">{dir.trades} trades</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${dir.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${dir.pnl.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-500">{((dir.wins / dir.trades) * 100).toFixed(0)}% WR</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
