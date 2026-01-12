"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const worker = new bullmq_1.Worker('score-aggregation', async (job) => {
    const { winnerUserId, createdAt } = job.data;
    const battleDate = new Date(createdAt);
    const day = battleDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const weekStart = getWeekStart(battleDate);
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        // Daily aggregation
        await client.query(`INSERT INTO daily_points(user_id, date, points)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, date)
           DO UPDATE SET points = daily_points.points + 1`, [winnerUserId, day]);
        // Weekly aggregation
        await client.query(`INSERT INTO weekly_points(user_id, week_start, points)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, week_start)
           DO UPDATE SET points = weekly_points.points + 1`, [winnerUserId, weekStart]);
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}, { connection: redisClient_1.default });
worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));
exports.default = worker;
