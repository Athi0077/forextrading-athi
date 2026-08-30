import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { createChart } from 'lightweight-charts';
import socketClient from '../services/socketClient';
import { apiCall } from '../services/api';
import TradeModal from '../components/TradeModal';
import { createTrade } from '../services/tradeService';

const TIMEFRAMES = [
  { label: '1m', value: '1min' },
  { label: '5m', value: '5min' },
  { label: '15m', value: '15min' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1day' },
];

export default function TradeChartPage() {
  const { pair } = useParams();
  const navigate = useNavigate();
  
  // Format pair string from URL (e.g. XAUUSD -> XAU/USD)
  const formattedPair = pair.length === 6 ? `${pair.slice(0, 3)}/${pair.slice(3, 6)}` : pair;
  
  const [liveData, setLiveData] = useState({ price: 0, change: 0, changePercent: 0, spread: 0 });
  const [timeframe, setTimeframe] = useState('15min');
  const [isLoading, setIsLoading] = useState(true);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  // Real-time price updates
  useEffect(() => {
    const cleanupSocket = socketClient.onPriceUpdate((data) => {
      if (data && data.symbol === formattedPair && data.price) {
        setLiveData(prev => ({
          ...prev,
          price: data.price,
          change: data.change || prev.change,
          changePercent: data.changePercent || prev.changePercent,
        }));
        
        // Update latest candle on chart if available
        if (candleSeriesRef.current && data.price) {
          // We only update the current candle close price for simplicity
          // Real implementations would manage open, high, low, close for the active interval
        }
      }
    });

    return () => {
      cleanupSocket();
    };
  }, [formattedPair]);

  // Fetch historical data and render chart
  useEffect(() => {
    let isMounted = true;
    
    // Initialize chart immediately if container exists
    if (!chartRef.current && chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: 'solid', color: 'transparent' },
          textColor: '#a1a1aa',
        },
        grid: {
          vertLines: { color: 'rgba(39, 39, 42, 0.5)' },
          horzLines: { color: 'rgba(39, 39, 42, 0.5)' },
        },
        crosshair: {
          mode: 1,
        },
        width: chartContainerRef.current.clientWidth,
        height: 500,
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#4ade80',
        downColor: '#f87171',
        borderVisible: false,
        wickUpColor: '#4ade80',
        wickDownColor: '#f87171',
      });
      
      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };
      window.addEventListener('resize', handleResize);
      
      // Store resize handler for cleanup
      chartContainerRef.current._handleResize = handleResize;
    }

    const fetchCandles = async () => {
      setIsLoading(true);
      try {
        const res = await apiCall(`/market/candles?symbol=${formattedPair}&interval=${timeframe}`);
        
        if (isMounted && res.candles && candleSeriesRef.current) {
          const formattedData = res.candles.map(d => ({
            time: d.time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          })).sort((a, b) => a.time - b.time);

          candleSeriesRef.current.setData(formattedData);
          chartRef.current.timeScale().fitContent();
          
          // Set initial live data based on last candle if empty
          if (formattedData.length > 0) {
            const last = formattedData[formattedData.length - 1];
            setLiveData(prev => prev.price === 0 ? { ...prev, price: last.close } : prev);
          }
        }
      } catch (error) {
        console.error('Failed to load chart data:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCandles();

    return () => {
      isMounted = false;
      // We do NOT destroy the chart here if we want it to persist across timeframe changes
      // We will only destroy it on component unmount
    };
  }, [formattedPair, timeframe]);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartContainerRef.current?._handleResize) {
        window.removeEventListener('resize', chartContainerRef.current._handleResize);
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
      }
    };
  }, []);

  const handleTradeSubmit = async (formData) => {
    try {
      await createTrade(formData);
      setIsTradeModalOpen(false);
      // Optional: Add a toast notification here
      alert('Trade executed successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save trade.');
    }
  };

  const openTradeModal = (type) => {
    setTradeType(type);
    setIsTradeModalOpen(true);
  };

  const isPositive = liveData.change >= 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50 pb-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/market')}
            className="p-2 bg-[#18181b] border border-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              {formattedPair}
              <span className="ml-3 text-xs px-2 py-1 bg-zinc-800/80 rounded-lg text-zinc-400">Forex</span>
            </h1>
            <p className="text-sm text-zinc-500 flex items-center mt-1">
              <Clock className="w-3 h-3 mr-1" /> Live Market Data
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white tracking-tight">
              {liveData.price > 0 ? liveData.price.toFixed(formattedPair.includes('JPY') ? 3 : 5) : '...'}
            </p>
            <div className={`flex items-center justify-end text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {isPositive ? '+' : ''}{liveData.change.toFixed(4)} ({isPositive ? '+' : ''}{liveData.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Chart Column */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Chart Controls */}
          <div className="flex items-center justify-between bg-[#121214] border border-zinc-800/50 rounded-2xl p-3">
            <div className="flex space-x-1">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    timeframe === tf.value 
                      ? 'bg-brand-purple/20 text-brand-purple' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Container */}
          <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-4 relative min-h-[500px]">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#121214]/50 backdrop-blur-sm rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
              </div>
            )}
            <div ref={chartContainerRef} className="w-full h-[500px]" />
          </div>
        </div>

        {/* Sidebar / Order Entry */}
        <div className="space-y-6">
          <div className="bg-[#121214] border border-zinc-800/50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-zinc-400 mb-6">EXECUTE TRADE</h2>
            
            <div className="space-y-4">
              <button 
                onClick={() => openTradeModal('BUY')}
                className="w-full py-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl flex flex-col items-center justify-center transition-all group"
              >
                <span className="text-lg font-bold text-green-400 group-hover:scale-105 transition-transform">BUY</span>
                <span className="text-xs text-green-400/70 mt-1">Market Execution</span>
              </button>

              <button 
                onClick={() => openTradeModal('SELL')}
                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl flex flex-col items-center justify-center transition-all group"
              >
                <span className="text-lg font-bold text-red-400 group-hover:scale-105 transition-transform">SELL</span>
                <span className="text-xs text-red-400/70 mt-1">Market Execution</span>
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-800/50 space-y-3 text-sm">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Spread</span>
                <span className="text-white font-medium">{liveData.spread ? liveData.spread : 'Variable'}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Margin Req</span>
                <span className="text-white font-medium">~1.00%</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Trading Hours</span>
                <span className="text-white font-medium">24/5</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <TradeModal 
        isOpen={isTradeModalOpen} 
        onClose={() => setIsTradeModalOpen(false)} 
        onSubmit={handleTradeSubmit} 
        initialData={{ pair: formattedPair, type: tradeType, entryPrice: liveData.price || '' }} 
      />
    </div>
  );
}
