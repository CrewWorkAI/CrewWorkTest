"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A lightweight default Redis configuration used by both queue and worker.
 * Users can override via environment variables REDIS_HOST and REDIS_PORT.
 */
const connection = {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
};
exports.default = connection;
