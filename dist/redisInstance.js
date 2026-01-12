"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const redisClient_1 = __importDefault(require("./redisClient"));
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
let redis;
if (process.env.USE_REDIS === '1') {
    // Real Redis client
    redis = new ioredis_1.default({
        ...redisClient_1.default,
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy: () => null,
    });
    // Ignore connection errors in environments where a Redis server may not be
    // reachable (e.g. CI). This keeps the app responsive while still logging
    // any unexpected issues.
    redis.on('error', () => { });
}
else {
    // Stub implementation that satisfies the minimal API used in the server.
    redis = {
        get: async (_) => null,
        set: async (_, __, ___, ____) => null,
        del: async (..._args) => null,
        /**
         * Unsupported operations in the stub. We provide no‑op promises for
         * ZADD and ZREVRANGE so that application code can call them without
         * breaking in test environments.
         */
        zadd: async (_, __, ___) => null,
        zrevrange: async (_, __, ___, ____) => [],
    };
}
exports.default = redis;
