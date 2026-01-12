import { Queue } from 'bullmq';
import connection from './redisClient';

/**
 * Queue that receives jobs to compute daily leaderboard winners.
 * When Redis is not available (i.e., in test environments), a lightweight
 * stub is used that simply discards jobs. This prevents the server from
 * attempting to connect to a non‑existent Redis instance.
 */
let dailyWinnerQueue: any;
if (process.env.USE_REDIS === '1') {
  dailyWinnerQueue = new Queue('daily-winner', {
    connection,
  });
} else {
  dailyWinnerQueue = {
    add: () => Promise.resolve(undefined),
  };
}

/**
 * Schedule a job that adds a `daily-winner` job to the queue once per
 * day at UTC midnight.  The job payload contains the date string
 * (`YYYY-MM-DD`).
 */
export function scheduleDailyWinnerJob() {
  const now = new Date();
  // Compute next UTC midnight
  const nextMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  const delay = nextMidnight.getTime() - now.getTime();
  const delayMs = Math.max(delay, 0);

  const enqueue = () => {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    dailyWinnerQueue.add('daily', { date });
    console.log(`Scheduled daily winner job for ${date}`);
  };

  // Schedule first run
  setTimeout(() => {
    enqueue();
    // Every 24h thereafter
    setInterval(enqueue, 24 * 60 * 60 * 1000);
  }, delayMs);
  console.log(
    `Daily winner job will run in ${Math.round(delayMs / 1000)} seconds`
  );
}
