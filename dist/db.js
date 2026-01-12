"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
const pg_1 = require("pg");
/**
 * Configuration for primary (write) and replica (read) PostgreSQL
 * instances.  The defaults fall back to the canonical `PG*` environment
 * variables for the primary pool.  If `PGHOST_REPLICA` is set, a separate
 * replica pool is created.
 */
const primaryPool = new pg_1.Pool();
let replicaPool;
if (process.env.PGHOST_REPLICA) {
    replicaPool = new pg_1.Pool({
        host: process.env.PGHOST_REPLICA,
        port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: process.env.PGSSLMODE === 'require',
    });
}
/**
 * Returns a connection pool suitable for the requested role.
 * @param isRead - When true, return the replica pool if configured;
 *                 otherwise fall back to the primary pool.
 */
function getPool(isRead = false) {
    if (isRead && replicaPool)
        return replicaPool;
    return primaryPool;
}
exports.default = primaryPool;
