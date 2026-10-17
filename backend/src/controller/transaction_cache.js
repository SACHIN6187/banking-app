
const net = require('net');
class CacheTransaction {
  constructor() {
    this.data = new Map();
  }

  insert(accountNo, detail) {
    this.data.set(accountNo, {value: detail, expiry: Date.now() + 8000});
  }

  search(accountNo) {
    const entry = this.data.get(accountNo);

    if (!entry) return 'NOT_FOUND';

    if (Date.now() >= entry.expiry) {
      this.data.delete(accountNo);
      return 'NOT_FOUND';
    }

    return entry.value;
  }
}

const myCache = new CacheTransaction();
const PORT = Number(process.env.TRANSACTION_CACHE_PORT || 6303);

const server = net.createServer((socket) => {
  let buffer = '';

  socket.on('data', (chunk) => {
    buffer += chunk.toString();

    if (!buffer.includes('\n')) return;

    const request = buffer.trim();
    buffer = '';

    const parts = request.match(/^(\S+)\s+(\S+)(?:\s+([\s\S]+))?$/);
    const command = parts?.[1];
    const accountNo = parts?.[2];
    const detail = parts?.[3];

    if (command === 'GET' && detail === undefined) {
      const result = myCache.search(accountNo);
      socket.end(result + '\n');

    } else if (command === 'SET' && detail !== undefined) {
      myCache.insert(accountNo, detail);
      socket.end('OK\n');

    } else {
      socket.end('ERROR\n');
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Cache server running on port ${PORT}...`);
});
