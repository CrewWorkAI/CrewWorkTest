import { Worker, Job } from 'bullmq';
import connection from '../redisClient';
import pool from '../db';

/**
 * Worker that processes `daily-winner` jobs. Each job contains a `date`
 * (YYYY‑MM‑DD) string for which the daily winner should be calculated.
 * The worker queries the `daily_points` table and inserts the top user
 * into the `daily_winners` table.
 */
const worker = process.env.USE_REDIS === '1'
  ? new Worker(
      'daily-winner',
      async (job: Job) => {
    const { date } = job.data as { date: string };
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Find the user with the highest points for the given date
      const res = await client.query(
        `SELECT user_id, points FROM daily_points WHERE date = $1 ORDER BY points DESC LIMIT 1`,
        [date]
      );
      if (res.rows.length > 0) {
        const { user_id, points } = res.rows[0];
        await client.query(
          `INSERT INTO daily_winners(date, winner_user_id, points) VALUES ($1, $2, $3)\n` +
            `ON CONFLICT (date) DO UPDATE SET winner_user_id = EXCLUDED.winner_user_id, points = EXCLUDED.points`,
          [date, user_id, points]
        );
      }
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
       * Dummy worker mimicking the event interface of bullmq's Worker.
       */
      on: () => {},
    };

worker.on('completed', (job) => console.log(`Daily winner job ${job.id} completed`));
worker.on('failed', (job, err) => console.error('Daily winner job failed:', err));

export default worker;
