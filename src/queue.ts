import { Queue } from 'bullmq';
import connection from './redisClient';
import { processAggregateJob } from './workers/scoreAggregationWorker';

/**
 * A lightweight fake queue for use in the test environment. It exposes the
 * same `add` method but performs no network I/O.
 */
class FakeQueue {
  async add(_: string, payload: any) {
    // In test environments we immediately invoke the aggregation logic
    if (payload && payload.winnerUserId) {
      await processAggregateJob(payload.winnerUserId, payload.createdAt);
    }
    return Promise.resolve({ id: 'fake-job-id', ...payload });
  }
}

/**
 * Either the real BullMQ queue or a fake implementation depending on the
 * environment. Tests do not run a redis server so we fall back to the fake
 * queue when NODE_ENV is set to 'test'.
 */
export const scoreAggregationQueue = process.env.USE_REDIS === '1'
  ? new Queue('score-aggregation', {
      connection,
    })
  : new FakeQueue();
