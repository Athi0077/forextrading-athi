const User = require('../../models/User');
const Trade = require('../../models/Trade');
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const { callAdminOpenRouter } = require('../../services/adminOpenRouterService');
const { generateChatTitle } = require('../../services/openRouterService');

exports.chatWithAdminAi = async (req, res, next) => {
  try {
    const { messages, commissionPercentage = 20, conversationId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Messages array is required.' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId: req.user.id });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        userId: req.user.id,
        title: 'New Admin Chat',
        type: 'admin'
      });
    }

    // Save user's message
    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage && latestUserMessage.role === 'user') {
      await Message.create({
        conversationId: conversation._id,
        userId: req.user.id,
        role: 'user',
        content: latestUserMessage.content
      });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Recent users (created within last 7 days)
    const recentUsersCount = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // 2. Offline users (not online, or lastSeen > 24h)
    const offlineUsersCount = await User.countDocuments({
      $or: [
        { isOnline: false },
        { lastSeen: { $lt: oneDayAgo } }
      ]
    });

    // 3. Long offline users (lastSeen > 7 days)
    const longOfflineUsersCount = await User.countDocuments({
      lastSeen: { $lt: sevenDaysAgo }
    });

    // 4. Blocked users
    const blockedUsersCount = await User.countDocuments({ status: 'blocked' });

    // 5. Total User Profit & Admin Commission
    // Aggregate total PnL from all CLOSED trades.
    // If a trade has exitPrice, it's closed.
    const trades = await Trade.find({ status: 'CLOSED' }).populate('userId', 'name email');
    let totalUserProfit = 0;
    const userProfits = {};
    
    trades.forEach(trade => {
      const multiplier = trade.pair.includes('JPY') ? 1000 : 100000;
      let profit = 0;
      if (trade.type === 'BUY') {
        profit = (trade.exitPrice - trade.entryPrice) * multiplier * trade.lotSize;
      } else {
        profit = (trade.entryPrice - trade.exitPrice) * multiplier * trade.lotSize;
      }
      totalUserProfit += profit;

      const userName = trade.userId ? trade.userId.name : 'Unknown User';
      if (!userProfits[userName]) {
        userProfits[userName] = 0;
      }
      userProfits[userName] += profit;
    });

    // 6. Recent Trading Activity
    const recentActivity = [];
    const recentTradesRaw = await Trade.find().sort({ createdAt: -1 }).limit(20).populate('userId', 'name');
    recentTradesRaw.forEach(t => {
       const userName = t.userId ? t.userId.name : 'Unknown User';
       recentActivity.push(`${userName} ${t.type} ${t.pair} at ${t.entryPrice} (Status: ${t.status})`);
    });

    // Admin profit is calculated based on the total user profit (only if > 0, or we take commission on all wins? Let's just do percentage of total profit for simplicity).
    const adminProfit = totalUserProfit > 0 ? (totalUserProfit * (commissionPercentage / 100)) : 0;

    const adminContext = {
      timestamp: new Date().toISOString(),
      commissionPercentage,
      statistics: {
        recentUsersCount,
        offlineUsersCount,
        longOfflineUsersCount,
        blockedUsersCount,
        totalUserProfit: totalUserProfit.toFixed(2),
        calculatedAdminProfit: adminProfit.toFixed(2),
        profitPerUser: userProfits,
        recentTradingActivity: recentActivity
      }
    };

    const aiResponseContent = await callAdminOpenRouter(messages, adminContext);

    // Save AI's response
    const aiMsg = await Message.create({
      conversationId: conversation._id,
      userId: req.user.id,
      role: 'assistant',
      content: aiResponseContent
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    // Auto-generate title if it's the default
    if (conversation.title === 'New Admin Chat' && latestUserMessage) {
      generateChatTitle(latestUserMessage.content).then(newTitle => {
        if (newTitle && newTitle !== "XAU/USD Chat") {
          conversation.title = newTitle;
          conversation.save().catch(err => console.error("Failed to save admin chat title:", err));
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: aiMsg._id,
        conversationId: conversation._id,
        role: 'assistant',
        content: aiResponseContent,
        createdAt: aiMsg.createdAt
      }
    });

  } catch (error) {
    console.error('Error in Admin AI chat:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process AI chat.' });
  }
};
