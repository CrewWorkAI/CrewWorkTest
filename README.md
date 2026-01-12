# Haiku Battle League

## Project Overview
This repository holds the **product specification** and initial scaffolding for the Haiku Battle League MVP. The goal is to allow users to submit short diss‑style haiku and let the community judge them through head‑to‑head battles.

## Documentation
- Core feature list & architecture: [`FEATURE_REQUIREMENTS.md`](FEATURE_REQUIREMENTS.md)

Feel free to read `FEATURE_REQUIREMENTS.md` for detailed design, data models, API surface, frontend flow, scaling notes, and a growth path.

### PostgreSQL High‑Availability Setup
The repository includes a `docker-compose.yml` that launches a primary PostgreSQL instance together with a hot‑standby replica. This provides read replicas for load‑balancing and fail‑over support.
To start the stack locally:

```bash
docker compose up -d
```

Your application connects to the primary instance through the standard `PG*` environment variables.
If you set `PGHOST_REPLICA` it will use that host for read‑only connections.

### Quick Run
```bash
npm install
npm run start
```
The demo server will run on `http://localhost:3001`.
