import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import socketClient from '../../services/socketClient';

export default function CandlestickChart({ candles, isLoading, error, syncTimestamp, plotData, symbol }) {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const priceLinesRef = useRef([]);
  const candlesRef = useRef([]);

  useEffect(() => {
    candlesRef.current = candles ? [...candles] : [];
  }, [candles]);

  useEffect(() => {
    const unsubscribe = socketClient.onPriceUpdate((tick) => {
      if (!seriesRef.current || !candlesRef.current || candlesRef.current.length === 0) return;
      if (symbol && tick.symbol && tick.symbol !== symbol) return;
      
      const price = parseFloat(tick.price);
      const lastCandle = candlesRef.current[candlesRef.current.length - 1];
      
      // Update the current candle with the live tick
      const updatedCandle = { ...lastCandle };
      updatedCandle.close = price;
      if (price > updatedCandle.high) updatedCandle.high = price;
      if (price < updatedCandle.low) updatedCandle.low = price;
      
      seriesRef.current.update(updatedCandle);
      
      // Mutate our ref so the next tick builds on it
      candlesRef.current[candlesRef.current.length - 1] = updatedCandle;
    });

    return () => unsubscribe();
  }, [symbol]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isLightMode = document.body.classList.contains('theme-light');
    const textColor = isLightMode ? '#64748b' : '#94a3b8';
    const gridColor = isLightMode ? '#e2e8f0' : '#1e293b';

    const chartOptions = {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: true,
      },
    };

    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });
    
    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    
    seriesRef.current = candlestickSeries;

    if (candles && candles.length > 0) {
      candlestickSeries.setData(candles);
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    const observer = new MutationObserver(() => {
      const light = document.body.classList.contains('theme-light');
      chart.applyOptions({
        layout: { textColor: light ? '#64748b' : '#94a3b8' },
        grid: {
          vertLines: { color: light ? '#e2e8f0' : '#1e293b' },
          horzLines: { color: light ? '#e2e8f0' : '#1e293b' },
        },
        timeScale: { borderColor: light ? '#e2e8f0' : '#1e293b' }
      });
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      chart.remove();
    };
  }, []); // Only run once on mount

  useEffect(() => {
    if (seriesRef.current && candles && candles.length > 0) {
      seriesRef.current.setData(candles);
      if (!syncTimestamp && !plotData) {
        chartRef.current?.timeScale().fitContent();
      }
    }
  }, [candles]);

  useEffect(() => {
    // Clear existing lines
    if (seriesRef.current && priceLinesRef.current.length > 0) {
      priceLinesRef.current.forEach(line => seriesRef.current.removePriceLine(line));
      priceLinesRef.current = [];
    }

    if (plotData && seriesRef.current) {
      const { entry, stopLoss, takeProfit, takeProfit1 } = plotData;
      
      const tp = takeProfit || takeProfit1;

      if (entry) {
        priceLinesRef.current.push(seriesRef.current.createPriceLine({
          price: parseFloat(entry),
          color: '#3b82f6', // blue
          lineWidth: 2,
          lineStyle: 0,
          axisLabelVisible: true,
          title: 'ENTRY',
        }));
      }

      if (stopLoss) {
        priceLinesRef.current.push(seriesRef.current.createPriceLine({
          price: parseFloat(stopLoss),
          color: '#ef4444', // red
          lineWidth: 2,
          lineStyle: 2, // dashed
          axisLabelVisible: true,
          title: 'SL',
        }));
      }

      if (tp) {
        priceLinesRef.current.push(seriesRef.current.createPriceLine({
          price: parseFloat(tp),
          color: '#22c55e', // green
          lineWidth: 2,
          lineStyle: 2, // dashed
          axisLabelVisible: true,
          title: 'TP',
        }));
      }
    }
  }, [plotData]);

  useEffect(() => {
    if (syncTimestamp && chartRef.current && seriesRef.current && candles && candles.length > 0) {
      const targetTime = new Date(syncTimestamp).getTime() / 1000;
      
      let targetIndex = -1;
      let minDiff = Infinity;
      
      candles.forEach((candle, idx) => {
        const diff = Math.abs(candle.time - targetTime);
        if (diff < minDiff) {
          minDiff = diff;
          targetIndex = idx;
        }
      });
      
      if (targetIndex !== -1) {
        const rangeSize = 60;
        chartRef.current.timeScale().setVisibleLogicalRange({
          from: targetIndex - rangeSize / 2,
          to: targetIndex + rangeSize / 2
        });
        
        seriesRef.current.setMarkers([
          {
            time: candles[targetIndex].time,
            position: 'aboveBar',
            color: '#fbbf24',
            shape: 'arrowDown',
            text: 'AI Signal'
          }
        ]);
      }
    } else if (!syncTimestamp && seriesRef.current) {
      seriesRef.current.setMarkers([]);
    }
  }, [syncTimestamp, candles]);

  return (
    <div className="absolute inset-0">
      <div ref={chartContainerRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-elevated/50 backdrop-blur-sm z-10">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-brand-gold rounded-full animate-spin"></div>
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-elevated/80 backdrop-blur-sm z-10 p-4">
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-center max-w-md">
            <p className="font-semibold mb-1">Error Loading Chart</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
