
const net = require('net');

class RateLimiter {
  constructor() {
    this.requestLimit = 10;
    this.data = new Map();
  }

  check(token) {
    const now = Date.now();

    if (!this.data.has(token)) {
      this.data.set(token, []);
    }

    const timestamps = this.data.get(token);

    while (timestamps.length > 0 && now >= timestamps[0] + 60 * 1000) {
      timestamps.shift();
    }

    if (timestamps.length >= this.requestLimit) {
      return false;
    }

    timestamps.push(now);
    return true;
  }
}

const limiter = new RateLimiter();

const port = Number(process.env.RATE_LIMITER_PORT);

const server = net.createServer((clientSocket) => {
  let request = '';

  clientSocket.on('data', (buffer) => {
    request += buffer.toString();

    if (request.includes('\n')) {
      const token = request.trim();

      const allowed = limiter.check(token);

      const response = allowed ? 'REQUEST_ALLOWED\n' : 'RATE_LIMIT_EXCEEDED\n';

      clientSocket.end(response);
    }
  });

  clientSocket.on('error', (err) => {
    console.error(
        'Client socket error:', err && err.message ? err.message : err);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Rate limiter running on port ${port}...`);
});
