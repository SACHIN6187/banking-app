
const net = require('net');

class Cache {
  constructor() {
    this.data = new Map();
  }

  insert(accountNo, detail) {
    this.data.set(
        accountNo, {value: Number(detail), expiry: Date.now() + 4000});
  }

  search(accountNo) {
    const entry = this.data.get(accountNo);

    if (!entry) return -1;

    if (Date.now() >= entry.expiry) {
      this.data.delete(accountNo);
      return -1;
    }

    return entry.value;
  }

  remove(accountNo) {
    this.data.delete(accountNo);
  }
}

const myCache = new Cache();
const PORT = process.env.CACHE_PORT;

const server = net.createServer((socket) => {
  console.log('Client connected!');

  let buffer = '';

  socket.on('data', (chunk) => {
    buffer += chunk.toString();

    if (!buffer.includes('\n')) return;

    const request = buffer.trim();
    buffer = '';

    console.log('Received:', request);

    const parts = request.split(/\s+/);
    const command = parts[0];

    if (command === 'GET' && parts.length === 2) {
      const balance = myCache.search(parts[1]);
      socket.end(String(balance));
    } else if (command === 'SET' && parts.length === 3) {
      const accountNo = parts[1];
      const amount = Number(parts[2]);

      if (!Number.isFinite(amount)) {
        socket.end('ERROR');
        return;
      }

      myCache.insert(accountNo, amount);
      socket.end('OK');
    } else if (command === 'DELETE' && parts.length === 2) {
      myCache.remove(parts[1]);
      socket.end('OK');
    } else {
      socket.end('ERROR');
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Cache server running on port ${PORT}...`);
});
