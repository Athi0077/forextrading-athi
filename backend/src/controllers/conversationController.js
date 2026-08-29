const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .sort({ updatedAt: -1 });
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const { title, symbol } = req.body;
    
    const conversation = await Conversation.create({
      userId: req.user.id,
      title: title || 'New Chat',
      symbol: symbol || 'XAU/USD'
    });
    
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' }});
    }
    
    res.json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' }});
    }

    // Delete associated messages
    await Message.deleteMany({ conversationId });
    
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    
    // Validate ownership
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' }});
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  createConversation,
  getConversation,
  deleteConversation,
  getMessages
};
