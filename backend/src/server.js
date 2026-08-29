require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const { initSocketServer } = require('./services/socketService');

const PORT = process.env.PORT || 5000;


// Initialize external connections
connectDB(); 
  
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io
initSocketServer(server);
