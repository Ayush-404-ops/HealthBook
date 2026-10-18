const { expireHolds } = require('./services/holds');

let schedulerInterval = null;

/**
 * Runs recurring maintenance tasks
 */
const runScheduledTasks = async () => {
  try {
    const expiredCount = expireHolds();
    if (expiredCount > 0) {
      // Cleaned up expired slot holds
    }
  } catch (err) {
    console.error('Error during scheduled maintenance run:', err);
  }
};

/**
 * Starts the scheduler loop
 */
const startScheduler = (intervalMs = 60000) => {
  if (schedulerInterval) return schedulerInterval;

  schedulerInterval = setInterval(() => {
    runScheduledTasks();
  }, intervalMs);

  // Unref so the interval does not prevent the Node process from exiting
  if (typeof schedulerInterval.unref === 'function') {
    schedulerInterval.unref();
  }

  return schedulerInterval;
};

/**
 * Stops the scheduler loop and clears intervals
 */
const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  runScheduledTasks,
};
