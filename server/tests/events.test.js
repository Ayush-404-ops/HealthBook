const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const express = require('express');
const { eventBus, EVENTS } = require('../utils/events');
const { streamEvents } = require('../controllers/eventController');

test('SSE Events System', async (t) => {
  await t.test('eventBus publishes and receives events', (context, done) => {
    const handler = (data) => {
      assert.equal(data.payload.message, 'test');
      eventBus.removeListener('custom:test', handler);
      done();
    };

    eventBus.on('custom:test', handler);
    eventBus.publish('custom:test', { message: 'test' });
  });

  await t.test('SSE endpoint flushes headers and receives real-time events, then cleans up cleanly', async () => {
    const app = express();
    app.get('/events', streamEvents);

    const server = http.createServer(app);

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    await new Promise((resolve, reject) => {
      let clientReq;
      const timeout = setTimeout(() => {
        if (clientReq) clientReq.destroy();
        server.close();
        reject(new Error('SSE test timed out waiting for event'));
      }, 3000);

      clientReq = http.get(`http://127.0.0.1:${port}/events`, (res) => {
        assert.equal(res.statusCode, 200);
        assert.match(res.headers['content-type'], /text\/event-stream/);

        let receivedBuffer = '';

        res.on('data', (chunk) => {
          receivedBuffer += chunk.toString();

          // Once initial handshake is received, publish an event
          if (receivedBuffer.includes(': connected') && !receivedBuffer.includes('slot:held')) {
            eventBus.publish(EVENTS.SLOT_HELD, { slot: '10:00' });
          }

          // Once the published event is received, close client request and server
          if (receivedBuffer.includes('slot:held')) {
            clearTimeout(timeout);
            // Close client request to trigger disconnect handling
            clientReq.destroy();
            server.close(() => {
              resolve();
            });
          }
        });
      });

      clientReq.on('error', (err) => {
        // Destroy error after close is normal
        if (err.code === 'ECONNRESET') return;
      });
    });
  });
});
