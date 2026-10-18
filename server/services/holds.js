const crypto = require('crypto');
const { eventBus, EVENTS } = require('../utils/events');

// In-memory slot holds store
const holds = new Map();

/**
 * Normalizes slot hold key
 */
const getSlotKey = (doctorId, date, startTime) => `${String(doctorId)}_${date}_${startTime}`;

/**
 * Creates a temporary hold on a doctor's slot
 */
const createHold = ({ doctorId, date, startTime, patientId, ttlMinutes = 5 }) => {
  const slotKey = getSlotKey(doctorId, date, startTime);
  const now = Date.now();

  // Check if active unexpired hold exists for another user
  const existingHoldId = holds.get(slotKey);
  if (existingHoldId) {
    const existing = holds.get(existingHoldId);
    if (existing && existing.expiresAt > now && existing.status === 'held') {
      if (String(existing.patientId) !== String(patientId)) {
        const error = new Error('Slot is currently held by another patient');
        error.code = 'SLOT_HELD';
        error.statusCode = 409;
        throw error;
      }
      // If same patient, refresh hold expiration
      existing.expiresAt = now + ttlMinutes * 60 * 1000;
      return existing;
    }
  }

  const holdId = crypto.randomUUID();
  const hold = {
    holdId,
    slotKey,
    doctorId: String(doctorId),
    date,
    startTime,
    patientId: String(patientId),
    createdAt: now,
    expiresAt: now + ttlMinutes * 60 * 1000,
    status: 'held',
  };

  holds.set(holdId, hold);
  holds.set(slotKey, holdId);

  eventBus.publish(EVENTS.SLOT_HELD, {
    holdId,
    doctorId: hold.doctorId,
    date: hold.date,
    startTime: hold.startTime,
    expiresAt: new Date(hold.expiresAt).toISOString(),
  });

  return hold;
};

/**
 * Retrieves hold by holdId
 */
const getHold = (holdId) => {
  return holds.get(holdId) || null;
};

/**
 * Checks if a slot is currently held
 */
const isSlotHeld = (doctorId, date, startTime, excludePatientId = null) => {
  const slotKey = getSlotKey(doctorId, date, startTime);
  const holdId = holds.get(slotKey);
  if (!holdId) return false;

  const hold = holds.get(holdId);
  if (!hold) return false;

  if (hold.status !== 'held' || hold.expiresAt <= Date.now()) {
    return false;
  }

  if (excludePatientId && String(hold.patientId) === String(excludePatientId)) {
    return false;
  }

  return true;
};

/**
 * Releases a hold explicitly
 */
const releaseHold = (holdId) => {
  const hold = holds.get(holdId);
  if (!hold || hold.status !== 'held') return false;

  hold.status = 'released';
  const currentSlotHoldId = holds.get(hold.slotKey);
  if (currentSlotHoldId === holdId) {
    holds.delete(hold.slotKey);
  }

  eventBus.publish(EVENTS.SLOT_RELEASED, {
    holdId,
    doctorId: hold.doctorId,
    date: hold.date,
    startTime: hold.startTime,
  });

  return true;
};

/**
 * Marks hold converted when booking completes
 */
const convertHold = (holdId) => {
  const hold = holds.get(holdId);
  if (!hold) return false;

  hold.status = 'converted';
  const currentSlotHoldId = holds.get(hold.slotKey);
  if (currentSlotHoldId === holdId) {
    holds.delete(hold.slotKey);
  }
  return true;
};

/**
 * Scans and expires overdue holds
 */
const expireHolds = () => {
  const now = Date.now();
  let expiredCount = 0;

  for (const [key, value] of holds.entries()) {
    // Only check hold objects
    if (typeof value === 'object' && value.status === 'held' && value.expiresAt <= now) {
      value.status = 'expired';
      const slotHoldId = holds.get(value.slotKey);
      if (slotHoldId === value.holdId) {
        holds.delete(value.slotKey);
      }

      eventBus.publish(EVENTS.SLOT_RELEASED, {
        holdId: value.holdId,
        doctorId: value.doctorId,
        date: value.date,
        startTime: value.startTime,
        reason: 'hold_expired',
      });

      expiredCount++;
    }
  }

  return expiredCount;
};

/**
 * Clears all holds (for tests or server resets)
 */
const clearAllHolds = () => {
  holds.clear();
};

module.exports = {
  createHold,
  getHold,
  isSlotHeld,
  releaseHold,
  convertHold,
  expireHolds,
  clearAllHolds,
  getSlotKey,
};
