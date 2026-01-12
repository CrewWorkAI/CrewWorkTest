import { Queue } from 'bullmq';
import connection from './redisClient';

export const scoreAggregationQueue = new Queue('score-aggregation', {
  connection,
});
