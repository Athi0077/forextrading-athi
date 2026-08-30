import { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import socketClient from '../../services/socketClient';
import { normalizeSymbol } from '../../utils/marketUtils';

export default function CandlestickChart({ candles, isLoading, error, syncTimestamp, plotData, symbol, previousClose }) {
  const [chartType, setChartType] = useState('candlestick');
  
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const priceLinesRef = useRef([]);
  const prevCloseLineRef = useRef(null);
  const candlesRef = useRef([]);

  useEffect(() => {
    candlesRef.current = candles ? [...candles] : [];
  }, [candles]);

  useEffect(() => {
    const selectedSymbol = normalizeSymbol(symbol);
    
    const unsubscribe = socketClient.onPriceUpdate((tick) => {
      if (!candlestickSeriesRef.current || !areaSeriesRef.current || !candlesRef.current || candlesRef.current.length === 0) return;
      if (!selectedSymbol || !tick?.symbol) return;
      
      const tickSymbol = normalizeSymbol(tick.symbol);
      if (tickSymbol !== selectedSymbol) return;
      
      const price = Number(tick.price);
      if (!Number.isFinite(price)) return;
      
      const lastCandle = candlesRef.current[candlesRef.current.length - 1];
      
      // Update the current candle with the live tick
      const updatedCandle = { ...lastCandle };
      updatedCandle.close = price;
      if (price > updatedCandle.high) updatedCandle.high = price;
      if (price < updatedCandle.low) updatedCandle.low = price;
      
      candlestickSeriesRef.current.update(updatedCandle);
      areaSeriesRef.current.update({ time: updatedCandle.time, value: price });
      
      // Mutate our ref so the next tick builds on it
      candlesRef.current[candlesRef.current.length - 1] = updatedCandle;
    });

    return () => unsubscribe();
  }, [symbol]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !areaSeriesRef.current) return;
    
    // Immediately clear data on symbol change
    candlesRef.current = [];
    candlestickSeriesRef.current.setData([]);
    areaSeriesRef.current.setData([]);
    candlestickSeriesRef.current.setMarkers([]);
    areaSeriesRef.current.setMarkers([]);
    
    if (priceLinesRef.current.length > 0) {
      const activeSeries = chartType === 'candlestick' ? candlestickSeriesRef.current : areaSeriesRef.current;
      priceLinesRef.current.forEach(line => {
        try { activeSeries.removePriceLine(line); } catch(e){}
      });
      priceLinesRef.current = [];
    }
  }, [symbol]); // removed chartType to avoid clearing on type toggle

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
      visible: chartType === 'candlestick',
    });
    
    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(34, 197, 94, 0.4)',
      bottomColor: 'rgba(34, 197, 94, 0.0)',
      lineColor: '#22c55e',
      lineWidth: 2,
      visible: chartType === 'area',
    });

    candlestickSeriesRef.current = candlestickSeries;
    areaSeriesRef.current = areaSeries;

    if (candles && candles.length > 0) {
      candlestickSeries.setData(candles);
      const areaData = candles.map(c => ({ time: c.time, value: c.close }));
      areaSeries.setData(areaData);
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

  // Handle Chart Type Toggle Visibility
  useEffect(() => {
    if (candlestickSeriesRef.current && areaSeriesRef.current) {
      candlestickSeriesRef.current.applyOptions({ visible: chartType === 'candlestick' });
      areaSeriesRef.current.applyOptions({ visible: chartType === 'area' });
    }
  }, [chartType]);

  // Handle Dynamic Area Chart Coloring based on Bullish/Bearish
  useEffect(() => {
    if (!areaSeriesRef.current || !candles || candles.length === 0) return;
    
    const latestClose = candles[candles.length - 1].close;
    const refPrice = previousClose || candles[0].open;
    const isBullish = latestClose >= refPrice;
    
    areaSeriesRef.current.applyOptions({
      topColor: isBullish ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      bottomColor: isBullish ? 'rgba(34, 197, 94, 0.0)' : 'rgba(239, 68, 68, 0.0)',
      lineColor: isBullish ? '#22c55e' : '#ef4444',
    });
  }, [candles, previousClose]);

  // Handle Previous Close Line
  useEffect(() => {
    if (!areaSeriesRef.current) return;
    
    if (prevCloseLineRef.current) {
      try { areaSeriesRef.current.removePriceLine(prevCloseLineRef.current); } catch(e){}
      prevCloseLineRef.current = null;
    }
    
    if (previousClose && chartType === 'area') {
      prevCloseLineRef.current = areaSeriesRef.current.createPriceLine({
        price: previousClose,
        color: '#94a3b8',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'PREV CLOSE',
      });
    }
  }, [previousClose, chartType]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !areaSeriesRef.current) return;

    const nextCandles = candles ? [...candles] : [];
    candlesRef.current = nextCandles;

    if (nextCandles.length > 0) {
      candlestickSeriesRef.current.setData(nextCandles);
      const areaData = nextCandles.map(c => ({ time: c.time, value: c.close }));
      areaSeriesRef.current.setData(areaData);
      
      if (!syncTimestamp && !plotData) {
        chartRef.current?.timeScale().fitContent();
      }
    } else {
      candlestickSeriesRef.current.setData([]);
      areaSeriesRef.current.setData([]);
    }
  }, [candles, symbol, syncTimestamp, plotData]);

  useEffect(() => {
    const activeSeries = chartType === 'candlestick' ? candlestickSeriesRef.current : areaSeriesRef.current;
    if (!activeSeries) return;

    // Clear existing lines from ALL series to avoid duplicates when switching
    if (priceLinesRef.current.length > 0) {
      priceLinesRef.current.forEach(line => {
        try { candlestickSeriesRef.current?.removePriceLine(line); } catch(e){}
        try { areaSeriesRef.current?.removePriceLine(line); } catch(e){}
      });
      priceLinesRef.current = [];
    }

    if (plotData) {
      const { entry, stopLoss, takeProfit, takeProfit1 } = plotData;
      const tp = takeProfit || takeProfit1;

      if (entry) {
        priceLinesRef.current.push(activeSeries.createPriceLine({
          price: parseFloat(entry),
          color: '#3b82f6', // blue
          lineWidth: 2,
          lineStyle: 0,
          axisLabelVisible: true,
          title: 'ENTRY',
        }));
      }
      if (stopLoss) {
        priceLinesRef.current.push(activeSeries.createPriceLine({
          price: parseFloat(stopLoss),
          color: '#ef4444', // red
          lineWidth: 2,
          lineStyle: 2, // dashed
          axisLabelVisible: true,
          title: 'SL',
        }));
      }
      if (tp) {
        priceLinesRef.current.push(activeSeries.createPriceLine({
          price: parseFloat(tp),
          color: '#22c55e', // green
          lineWidth: 2,
          lineStyle: 2, // dashed
          axisLabelVisible: true,
          title: 'TP',
        }));
      }
    }
  }, [plotData, chartType]);

  useEffect(() => {
    const activeSeries = chartType === 'candlestick' ? candlestickSeriesRef.current : areaSeriesRef.current;
    const inactiveSeries = chartType === 'candlestick' ? areaSeriesRef.current : candlestickSeriesRef.current;
    
    if (inactiveSeries) {
      try { inactiveSeries.setMarkers([]); } catch(e) {}
    }

    if (syncTimestamp && chartRef.current && activeSeries && candles && candles.length > 0) {
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
        
        activeSeries.setMarkers([
          {
            time: candles[targetIndex].time,
            position: 'aboveBar',
            color: '#fbbf24',
            shape: 'arrowDown',
            text: 'AI Signal'
          }
        ]);
      }
    } else if (!syncTimestamp && activeSeries) {
      activeSeries.setMarkers([]);
    }
  }, [syncTimestamp, candles, chartType]);

  return (
    <div className="absolute inset-0">
      
      {/* Chart Type Toggle UI */}
      <div className="absolute top-4 right-4 z-20 flex bg-brand-elevated border border-brand-border rounded-lg p-1 shadow-md">
        <button 
          onClick={() => setChartType('candlestick')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartType === 'candlestick' ? 'bg-brand-surface text-brand-purple shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
        >
          Candlestick
        </button>
        <button 
          onClick={() => setChartType('area')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartType === 'area' ? 'bg-brand-surface text-brand-purple shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
        >
          Area
        </button>
      </div>

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
