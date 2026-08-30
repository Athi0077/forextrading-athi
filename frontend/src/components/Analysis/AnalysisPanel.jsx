import { cn } from '../../utils/cn';

export default function AnalysisPanel({ analysis }) {
  if (!analysis) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-brand-gold rounded-full animate-spin mb-4"></div>
        <p>Loading deterministic analysis...</p>
      </div>
    );
  }

  const { finalSignal, signalConfidence, entry, entryZone, stopLoss, takeProfit1, takeProfit2, riskRewardRatio, timeframes, warnings } = analysis;

  const isWait = finalSignal === 'WAIT';

  const renderSignalIcon = (signal) => {
    switch (signal) {
      case 'BULLISH':
      case 'BUY':
        return '🟢';
      case 'BEARISH':
      case 'SELL':
        return '🔴';
      default:
        return '🟡';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Current Price */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 text-center">
        <p className="text-sm text-slate-400 mb-1">CURRENT PRICE</p>
        <p className="text-3xl font-bold text-brand-text">{analysis.currentPrice?.toFixed(2)}</p>
      </div>

      {/* Timeframes Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-1">15M</p>
          <p className="text-sm font-medium text-slate-200">
            {renderSignalIcon(timeframes['15m'].signal)} {timeframes['15m'].signal}
          </p>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-1">5M</p>
          <p className="text-sm font-medium text-slate-200">
            {renderSignalIcon(timeframes['5m'].signal)} {timeframes['5m'].signal}
          </p>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-1">1M</p>
          <p className="text-sm font-medium text-slate-200">
            {renderSignalIcon(timeframes['1m'].signal)} {timeframes['1m'].signal}
          </p>
        </div>
      </div>

      {/* Final Signal */}
      <div className={cn(
        "rounded-xl p-6 border text-center relative overflow-hidden",
        finalSignal === 'BUY' ? "bg-green-500/10 border-green-500/30" : 
        finalSignal === 'SELL' ? "bg-red-500/10 border-red-500/30" :
        "bg-yellow-500/10 border-yellow-500/30"
      )}>
        <p className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">Final Signal</p>
        <p className="text-4xl font-black mb-2 flex items-center justify-center gap-3">
          {renderSignalIcon(finalSignal)} {finalSignal}
        </p>
        {!isWait && (
          <div className="mt-4 bg-slate-950/50 rounded-lg p-2 inline-block">
            <span className="text-xs text-slate-400">Signal Confidence: </span>
            <span className="text-sm font-bold text-brand-text">{signalConfidence}</span>
          </div>
        )}
      </div>

      {/* Trade Parameters */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className="text-sm text-slate-400">Entry</span>
          <span className="font-semibold text-brand-text">{isWait ? 'Waiting' : entry?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className="text-sm text-slate-400">Stop Loss</span>
          <span className="font-semibold text-red-400">{isWait ? '—' : stopLoss?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className="text-sm text-slate-400">TP1</span>
          <span className="font-semibold text-green-400">{isWait ? '—' : takeProfit1?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className="text-sm text-slate-400">TP2</span>
          <span className="font-semibold text-green-500">{isWait ? '—' : takeProfit2?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Risk/Reward</span>
          <span className="font-semibold text-brand-gold">{isWait ? '—' : `1:${riskRewardRatio}`}</span>
        </div>
      </div>

      {/* Warnings & Reasons */}
      {warnings && warnings.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <p className="text-xs font-semibold text-orange-400 mb-2 uppercase">Warnings</p>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
