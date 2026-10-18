const Notification = require('../models/Notification');
const { eventBus, EVENTS } = require('../utils/events');

/**
 * Creates an in-app notification and emits event
 */
const createNotification = async ({ userId, type = 'info', title = '', message, metadata = {} }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      metadata,
    });

    eventBus.publish(EVENTS.NOTIFICATION, {
      notificationId: notification._id,
      userId,
      type,
      title,
      message,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

/**
 * Sends/logs an email reminder simulation
 */
const sendEmailReminder = async ({ to, subject, text, html }) => {
  // Production would use nodemailer/SendGrid. For testing and university scope:
  const simulation = {
    to,
    subject,
    sentAt: new Date().toISOString(),
    status: 'delivered_simulated',
  };
  return simulation;
};

module.exports = {
  createNotification,
  sendEmailReminder,
};
