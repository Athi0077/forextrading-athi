import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, TrendingUp, TrendingDown, Clock, Activity, RefreshCw } from 'lucide-react';
import socketClient from '../services/socketClient';
import { getMarketQuotes } from '../services/marketAnalysis';

const MARKET_SYMBOLS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'XAU/USD'
];

export default function MarketPage() {
  const navigate = useNavigate();
  const [pairs, setPairs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['EUR/USD', 'XAU/USD']);
  const [flashing, setFlashing] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const data = await getMarketQuotes(MARKET_SYMBOLS.join(','));
      
      if (data && data['EUR/USD']) {
        setIsMarketOpen(data['EUR/USD'].is_market_open);
      }

      const newPairs = {};
      MARKET_SYMBOLS.forEach(sym => {
        if (data && data[sym]) {
          const q = data[sym];
          newPairs[sym] = {
            symbol: sym,
            price: parseFloat(q.close || q.open || 0),
            change: parseFloat(q.change || 0),
            changePercent: parseFloat(q.percent_change || 0),
            spread: null,
            is_market_open: q.is_market_open
          };
        }
      });
      setPairs(prev => {
        // Flash if price changed
        const flashObj = {};
        for (const sym in newPairs) {
          if (prev[sym] && newPairs[sym].price !== prev[sym].price) {
            flashObj[sym] = newPairs[sym].price > prev[sym].price ? 'up' : 'down';
          }
        }
        
        if (Object.keys(flashObj).length > 0) {
          setFlashing(flashObj);
          setTimeout(() => setFlashing({}), 300);
        }
        
        return newPairs;
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
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
            {isMarketOpen ? (
              <span className="flex items-center text-green-400"><Activity className="w-4 h-4 mr-1" /> Market Open</span>
            ) : (
              <span className="flex items-center text-red-400"><Clock className="w-4 h-4 mr-1" /> Market Closed</span>
            )}
            {lastUpdated && (
              <span className="text-xs text-brand-muted opacity-80 border-l border-brand-border pl-4">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
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
          <button 
            onClick={fetchQuotes}
            disabled={isLoading}
            className={`p-2.5 bg-brand-elevated border border-brand-border rounded-xl hover:bg-brand-elevated transition-colors text-brand-muted hover:text-brand-text group ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-5 h-5 transition-transform duration-500 ${isLoading ? 'animate-spin text-brand-purple' : 'group-hover:rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* Market Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading && Object.keys(pairs).length === 0 ? (
          // Skeleton loaders
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5 border border-brand-border bg-brand-surface animate-pulse h-36">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-elevated"></div>
                  <div>
                    <div className="h-5 w-20 bg-brand-elevated rounded mb-1"></div>
                    <div className="h-3 w-10 bg-brand-elevated rounded"></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <div className="h-8 w-24 bg-brand-elevated rounded mb-2"></div>
                  <div className="h-4 w-32 bg-brand-elevated rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredPairs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-brand-muted">
            No markets found matching "{searchQuery}"
          </div>
        ) : (
          filteredPairs.map((pair) => {
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
                      <p className="text-xs text-brand-muted opacity-80">{pair.symbol === 'XAU/USD' ? 'Commodity' : 'Forex'}</p>
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
                      {isPositive ? '+' : ''}{pair.change.toFixed(4)} ({isPositive ? '+' : ''}{pair.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-brand-muted opacity-80 mb-0.5">Spread</p>
                    <p className="text-sm font-medium text-brand-text">{pair.spread ? pair.spread : '—'}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
