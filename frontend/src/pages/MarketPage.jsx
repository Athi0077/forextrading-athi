import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, TrendingUp, TrendingDown, Clock, Activity, RefreshCw } from 'lucide-react';
import socketClient from '../services/socketClient';

const INITIAL_PAIRS = [
  { symbol: 'EUR/USD', price: 1.0845, change: -0.05, changePercent: -0.12, spread: 0.8 },
  { symbol: 'GBP/USD', price: 1.2650, change: 0.22, changePercent: 0.45, spread: 1.1 },
  { symbol: 'USD/JPY', price: 150.25, change: -0.45, changePercent: -0.30, spread: 0.9 },
  { symbol: 'USD/CHF', price: 0.8850, change: 0.02, changePercent: 0.05, spread: 1.2 },
  { symbol: 'AUD/USD', price: 0.6540, change: 0.15, changePercent: 0.35, spread: 1.0 },
  { symbol: 'USD/CAD', price: 1.3520, change: -0.10, changePercent: -0.25, spread: 1.1 },
  { symbol: 'NZD/USD', price: 0.6120, change: 0.08, changePercent: 0.20, spread: 1.3 },
  { symbol: 'XAU/USD', price: 2024.50, change: 1.50, changePercent: 0.07, spread: 15.0 },
];

export default function MarketPage() {
  const navigate = useNavigate();
  const [pairs, setPairs] = useState(
    INITIAL_PAIRS.reduce((acc, pair) => ({ ...acc, [pair.symbol]: pair }), {})
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['EUR/USD', 'XAU/USD']);
  const [flashing, setFlashing] = useState({});

  useEffect(() => {
    const cleanupSocket = socketClient.onPriceUpdate((data) => {
      if (data && data.symbol && data.price) {
        setPairs((prev) => {
          const prevData = prev[data.symbol] || { price: 0 };
          const isUp = data.price > prevData.price;
          const isDown = data.price < prevData.price;
          
          if (isUp || isDown) {
            setFlashing(f => ({ ...f, [data.symbol]: isUp ? 'up' : 'down' }));
            setTimeout(() => {
              setFlashing(f => ({ ...f, [data.symbol]: null }));
            }, 300);
          }

          return {
            ...prev,
            [data.symbol]: {
              ...prev[data.symbol],
              symbol: data.symbol,
              price: data.price,
              change: data.change || prev[data.symbol]?.change || 0,
              changePercent: data.changePercent || prev[data.symbol]?.changePercent || 0,
            }
          };
        });
      }
    });

    return () => {
      cleanupSocket();
    };
  }, []);

  const toggleFavorite = (symbol) => {
    setFavorites(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const filteredPairs = Object.values(pairs).filter(p => 
    p.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center">
            Forex Market
          </h1>
          <div className="flex items-center text-sm text-brand-muted mt-1 space-x-4">
            <span className="flex items-center text-green-400"><Activity className="w-4 h-4 mr-1" /> Market Open</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-brand-purple" /> Active Session</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-brand-muted opacity-80 group-focus-within:text-brand-purple transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search pairs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 bg-brand-elevated border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple/50 focus:border-brand-purple/50 transition-all text-brand-text placeholder-brand-muted"
            />
          </div>
          <button className="p-2.5 bg-brand-elevated border border-brand-border rounded-xl hover:bg-brand-elevated transition-colors text-brand-muted hover:text-brand-text group">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Market Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredPairs.map((pair) => {
          const isPositive = pair.change >= 0;
          const isFavorite = favorites.includes(pair.symbol);
          const flashClass = flashing[pair.symbol] === 'up' 
            ? 'bg-green-500/20 border-green-500/50' 
            : flashing[pair.symbol] === 'down' 
            ? 'bg-red-500/20 border-red-500/50' 
            : 'bg-brand-surface border-brand-border hover:border-zinc-700';

          return (
            <div 
              key={pair.symbol} 
              onClick={() => navigate(`/trade/${pair.symbol.replace('/', '')}`)}
              className={`rounded-2xl p-5 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-purple/10 ${flashClass}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text text-lg leading-tight">{pair.symbol}</h3>
                    <p className="text-xs text-brand-muted opacity-80">Forex</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(pair.symbol); }}
                  className={`p-1.5 rounded-lg transition-colors ${isFavorite ? 'text-brand-gold bg-brand-gold/10' : 'text-brand-muted opacity-80 hover:text-brand-text hover:bg-brand-elevated'}`}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-brand-text tracking-tight">
                    {pair.price.toFixed(pair.symbol === 'XAU/USD' || pair.symbol === 'USD/JPY' ? 2 : 5)}
                  </p>
                  <p className={`text-sm font-medium flex items-center mt-0.5 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{pair.change.toFixed(2)} ({isPositive ? '+' : ''}{pair.changePercent.toFixed(2)}%)
                  </p>
                </div>
                
                {pair.spread && (
                  <div className="text-right">
                    <p className="text-xs text-brand-muted opacity-80 mb-0.5">Spread</p>
                    <p className="text-sm font-medium text-brand-text">{pair.spread}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
