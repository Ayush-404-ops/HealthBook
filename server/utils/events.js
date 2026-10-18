const { EventEmitter } = require('events');

class AppEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow multiple listeners without memory leak warning during testing
    this.setMaxListeners(50);
  }

  publish(event, payload) {
    const data = {
      event,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.emit(event, data);
    this.emit('event', data);
  }
}

const eventBus = new AppEventBus();

const EVENTS = {
  SLOT_HELD: 'slot:held',
  SLOT_RELEASED: 'slot:released',
  APPOINTMENT_CREATED: 'appointment:created',
  APPOINTMENT_CANCELLED: 'appointment:cancelled',
  APPOINTMENT_RESCHEDULED: 'appointment:rescheduled',
  APPOINTMENT_STATUS: 'appointment:status',
  NOTIFICATION: 'notification:created',
};

module.exports = {
  eventBus,
  EVENTS,
};
