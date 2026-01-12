# High‑Availability Database Architecture

## Overview
The application runs behind a **primary PostgreSQL** instance that
handles all write traffic (account creation, haiku submissions, battle
completions, etc.).  A **hot‑standby replica** receives WAL shipping
from the master and serves read‑only traffic.  Query routing is
controlled by the application – we expose two pools:

* **writePool** – used for all mutations.
* **readPool**  – used for leaderboard or analytics reads.

By default the replica pool is optional; if `PGHOST_REPLICA` is not
defined the app falls back to the primary pool.

## Deployment Steps
1. **Spin up the stack** using the supplied `docker-compose.yml`.
2. **Run migrations**. The initial SQL file (`migrations/000_initial.sql`)
   contains all necessary tables, indexes, and functions.  If you need to
   automate migrations for production, consider tools like `node-pg-migrate`
   or execute `psql -f migrations/000_initial.sql` against the primary.
3. **Configure environment** for your runtime:

   ```env
   PGHOST=haiku_primary
   PGPORT=5432
   PGUSER=haiku_user
   PGPASSWORD=haiku_pass
   PGDATABASE=haiku
   PGHOST_REPLICA=haiku_replica
   ```

4. **Scale** the replica by replicating the same command in a new
   container or in a managed cluster (e.g., RDS, Cloud SQL).  Add more
   read workers if you hit read saturation.

## Read‑Write Separation Example
```ts
import { getPool } from '../db';

// Mutation
await getPool(false).query('INSERT INTO users ...');

// Read
const res = await getPool(true).query('SELECT * FROM leaderboards');
```

This approach keeps the write pool isolated and lets the replica keep
the load light, giving higher uptime.

