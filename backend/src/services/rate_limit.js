const net = require('net');

const HOST = (process.env.HOST_IP || '127.0.0.1').trim();
const PORT = Number(process.env.RATE_LIMITER_PORT);

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
        reject(new Error('Rate limiter timeout'));
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
async function rate_check(token) {
  try {
    const response = await sendCommand(`${token}\n`);
    return response;
  } catch (error) {
    return -1;
  }
}
module.exports = {rate_check};