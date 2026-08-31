const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Trade = require('../models/Trade');
const { callOpenRouter, generateChatTitle } = require('../services/openRouterService');
const { getCandles } = require('../services/twelveDataService');
const { analyzeTimeframe } = require('../services/analysis/timeframeAnalysis');
const { generateMultiTimeframeSignal } = require('../services/analysis/signalEngine');

const processChatMessage = async (req, res, next) => {
  try {
    const { message, symbol = 'XAU/USD', conversationId } = req.body;
    
    const SUPPORTED_SYMBOLS = [
      'EUR/USD',
      'GBP/USD',
      'USD/JPY',
      'USD/CHF',
      'AUD/USD',
      'USD/CAD',
      'NZD/USD',
      'XAU/USD'
    ];

    if (!SUPPORTED_SYMBOLS.includes(symbol)) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Unsupported symbol provided.' }});
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid message provided.' }});
    }
    if (!conversationId) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Conversation ID is required.' }});
    }

    // Validate or implicitly create conversation
    let conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id
    });

    if (!conversation) {
      conversation = await Conversation.create({
        _id: conversationId,
        userId: req.user.id,
        title: `${symbol} Chat`,
        symbol: symbol
      });
    }

    let marketContext = null;
    try {
      const [candles1m, candles5m, candles15m] = await Promise.all([
        getCandles(symbol, '1min', 100),
        getCandles(symbol, '5min', 100),
        getCandles(symbol, '15min', 100)
      ]);

      const tf15 = analyzeTimeframe(candles15m);
      const tf5 = analyzeTimeframe(candles5m);
      const tf1 = analyzeTimeframe(candles1m);

      if (tf15 && tf5 && tf1) {
        const signalData = generateMultiTimeframeSignal(tf15, tf5, tf1);
        
        delete tf15.candles;
        delete tf5.candles;
        delete tf1.candles;

        marketContext = {
          symbol,
          timestamp: new Date().toISOString(),
          currentPrice: tf1.currentPrice,
          "15m": tf15,
          "5m": tf5,
          "1m": tf1,
          ...signalData
        };
      }
    } catch (error) {
      console.warn(`Could not fetch live market data for ${symbol} AI context:`, error.message);
      
      return res.json({
        success: false,
        signal: "UNAVAILABLE",
        error: `Live market data for ${symbol} is currently unavailable. ` + error.message
      });
    }

    if (!marketContext) {
      return res.json({
        success: false,
        signal: "UNAVAILABLE",
        error: `Live market data for ${symbol} is currently unavailable.`
      });
    }

    // Fetch history
    const history = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(10);
      
    history.reverse();

    const aiMessages = history.map(h => ({
      role: h.role,
      content: h.role === 'assistant' ? (h.content || h.answer || '') : h.content
    }));

    aiMessages.push({ role: 'user', content: message });

    // Fetch User Data Context for Trade Journal questions
    let userDataContext = null;
    try {
      const user = await User.findById(req.user.id);
      const trades = await Trade.find({ userId: req.user.id }).sort({ entryDate: -1 });
      
      const closedTrades = trades.filter(t => t.status === 'CLOSED');
      const totalTrades = closedTrades.length;
      const totalPnL = closedTrades.reduce((acc, t) => acc + t.pnl, 0);
      const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
      const losingTrades = closedTrades.filter(t => t.pnl < 0).length;
      const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : 0;
      
      // Get a summary of the 10 most recent trades
      const recentTrades = trades.slice(0, 10).map(t => ({
        pair: t.pair,
        type: t.type,
        status: t.status,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        pnl: t.pnl,
        date: t.entryDate
      }));

      userDataContext = {
        userName: user?.name,
        currentBalance: user?.balance || 0,
        totalTrades,
        totalPnL,
        winningTrades,
        losingTrades,
        winRate: `${winRate}%`,
        recentTrades
      };
    } catch (err) {
      console.warn("Could not fetch user trade data for AI context:", err.message);
    }

    // Call AI Service
    const aiResponse = await callOpenRouter(aiMessages, marketContext, userDataContext);

    // Save to DB
    const userMsg = await Message.create({
      conversationId,
      userId: req.user.id,
      role: 'user',
      content: message
    });

    const aiMsg = await Message.create({
      conversationId,
      userId: req.user.id,
      role: 'assistant',
      content: aiResponse.reason || "I've analyzed the market conditions.",
      signal: aiResponse.signal || "WAIT",
      symbol: aiResponse.symbol || symbol,
      analysis: {
        timeframe: aiResponse.timeframe,
        marketCondition: aiResponse.marketCondition
      },
      tradePlan: {
        entry: aiResponse.entry,
        stopLoss: aiResponse.stopLoss,
        takeProfit1: aiResponse.takeProfit,
        takeProfit2: null,
        riskRewardRatio: aiResponse.riskReward,
        currentPrice: marketContext.currentPrice
      },
      showTradePlan: !!aiResponse.showTradePlan,
      warnings: []
    });

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await conversation.save();

    // Auto-generate title if it's the default (fire and forget)
    if (conversation.title === 'XAU/USD Chat' || conversation.title === 'New Chat' || conversation.title.endsWith(' Chat')) {
      generateChatTitle(message).then(newTitle => {
        if (newTitle && newTitle !== "XAU/USD Chat" && !newTitle.endsWith(' Chat')) {
          conversation.title = newTitle;
          conversation.save().catch(err => console.error("Failed to save auto-generated title:", err));
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: aiMsg._id,
        role: 'assistant',
        content: aiMsg.content,
        answer: aiMsg.content, // for frontend compatibility
        signal: aiResponse.signal,
        symbol: aiResponse.symbol || symbol,
        confidence: aiResponse.confidence,
        timeframe: aiResponse.timeframe,
        marketCondition: aiResponse.marketCondition,
        tradePlan: {
          entry: aiResponse.entry,
          stopLoss: aiResponse.stopLoss,
          takeProfit: aiResponse.takeProfit,
          riskReward: aiResponse.riskReward,
          currentPrice: marketContext.currentPrice
        },
        showTradePlan: !!aiResponse.showTradePlan,
        createdAt: aiMsg.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  processChatMessage
};
