import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://forextrading-athi.onrender.com';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('price_update', (data) => {
      const callbacks = this.listeners.get('price_update');
      if (callbacks) {
        callbacks.forEach(cb => cb(data));
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  onPriceUpdate(callback) {
    if (!this.listeners.has('price_update')) {
      this.listeners.set('price_update', new Set());
    }
    this.listeners.get('price_update').add(callback);

    if (!this.socket) {
      this.connect();
    }

    return () => {
      const callbacks = this.listeners.get('price_update');
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketClient = new SocketClient();
export default socketClient;
