import { Pool } from 'pg';

/**
 * Shared PostgreSQL connection pool.
 * Environment variables are standard: PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT.
 */
const pool = new Pool();

export default pool;
