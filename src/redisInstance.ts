import Redis from 'ioredis';
import connection from './redisClient';

/**
 * Export a singleton Redis client. In test environments where Redis is
 * not available (i.e., `USE_REDIS` is not set to `1`), a lightweight
 * stub is returned instead. The stub provides minimal `get`, `set`, and
 * `del` methods that resolve Promises without performing any network
 * activity. This allows the API to operate using in‑memory state
 * without requiring an actual Redis instance.
 */
let redis: any;
if (process.env.USE_REDIS === '1') {
  redis = new Redis({
    ...connection,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: () => null,
  });
  redis.on('error', () => {});
  } else {
  redis = {
    get: async (_: string) => null,
    set: async (_: string, __: string, ___: string, ____: number) => null,
    del: async (..._args: string[]) => null,
    /**
     * Unsupported operations in the stub. We provide no‑op promises for
     * ZADD and ZREVRANGE so that application code can call them without
     * breaking in test environments.
     */
    zadd: async (_: string, __: number, ___: string) => null,
    zrevrange: async (_: string, __: number, ___: number, ____: { withscores?: boolean } | undefined) => [],
  };
}

export default redis;
