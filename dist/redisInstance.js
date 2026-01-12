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
let redis;
if (process.env.USE_REDIS === '1') {
    redis = new ioredis_1.default({
        ...redisClient_1.default,
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy: () => null,
    });
    redis.on('error', () => { });
}
else {
    redis = {
        get: async (_) => null,
        set: async (_, __, ___, ____) => null,
        del: async (..._args) => null,
    };
}
exports.default = redis;
