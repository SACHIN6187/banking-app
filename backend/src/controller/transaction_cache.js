
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

  remove(accountNo) {
    this.data.delete(accountNo);
  }
}

const myCache = new CacheTransaction();
const PORT = Number(process.env.TRANSACTION_CACHE_PORT || 6303);

const server = net.createServer((socket) => {
  let buffer = '';

  socket.on('data', (chunk) => {
    buffer += chunk.toString();

    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const request = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!request) continue;

      const parts = request.match(/^(\S+)\s+(\S+)(?:\s+([\s\S]+))?$/);
      const command = parts?.[1];
      const accountNo = parts?.[2];
      const detail = parts?.[3];

      if (command === 'GET' && detail === undefined) {
        socket.write(`${myCache.search(accountNo)}\n`);
      } else if (command === 'SET' && detail !== undefined) {
        myCache.insert(accountNo, detail);
        socket.write('OK\n');
      } else if (command === 'DELETE' && detail === undefined) {
        myCache.remove(accountNo);
        socket.write('OK\n');
      } else {
        socket.write('ERROR\n');
      }
    }
  });

  socket.on('end', () => {
    socket.end();
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Cache server running on port ${PORT}...`);
});
