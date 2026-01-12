import { Queue } from 'bullmq';
import connection from './redisClient';

/**
 * A lightweight stub queue used during testing or when Redis is not
 * available.  It mimics the minimal interface of BullMQ's `Queue` for
 * enqueueing jobs.
 */
class FakeQueue {
  async add(_: string, payload: any) {
    // no-op: pretend success by returning a pseudo job reference
    return Promise.resolve({ id: 'fake-job-id', ...payload });
  }
}

/**
 * In this simplified MVP we use the fake queue unconditionally. It
 * provides the same `add` interface but performs no network I/O.  For
 * a production deployment you could expose an environment flag to switch
 * to the real BullMQ queue.
 */
export const scoreAggregationQueue = new FakeQueue();
