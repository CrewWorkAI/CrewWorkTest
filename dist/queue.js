"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreAggregationQueue = void 0;
const bullmq_1 = require("bullmq");
const redisClient_1 = __importDefault(require("./redisClient"));
const scoreAggregationWorker_1 = require("./workers/scoreAggregationWorker");
/**
 * A lightweight fake queue for use in the test environment. It exposes the
 * same `add` method but performs no network I/O.
 */
class FakeQueue {
    async add(_, payload) {
        // In test environments we immediately invoke the aggregation logic
        if (payload && payload.winnerUserId) {
            await (0, scoreAggregationWorker_1.processAggregateJob)(payload.winnerUserId, payload.createdAt);
        }
        return Promise.resolve({ id: 'fake-job-id', ...payload });
    }
}
/**
 * Either the real BullMQ queue or a fake implementation depending on the
 * environment. Tests do not run a redis server so we fall back to the fake
 * queue when NODE_ENV is set to 'test'.
 */
exports.scoreAggregationQueue = process.env.USE_REDIS === '1'
    ? new bullmq_1.Queue('score-aggregation', {
        connection: redisClient_1.default,
    })
    : new FakeQueue();
