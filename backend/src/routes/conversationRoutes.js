const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  getConversations, 
  createConversation, 
  getConversation, 
  deleteConversation,
  getMessages
} = require('../controllers/conversationController');
const { processChatMessage } = require('../controllers/aiController');

router.use(authMiddleware);

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.route('/:conversationId')
  .get(getConversation)
  .delete(deleteConversation);

router.route('/:conversationId/messages')
  .get(getMessages)
  .post(processChatMessage); // Or separate logic if required

module.exports = router;
