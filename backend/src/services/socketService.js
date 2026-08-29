const { Server } = require('socket.io');
const WebSocket = require('ws');
const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.TWELVE_DATA_API_KEY;

let io;
let tdWs;

function initSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'https://forextrading-athi.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected to Socket.io:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Initialize connection to Twelve Data
  connectTwelveData();
}

function connectTwelveData() {
  if (!API_KEY) {
    console.error('TWELVE_DATA_API_KEY not found. Cannot start live websocket.');
    return;
  }

  tdWs = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`);

  tdWs.on('open', () => {
    console.log('Connected to Twelve Data WebSocket');
    
    // Subscribe to XAU/USD
    const subscribeMsg = {
      action: 'subscribe',
      params: {
        symbols: 'XAU/USD'
      }
    };
    
    tdWs.send(JSON.stringify(subscribeMsg));
  });

  tdWs.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.event === 'price' && parsed.symbol === 'XAU/USD') {
        const tick = {
          symbol: parsed.symbol,
          price: parsed.price,
          timestamp: parsed.timestamp,
        };
        
        // Broadcast to all connected clients
        io.emit('price_update', tick);
      } else if (parsed.event === 'heartbeat') {
        // Handle heartbeat silently or respond if necessary
      }
    } catch (err) {
      console.error('Error parsing Twelve Data WS message:', err);
    }
  });

  tdWs.on('error', (err) => {
    console.error('Twelve Data WebSocket error:', err);
  });

  tdWs.on('close', () => {
    console.log('Twelve Data WebSocket closed. Reconnecting in 5s...');
    setTimeout(connectTwelveData, 5000);
  });
}

module.exports = {
  initSocketServer
};
