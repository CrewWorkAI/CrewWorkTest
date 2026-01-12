"use strict";
const { Queue } = require("bullmq");
const redisClient = require("./redisClient").default;
const dailyWinnerQueue = new Queue('daily-winner', {
    connection: redisClient,
});
function scheduleDailyWinnerJob() {
    const now = new Date();
    const nextMidnight = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );
    const delayMs = Math.max(nextMidnight.getTime() - now.getTime(), 0);
    const enqueue = () => {
        const date = new Date().toISOString().slice(0, 10);
        dailyWinnerQueue.add('daily', { date });
        console.log(`Scheduled daily winner job for ${date}`);
    };
    setTimeout(() => {
        enqueue();
        setInterval(enqueue, 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`Daily winner job will run in ${Math.round(delayMs / 1000)} seconds`);
}
module.exports = { scheduleDailyWinnerJob };
