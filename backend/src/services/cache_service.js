const net = require('net');

const HOST = (process.env.HOST_IP || '127.0.0.1').trim();
const PORT = Number(process.env.CACHE_PORT);

function sendCommand(command, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let response = '';
    let finished = false;

    function cleanup() {
      try {
        client.destroy();
      } catch (error) {
        // ignore cleanup errors
      }
    }

    client.setTimeout(timeout, () => {
      if (!finished) {
        finished = true;
        cleanup();
        reject(new Error('Cache server timeout'));
      }
    });

    client.connect(PORT, HOST, () => {
      client.write(command);
    });

    client.on('data', (data) => {
      response += data.toString();
      const newlineIndex = response.indexOf('\n');
      if (newlineIndex !== -1) {
        if (!finished) {
          finished = true;
          cleanup();
          resolve(response.slice(0, newlineIndex).trim());
        }
      }
    });

    client.on('error', (err) => {
      if (!finished) {
        finished = true;
        cleanup();
        reject(err);
      }
    });

    client.on('close', () => {
      if (!finished) {
        finished = true;
        cleanup();
        resolve(response.trim());
      }
    });
  });
}

async function get(accountNo) {
  try {
    const response = await sendCommand(`GET ${accountNo}\n`);
    if (!response || response === 'NOT_FOUND' || response === 'ERROR') {
      return -1;
    }

    const n = Number(response);
    return Number.isFinite(n) ? n : -1;
  } catch (error) {
    return -1;
  }
}

async function set(accountNo, balance) {
  try {
    const response = await sendCommand(`SET ${accountNo} ${balance}\n`);
    if (response !== 'OK') {
      console.error('Cache set error:', response);
    }
  } catch (error) {
    console.error(
        'Cache set error:', error && error.message ? error.message : error);
  }
}

module.exports = {
  get,
  set
};