import { useState, useEffect } from 'react';
import { RefreshCw, Activity, Maximize2, Settings, BarChart2, Zap, ShieldAlert, Target, Crosshair } from 'lucide-react';
import CandlestickChart from '../components/Chart/CandlestickChart';
import { getXauUsdAnalysis, getMarketCandles } from '../services/marketAnalysis';
import socketClient from '../services/socketClient';

export default function AnalysisPage() {
  const [timeframe, setTimeframe] = useState('15M');
  const [analysisData, setAnalysisData] = useState(null);
  const [chartCandles, setChartCandles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [liveData, setLiveData] = useState({ price: 2024.50, change: 0.15, changePercent: 0.01, high: 2030, low: 2010, open: 2020 });
  const [tradeAction, setTradeAction] = useState('BUY');

  // Input states for Trade Action
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [lotSize, setLotSize] = useState('1.00');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getXauUsdAnalysis();
      setAnalysisData(data);
      
      // Auto-fill trade action based on AI
      if (data?.finalSignal === 'BUY' || data?.finalSignal === 'BULLISH') setTradeAction('BUY');
      else if (data?.finalSignal === 'SELL' || data?.finalSignal === 'BEARISH') setTradeAction('SELL');
      
      if (data?.entry) setEntryPrice(data.entry.toString());
      if (data?.stopLoss) setStopLoss(data.stopLoss.toString());
      if (data?.takeProfit1) setTakeProfit(data.takeProfit1.toString());

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setIsChartLoading(true);
      const intervalMap = { '1M': '1min', '5M': '5min', '15M': '15min', '30M': '30min', '1H': '1h', '4H': '4h', '1D': '1day', '1W': '1week' };
      const apiInterval = intervalMap[timeframe] || '15min';
      
      const candles = await getMarketCandles('XAU/USD', apiInterval, 150);
      setChartCandles(candles);
      
      if (candles && candles.length > 0) {
        const latest = candles[candles.length - 1];
        setLiveData(prev => ({
          ...prev,
          price: latest.close,
          open: latest.open,
          high: Math.max(...candles.slice(-20).map(c => c.high)),
          low: Math.min(...candles.slice(-20).map(c => c.low))
        }));
      }
    } catch (err) {
      console.error(err);
      setChartCandles([]);
    } finally {
      setIsChartLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const cleanupSocket = socketClient.onPriceUpdate((data) => {
      if (data.symbol === 'XAU/USD') {
        setLiveData(prev => ({
          ...prev,
          price: data.price,
          change: data.change || prev.change,
          changePercent: data.changePercent || prev.changePercent,
        }));
      }
    });

    return () => cleanupSocket();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [timeframe]);

  const tfData = analysisData?.timeframes ? analysisData.timeframes[timeframe.toLowerCase()] || analysisData.timeframes['15m'] : null;
  const isPositive = liveData.change >= 0;

  // Trade Calculator Logic
  const entryNum = parseFloat(entryPrice);
  const slNum = parseFloat(stopLoss);
  const tpNum = parseFloat(takeProfit);
  const lotNum = parseFloat(lotSize);
  
  let riskAmount = 0;
  let rewardAmount = 0;
  let rrRatio = '0.0';

  if (!isNaN(entryNum) && !isNaN(slNum) && !isNaN(tpNum) && !isNaN(lotNum)) {
    const pipValue = 10; // Approx for XAUUSD standard lot
    const riskDiff = Math.abs(entryNum - slNum);
    const rewardDiff = Math.abs(tpNum - entryNum);
    
    riskAmount = riskDiff * pipValue * lotNum * 10; 
    rewardAmount = rewardDiff * pipValue * lotNum * 10;
    
    if (riskDiff > 0) rrRatio = (rewardDiff / riskDiff).toFixed(2);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-[#09090b] text-brand-text">
      
      {/* Left Column: Chart & Trade Action */}
      <div className="w-full lg:w-2/3 flex flex-col border-b lg:border-b-0 lg:border-r border-brand-border">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-brand-border bg-[#0c0c0e]">
          <div className="flex items-center space-x-6">
            <div>
              <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
                XAU/USD
              </h2>
              <p className="text-xs text-brand-muted opacity-80">Gold / US Dollar</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-2xl font-bold tracking-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {liveData.price.toFixed(2)}
              </span>
              <div className={`text-sm font-medium ${isPositive ? 'text-green-400/80' : 'text-red-400/80'} bg-brand-elevated px-2 py-1 rounded-md border ${isPositive ? 'border-green-500/20' : 'border-red-500/20'}`}>
                {isPositive ? '+' : ''}{liveData.change.toFixed(2)} ({isPositive ? '+' : ''}{liveData.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0 overflow-x-auto scrollbar-hide">
            {['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                  timeframe === tf
                    ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30'
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-elevated border border-transparent'
                }`}
              >
                {tf}
              </button>
            ))}
            <div className="w-px h-6 bg-brand-elevated mx-2"></div>
            <button className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-elevated rounded-lg"><BarChart2 className="w-4 h-4" /></button>
            <button className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-elevated rounded-lg"><Settings className="w-4 h-4" /></button>
            <button className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-elevated rounded-lg"><Maximize2 className="w-4 h-4" /></button>
          </div>
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0 bg-[#09090b]">
          <CandlestickChart 
            candles={chartCandles} 
            isLoading={isChartLoading && chartCandles.length === 0} 
            plotData={analysisData}
          />
        </div>

        {/* Trade Action Area */}
        <div className="p-4 bg-[#0c0c0e] border-t border-brand-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-brand-text flex items-center">
              <Crosshair className="w-4 h-4 mr-2 text-brand-purple" />
              TRADE PLANNER
            </h3>
            <div className="flex bg-brand-elevated rounded-lg p-1 border border-brand-border">
              <button 
                onClick={() => setTradeAction('BUY')}
                className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all ${tradeAction === 'BUY' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-brand-muted opacity-80 hover:text-brand-text'}`}
              >
                BUY
              </button>
              <button 
                onClick={() => setTradeAction('SELL')}
                className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all ${tradeAction === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-brand-muted opacity-80 hover:text-brand-text'}`}
              >
                SELL
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-brand-muted opacity-80 mb-1">Entry Price</label>
              <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-purple/50" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted opacity-80 mb-1">Stop Loss</label>
              <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-red-500/50" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted opacity-80 mb-1">Take Profit</label>
              <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-green-500/50" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted opacity-80 mb-1">Lot Size</label>
              <input type="number" step="0.01" value={lotSize} onChange={e => setLotSize(e.target.value)} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-purple/50" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between p-3 bg-brand-elevated rounded-lg border border-brand-border">
            <div className="flex space-x-6">
              <div>
                <p className="text-xs text-brand-muted opacity-80">Risk</p>
                <p className="text-sm font-semibold text-red-400">${riskAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-brand-muted opacity-80">Reward</p>
                <p className="text-sm font-semibold text-green-400">${rewardAmount.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-brand-muted opacity-80">Risk/Reward</p>
              <p className="text-sm font-bold text-brand-text">1 : {rrRatio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Info & AI Panels */}
      <div className="w-full lg:w-1/3 flex flex-col bg-[#0c0c0e] overflow-y-auto">
        
        {/* Chart Information Panel */}
        <div className="p-4 lg:p-6 border-b border-brand-border">
          <h3 className="text-sm font-semibold text-brand-text mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-brand-purple" />
            MARKET OVERVIEW
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-brand-surface border border-brand-border p-3 rounded-xl">
              <p className="text-xs text-brand-muted opacity-80 mb-1">Day High</p>
              <p className="text-sm font-semibold text-brand-text">{liveData.high.toFixed(2)}</p>
            </div>
            <div className="bg-brand-surface border border-brand-border p-3 rounded-xl">
              <p className="text-xs text-brand-muted opacity-80 mb-1">Day Low</p>
              <p className="text-sm font-semibold text-brand-text">{liveData.low.toFixed(2)}</p>
            </div>
            <div className="bg-brand-surface border border-brand-border p-3 rounded-xl">
              <p className="text-xs text-brand-muted opacity-80 mb-1">Open</p>
              <p className="text-sm font-semibold text-brand-text">{liveData.open.toFixed(2)}</p>
            </div>
            <div className="bg-brand-surface border border-brand-border p-3 rounded-xl">
              <p className="text-xs text-brand-muted opacity-80 mb-1">Prev Close</p>
              <p className="text-sm font-semibold text-brand-text">{(liveData.price - liveData.change).toFixed(2)}</p>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-brand-text mb-4 flex items-center">
            <Target className="w-4 h-4 mr-2 text-brand-pink" />
            TECHNICAL INDICATORS
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-brand-surface border border-brand-border rounded-lg">
              <span className="text-xs text-brand-muted font-medium">RSI (14)</span>
              <span className={`text-sm font-bold ${tfData?.rsi > 70 ? 'text-red-400' : tfData?.rsi < 30 ? 'text-green-400' : 'text-brand-text'}`}>
                {tfData?.rsi ? tfData.rsi.toFixed(2) : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-brand-surface border border-brand-border rounded-lg">
              <span className="text-xs text-brand-muted font-medium">MACD Trend</span>
              <span className={`text-sm font-bold ${tfData?.macd === 'BULLISH' ? 'text-green-400' : tfData?.macd === 'BEARISH' ? 'text-red-400' : 'text-brand-muted opacity-80'}`}>
                {tfData?.macd || '--'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-brand-surface border border-brand-border rounded-lg">
              <span className="text-xs text-brand-muted font-medium">EMA Trend</span>
              <span className={`text-sm font-bold ${tfData?.emaTrend === 'BULLISH' ? 'text-green-400' : tfData?.emaTrend === 'BEARISH' ? 'text-red-400' : 'text-brand-muted opacity-80'}`}>
                {tfData?.emaTrend || '--'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="p-4 lg:p-6 flex-1 bg-gradient-to-br from-[#0c0c0e] to-brand-surface">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink flex items-center">
              <Zap className="w-4 h-4 mr-2 text-brand-purple" />
              AI ANALYSIS
            </h3>
            <button onClick={fetchData} className="p-1.5 text-brand-muted opacity-80 hover:text-brand-text transition-colors">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-brand-elevated rounded-xl"></div>
              <div className="grid grid-cols-2 gap-3"><div className="h-12 bg-brand-elevated rounded-xl"></div><div className="h-12 bg-brand-elevated rounded-xl"></div></div>
              <div className="h-24 bg-brand-elevated rounded-xl"></div>
            </div>
          ) : analysisData ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border relative overflow-hidden ${
                analysisData.finalSignal === 'BUY' ? 'bg-green-500/10 border-green-500/20' : 
                analysisData.finalSignal === 'SELL' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
              }`}>
                <p className="text-xs font-semibold text-brand-muted mb-1 uppercase">Market Bias</p>
                <div className="flex items-end justify-between">
                  <p className={`text-2xl font-black ${
                    analysisData.finalSignal === 'BUY' ? 'text-green-400' : 
                    analysisData.finalSignal === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {analysisData.finalSignal}
                  </p>
                  <p className="text-xs font-medium text-brand-text/70 bg-black/20 px-2 py-1 rounded">Confidence: {analysisData.signalConfidence}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brand-elevated p-3 rounded-xl border border-brand-border">
                  <p className="text-xs text-brand-muted opacity-80 mb-1">Key Support</p>
                  <p className="text-sm font-semibold text-brand-text">{tfData?.support?.[0]?.toFixed(2) || '--'}</p>
                </div>
                <div className="bg-brand-elevated p-3 rounded-xl border border-brand-border">
                  <p className="text-xs text-brand-muted opacity-80 mb-1">Key Resistance</p>
                  <p className="text-sm font-semibold text-brand-text">{tfData?.resistance?.[0]?.toFixed(2) || '--'}</p>
                </div>
              </div>
              
              <div className="bg-brand-elevated p-4 rounded-xl border border-brand-border relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-purple/10 transition-all duration-700"></div>
                 <p className="text-xs font-semibold text-brand-muted mb-2 uppercase flex items-center">
                    <ShieldAlert className="w-3 h-3 mr-1" /> Outlook
                 </p>
                 <p className="text-sm text-brand-text leading-relaxed relative z-10">
                   {analysisData.reasons?.[0] || 'Market shows mixed conditions. Trade with caution.'}
                 </p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border border-brand-border rounded-xl bg-brand-elevated/50">
              <p className="text-sm text-brand-muted opacity-80">Analysis unavailable. Check connection.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
