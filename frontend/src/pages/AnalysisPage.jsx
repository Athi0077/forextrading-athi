import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Activity, Maximize2, Settings, BarChart2, Zap, ShieldAlert, Target, Crosshair, MessageSquare } from 'lucide-react';
import CandlestickChart from '../components/Chart/CandlestickChart';
import { getMarketAnalysis, getMarketCandles, getMarketQuotes } from '../services/marketAnalysis';
import socketClient from '../services/socketClient';
import { MARKET_CONFIG, formatMarketPrice, calculatePipValue, normalizeSymbol } from '../utils/marketUtils';

export default function AnalysisPage() {
  const [timeframe, setTimeframe] = useState('15M');
  const [analysisData, setAnalysisData] = useState(null);
  const [chartCandles, setChartCandles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState('EUR/USD');
  const [liveData, setLiveData] = useState(null);
  const [tradeAction, setTradeAction] = useState('BUY');
  const navigate = useNavigate();

  const MARKETS = Object.keys(MARKET_CONFIG);

  // Input states for Trade Action
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [lotSize, setLotSize] = useState('1.00');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getMarketAnalysis(selectedMarket);
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
      const intervalMap = { '1M': '1min', '5M': '5min', '15M': '15min', '1H': '1h', '4H': '4h', '1D': '1day' };
      const apiInterval = intervalMap[timeframe] || '15min';
      
      const config = MARKET_CONFIG[selectedMarket];
      if (!config) return;

      let candles = [];
      let quotes = null;

      try {
        candles = await getMarketCandles(config.apiSymbol, apiInterval, 150);
      } catch (err) {
        console.error("Candles fetch error:", err);
      }

      try {
        quotes = await getMarketQuotes(selectedMarket);
      } catch (err) {
        console.error("Quotes fetch error:", err);
      }

      setChartCandles(candles);
      
      const quote = quotes ? quotes[selectedMarket] : null;
      
      if (quote) {
        setLiveData({
          price: parseFloat(quote.close || quote.open || 0),
          change: parseFloat(quote.change || 0),
          changePercent: parseFloat(quote.percent_change || 0),
          open: parseFloat(quote.open || 0),
          high: parseFloat(quote.high || 0),
          low: parseFloat(quote.low || 0),
          previousClose: parseFloat(quote.previous_close || 0)
        });
      } else if (candles && candles.length > 0) {
        const latest = candles[candles.length - 1];
        setLiveData({
          price: latest.close,
          change: 0,
          changePercent: 0,
          open: latest.open,
          high: latest.high,
          low: latest.low,
          previousClose: candles.length > 1 ? candles[candles.length - 2].close : latest.open
        });
      }
    } catch (err) {
      console.error(err);
      setChartCandles([]);
    } finally {
      setIsChartLoading(false);
    }
  };

  useEffect(() => {
    // Clear data on market change before fetching
    setChartCandles([]);
    setAnalysisData(null);
    setLiveData(null);
    setEntryPrice('');
    setStopLoss('');
    setTakeProfit('');

    fetchData();
    fetchChartData();

    const selectedApiSymbol = MARKET_CONFIG[selectedMarket]?.apiSymbol;

    const cleanupSocket = socketClient.onPriceUpdate((data) => {
      const tickSymbol = normalizeSymbol(data?.symbol);
      const expectedSymbol = normalizeSymbol(selectedApiSymbol);
      
      if (!data?.symbol || tickSymbol !== expectedSymbol) {
        return;
      }

      setLiveData(prev => {
        const base = prev || { price: 0, change: 0, changePercent: 0, open: 0, high: 0, low: 0, previousClose: 0 };
        return {
          ...base,
          price: parseFloat(data.price),
          change: data.change || base.change,
          changePercent: data.changePercent || base.changePercent,
        };
      });
    });

    return () => cleanupSocket();
  }, [selectedMarket]);

  useEffect(() => {
    if (chartCandles.length > 0) {
      fetchChartData();
    }
  }, [timeframe]);

  const tfData = analysisData?.timeframes ? analysisData.timeframes[timeframe.toLowerCase()] || analysisData.timeframes['15m'] : null;
  const isPositive = liveData?.change >= 0;

  // Trade Calculator Logic
  const entryNum = parseFloat(entryPrice);
  const slNum = parseFloat(stopLoss);
  const tpNum = parseFloat(takeProfit);
  const lotNum = parseFloat(lotSize);
  
  let riskAmount = 0;
  let rewardAmount = 0;
  let rrRatio = '0.0';

  if (!isNaN(entryNum) && !isNaN(slNum) && !isNaN(tpNum) && !isNaN(lotNum)) {
    const pipValue = calculatePipValue(selectedMarket);
    const riskDiff = Math.abs(entryNum - slNum);
    const rewardDiff = Math.abs(tpNum - entryNum);
    
    riskAmount = riskDiff * pipValue * lotNum; 
    rewardAmount = rewardDiff * pipValue * lotNum;
    
    if (riskDiff > 0) rrRatio = (rewardDiff / riskDiff).toFixed(2);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-brand-base text-brand-text">
      
      {/* Left Column: Chart & Trade Action */}
      <div className="w-full lg:w-2/3 flex flex-col border-b lg:border-b-0 lg:border-r border-brand-border">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-brand-border bg-brand-surface">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="bg-transparent text-xl font-bold text-brand-text focus:outline-none appearance-none cursor-pointer"
              >
                {MARKETS.map(market => (
                  <option key={market} value={market} className="bg-brand-surface text-base">
                    {market}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none text-brand-muted">▼</div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-2xl font-bold tracking-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {liveData ? formatMarketPrice(selectedMarket, liveData.price) : '---'}
              </span>
              {liveData && (
                <div className={`text-sm font-medium ${isPositive ? 'text-green-400/80' : 'text-red-400/80'} bg-brand-elevated px-2 py-1 rounded-md border ${isPositive ? 'border-green-500/20' : 'border-red-500/20'}`}>
                  {isPositive ? '+' : ''}{liveData.change.toFixed(4)} ({isPositive ? '+' : ''}{liveData.changePercent.toFixed(2)}%)
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0 overflow-x-auto scrollbar-hide">
            {['1M', '5M', '15M', '1H', '4H', '1D'].map((tf) => (
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
        <div className="flex-1 relative min-h-[400px] lg:min-h-0 bg-brand-base">
          <CandlestickChart 
            candles={chartCandles} 
            isLoading={isChartLoading && chartCandles.length === 0} 
            plotData={analysisData}
            symbol={selectedMarket}
            previousClose={liveData?.previousClose}
          />
        </div>

        {/* Trade Action Area */}
        <div className="p-4 bg-brand-surface border-t border-brand-border">
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
      <div className="w-full lg:w-1/3 flex flex-col bg-brand-surface overflow-y-auto">
        
        {/* Chart Information Panel */}
        <div className="p-4 lg:p-6 border-b border-brand-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-brand-text flex items-center">
              <Activity className="w-4 h-4 mr-2 text-brand-purple" />
              MARKET OVERVIEW
            </h3>
            <button
              onClick={() => {
                const marketContext = {
                  symbol: selectedMarket,
                  timeframe,
                  currentPrice: liveData?.price,
                  change: liveData?.change,
                  changePercent: liveData?.changePercent,
                  dayHigh: liveData?.high,
                  dayLow: liveData?.low,
                  open: liveData?.open,
                  previousClose: liveData?.previousClose,
                  rsi: tfData?.rsi,
                  macdTrend: tfData?.macd,
                  emaTrend: tfData?.emaTrend
                };
                navigate('/ai', { state: { clientMarketContext: marketContext } });
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-elevated hover:bg-brand-purple/20 border border-brand-border hover:border-brand-purple/50 text-brand-text text-xs font-semibold rounded-lg transition-colors group"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-purple group-hover:animate-pulse" />
              <span>Ask ChatGPT</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-brand-surface border border-brand-border p-3 rounded-xl">
              <p className="text-xs text-brand-muted opacity-80 mb-1">Day High</p>
              <p className="text-sm font-semibold text-brand-text">{liveData ? formatMarketPrice(selectedMarket, liveData.high) : '---'}</p>
            </div>
            <div className="bg-brand-surface border border-brand-border p-3 rounded-xl">
              <p className="text-xs text-brand-muted opacity-80 mb-1">Day Low</p>
              <p className="text-sm font-semibold text-brand-text">{liveData ? formatMarketPrice(selectedMarket, liveData.low) : '---'}</p>
            </div>
            <div className="bg-brand-surface border border-brand-border p-3 rounded-xl">
              <p className="text-xs text-brand-muted opacity-80 mb-1">Open</p>
              <p className="text-sm font-semibold text-brand-text">{liveData ? formatMarketPrice(selectedMarket, liveData.open) : '---'}</p>
            </div>
            <div className="bg-brand-surface border border-brand-border p-3 rounded-xl">
              <p className="text-xs text-brand-muted opacity-80 mb-1">Prev Close</p>
              <p className="text-sm font-semibold text-brand-text">{liveData?.previousClose ? formatMarketPrice(selectedMarket, liveData.previousClose) : (liveData ? formatMarketPrice(selectedMarket, liveData.price - liveData.change) : '---')}</p>
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
        <div className="p-4 lg:p-6 flex-1 bg-gradient-to-br from-brand-surface to-brand-surface">
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
