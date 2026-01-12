import { Worker, Job } from 'bullmq';
import connection from '../redisClient';
import pool from '../db';

/**
 * Helper to compute ISO week start (Monday) for a given date.
 */
function getWeekStart(date: Date): string {
  const day = date.getUTCDay();
  // get offset to Monday (0 = Monday, 6 = Sunday)
  const diff = (day + 6) % 7;
  const weekStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - diff));
  return weekStart.toISOString().slice(0, 10);
}

// QueueScheduler is optional; if you require delayed job handling, add it.

// Only instantiate a real worker when redis is available. In test
// environments we fall back to a dummy no‑op worker to avoid connection
// errors. This matches the behavior of the queue implementation.
const worker = process.env.USE_REDIS === '1'
  ? new Worker(
      'score-aggregation',
      async (job: Job) => {
    const { winnerUserId, createdAt } = job.data as { winnerUserId: string; createdAt: string };
    const battleDate = new Date(createdAt);
    const day = battleDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const weekStart = getWeekStart(battleDate);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Daily aggregation
      await client.query(
        `INSERT INTO daily_points(user_id, date, points)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, date)
           DO UPDATE SET points = daily_points.points + 1`,
        [winnerUserId, day]
      );
      // Weekly aggregation
      await client.query(
        `INSERT INTO weekly_points(user_id, week_start, points)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, week_start)
           DO UPDATE SET points = weekly_points.points + 1`,
        [winnerUserId, weekStart]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
      },
      { connection }
    )
  : {
      /**
       * Dummy worker that satisfies the interface required by the rest of the
       * application. Listener registration is a no‑op; the worker never emits
       * events.
       */
      on: () => {},
    };

worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));

export default worker;
