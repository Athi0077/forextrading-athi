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
    
    // Subscribe to all 8 supported markets
    const subscribeMsg = {
      action: 'subscribe',
      params: {
        symbols: 'EUR/USD,GBP/USD,USD/JPY,USD/CHF,AUD/USD,USD/CAD,NZD/USD,XAU/USD'
      }
    };
    
    tdWs.send(JSON.stringify(subscribeMsg));
  });

  tdWs.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.status === 'error') {
        console.error('Twelve Data server error message:', parsed);
      }
      
      if (parsed.event === 'price') {
        const tick = {
          symbol: parsed.symbol,
          price: parsed.price,
          timestamp: parsed.timestamp,
        };
        
        // Broadcast to all connected clients
        io.emit('price_update', tick);
      } else if (parsed.event === 'heartbeat') {
        // Handle heartbeat silently or respond if necessary
      } else if (parsed.event !== 'price' && parsed.event !== 'heartbeat') {
        console.log('Twelve Data msg:', parsed);
      }
    } catch (err) {
      console.error('Error parsing Twelve Data WS message:', err);
    }
  });

  tdWs.on('error', (err) => {
    console.error('Twelve Data WebSocket error:', err);
  });

  tdWs.on('close', (code, reason) => {
    console.log('Twelve Data WebSocket closed:');
    console.log('code:', code);
    console.log('reason:', reason ? reason.toString() : '');
    console.log('intentionalClose:', code === 1000 || code === 1001 || code === 1005);
    console.log('subscriptions:', 'EUR/USD,GBP/USD,USD/JPY,USD/CHF,AUD/USD,USD/CAD,NZD/USD,XAU/USD');
    console.log('activeConnections:', 1);
    console.log('Reconnecting in 5s...');
    setTimeout(connectTwelveData, 5000);
  });
}

module.exports = {
  initSocketServer
};
