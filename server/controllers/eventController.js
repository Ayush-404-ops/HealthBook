const { eventBus, EVENTS } = require('../utils/events');

/**
 * SSE stream endpoint for real-time app events
 */
const streamEvents = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Ensure headers are immediately sent out
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  // Send initial connected handshake
  res.write(': connected\n\n');

  // Event handler for bus events
  const onBusEvent = (data) => {
    try {
      res.write(`event: ${data.event}\ndata: ${JSON.stringify(data.payload || data)}\n\n`);
    } catch (err) {
      // Stream write error
    }
  };

  eventBus.on('event', onBusEvent);

  // Periodic heartbeat
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (err) {
      cleanup();
    }
  }, 15000);

  // Unref heartbeat so it never prevents the node process from exiting
  if (typeof heartbeatInterval.unref === 'function') {
    heartbeatInterval.unref();
  }

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;

    clearInterval(heartbeatInterval);
    eventBus.removeListener('event', onBusEvent);

    if (!res.writableEnded) {
      res.end();
    }
  };

  req.on('close', cleanup);
  res.on('close', cleanup);
  req.on('end', cleanup);
  res.on('finish', cleanup);
  res.on('error', cleanup);
};

module.exports = {
  streamEvents,
};
