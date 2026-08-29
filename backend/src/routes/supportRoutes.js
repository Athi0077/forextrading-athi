const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createTicket, getUserTickets, getTicketDetails } = require('../controllers/supportController');

router.use(authMiddleware);

router.post('/', createTicket);
router.get('/', getUserTickets);
router.get('/:id', getTicketDetails);

module.exports = router;
