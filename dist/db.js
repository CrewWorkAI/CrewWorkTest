"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
/**
 * Shared PostgreSQL connection pool.
 * Environment variables are standard: PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT.
 */
const pool = new pg_1.Pool();
exports.default = pool;
