const SupportTicket = require('../models/SupportTicket');

const generateTicketNumber = () => {
  return 'TKT-' + Math.floor(100000 + Math.random() * 900000);
};

const createTicket = async (req, res, next) => {
  try {
    const { name, email, category, subject, message } = req.body;
    
    const ticket = await SupportTicket.create({
      userId: req.user.id,
      ticketNumber: generateTicketNumber(),
      name,
      email,
      category,
      subject,
      message
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const getUserTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

const getTicketDetails = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getTicketDetails
};
