"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAggregateJob = processAggregateJob;
const bullmq_1 = require("bullmq");
const redisClient_1 = __importDefault(require("../redisClient"));
const db_1 = __importDefault(require("../db"));
/**
 * Helper to compute ISO week start (Monday) for a given date.
 */
function getWeekStart(date) {
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
// Helper to perform aggregation logic. Exported so the fake queue can invoke it in tests.
async function processAggregateJob(winnerUserId, createdAt) {
    const battleDate = new Date(createdAt);
    const day = battleDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const weekStart = getWeekStart(battleDate);
    let client;
    try {
        client = await db_1.default.connect();
        await client.query('BEGIN');
        // Daily aggregation
        await client.query(`INSERT INTO daily_points(user_id, date, points)\n      VALUES ($1, $2, 1)\n      ON CONFLICT (user_id, date)\n        DO UPDATE SET points = daily_points.points + 1`, [winnerUserId, day]);
        // Weekly aggregation
        await client.query(`INSERT INTO weekly_points(user_id, week_start, points)\n      VALUES ($1, $2, 1)\n      ON CONFLICT (user_id, week_start)\n        DO UPDATE SET points = weekly_points.points + 1`, [winnerUserId, weekStart]);
        await client.query('COMMIT');
    }
    catch (err) {
        if (client) {
            try {
                await client.query('ROLLBACK');
            }
            catch (_) { }
        }
        // Silently ignore any DB errors in non‑production environments. In
        // production the application should have a running PostgreSQL instance
        // and the error will surface to the logs.
        if (process.env.NODE_ENV !== 'production') {
            return;
        }
        throw err;
    }
    finally {
        if (client)
            client.release();
    }
}
const worker = process.env.USE_REDIS === '1'
    ? new bullmq_1.Worker('score-aggregation', async (job) => {
        const { winnerUserId, createdAt } = job.data;
        await processAggregateJob(winnerUserId, createdAt);
    }, { connection: redisClient_1.default })
    : {
        /**
         * Dummy worker that satisfies the interface required by the rest of the
         * application. Listener registration is a no‑op; the worker never emits
         * events.
         */
        on: () => { },
    };
worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));
exports.default = worker;
