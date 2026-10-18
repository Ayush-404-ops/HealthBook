const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createHold,
  getHold,
  isSlotHeld,
  releaseHold,
  convertHold,
  expireHolds,
  clearAllHolds,
} = require('../services/holds');

test('Slots Service - hold timer and availability', async (t) => {
  t.beforeEach(() => {
    clearAllHolds();
  });

  await t.test('creates a slot hold successfully', () => {
    const hold = createHold({
      doctorId: 'doc123',
      date: '2026-11-01',
      startTime: '10:00',
      patientId: 'pat456',
      ttlMinutes: 5,
    });

    assert.ok(hold.holdId);
    assert.equal(hold.status, 'held');
    assert.equal(isSlotHeld('doc123', '2026-11-01', '10:00'), true);
  });

  await t.test('prevents another patient from holding the same slot', () => {
    createHold({
      doctorId: 'doc123',
      date: '2026-11-01',
      startTime: '10:00',
      patientId: 'pat456',
      ttlMinutes: 5,
    });

    assert.throws(
      () => {
        createHold({
          doctorId: 'doc123',
          date: '2026-11-01',
          startTime: '10:00',
          patientId: 'pat789',
          ttlMinutes: 5,
        });
      },
      {
        name: 'Error',
        message: 'Slot is currently held by another patient',
      }
    );
  });

  await t.test('releases hold correctly', () => {
    const hold = createHold({
      doctorId: 'doc123',
      date: '2026-11-01',
      startTime: '11:00',
      patientId: 'pat456',
    });

    const released = releaseHold(hold.holdId);
    assert.equal(released, true);
    assert.equal(isSlotHeld('doc123', '2026-11-01', '11:00'), false);
  });

  await t.test('converts hold on appointment booking', () => {
    const hold = createHold({
      doctorId: 'doc123',
      date: '2026-11-01',
      startTime: '12:00',
      patientId: 'pat456',
    });

    const converted = convertHold(hold.holdId);
    assert.equal(converted, true);
    assert.equal(isSlotHeld('doc123', '2026-11-01', '12:00'), false);
  });

  await t.test('expires overdue holds', () => {
    const hold = createHold({
      doctorId: 'doc123',
      date: '2026-11-01',
      startTime: '14:00',
      patientId: 'pat456',
      ttlMinutes: 0.0001, // expires immediately
    });

    // Artificially age the hold
    const retrieved = getHold(hold.holdId);
    retrieved.expiresAt = Date.now() - 1000;

    const count = expireHolds();
    assert.ok(count >= 1);
    assert.equal(isSlotHeld('doc123', '2026-11-01', '14:00'), false);
  });
});
