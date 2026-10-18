const test = require('node:test');
const assert = require('node:assert/strict');
const { startScheduler, stopScheduler, runScheduledTasks } = require('../scheduler');

test('Scheduler Service', async (t) => {
  await t.test('can run scheduled maintenance tasks without error', async () => {
    await assert.doesNotReject(async () => {
      await runScheduledTasks();
    });
  });

  await t.test('starts and stops scheduler cleanly without open handles', () => {
    const interval = startScheduler(1000);
    assert.ok(interval);

    stopScheduler();
    assert.doesNotThrow(() => {
      stopScheduler();
    });
  });
});
