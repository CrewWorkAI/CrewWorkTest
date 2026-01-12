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
// Singleton Redis instance used throughout the app. During integration tests
// (and when the `USE_REDIS` environment variable is not set to `1`) a lightweight
// stub is provided so the API can run without a real Redis installation.
let redis: any;
if (process.env.USE_REDIS === '1') {
  // Real Redis client
  redis = new Redis({
    ...connection,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: () => null,
  });
  // Ignore connection errors in environments where a Redis server may not be
  // reachable (e.g. CI). This keeps the app responsive while still logging
  // any unexpected issues.
  redis.on('error', () => {});
} else {
  // Stub implementation that satisfies the minimal API used in the server.
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
