# Haiku Battle League Architecture

Below is a high‑level architecture diagram for the MVP. The diagram is expressed using **Mermaid** syntax so it can be rendered by any Markdown viewer that supports Mermaid.

```mermaid
%%{init: { 'theme': 'neutral', 'fontFamily': 'sans-serif', 'flowchart': { 'curve': 'basis' } } }%%
flowchart TD
    subgraph Frontend
        FE["React/WebAssembly frontend (Vercel Cloudflare CDN)"
            style FE fill:#f9f,stroke:#333,stroke-width:2px]
    end

    subgraph Auth
        AuthService["Auth Service (OAuth, JWT)"
            style AuthService fill:#afa,stroke:#333,stroke-width:2px]
    end

    subgraph APIs
        API["Gateway API (NGINX + FastAPI)
            style API fill:#ddf,stroke:#333,stroke-width:2px]
    end

    subgraph Services
        Backend["Auth Service, Haiku Service, Battle Service, Leaderboard Service, Points Service (micro‑services)"
            style Backend fill:#eef,stroke:#333,stroke-width:2px]
        Worker["BullMQ/Redis Workers
            style Worker fill:#ffd,stroke:#333,stroke-width:2px]
    end

    subgraph Storage
        Postgres["PostgreSQL (cluster, partitioned tables)"
            style Postgres fill:#fdd,stroke:#333,stroke-width:2px]
        Redis["Redis (caching, queue, pub/sub)"
            style Redis fill:#dff,stroke:#333,stroke-width:2px]
    end

    FE --> AuthService
    FE --> API
    AuthService --> Backend
    API --> Backend
    API --> Worker
    Backend --> Postgres
    Backend --> Redis
    Worker --> Postgres
    Worker --> Redis
    FE <-- CDN["CDN (Vercel/CloudFront)"
        style CDN fill:#fcf,stroke:#333,stroke-width:2px]
    CDN --> FE

    subgraph Monitoring
        Prom["Prometheus + Grafana"
            style Prom fill:#eef,stroke:#333,stroke-width:2px]
        Loki["Loki for logs"
            style Loki fill:#eef,stroke:#333,stroke-width:2px]
    end

    API --> Prom
    Backend --> Prom
    API --> Loki
    Backend --> Loki
```

## Component Overview

* **Frontend** – Single‑page application delivering battle UI, leaderboard, submission forms. Built with React and served from a CDN.
* **Auth Service** – Handles user accounts, OAuth integrations, JWT issuance.
* **Gateway API** – Rate‑limited reverse proxy exposing REST + WebSocket endpoints. Implements authentication guards.
* **Micro‑services** – Each domain (haiku, battle, leaderboard, points) runs as an isolated process or Kubernetes pod. They all share the same PostgreSQL cluster.
* **Workers** – Long‑running background jobs (point calculations, weekly aggregation). Powered by BullMQ over Redis.
* **Cache** – Redis stores hot leaderboards, battle queues, and short‑lived auth tokens. PostgreSQL is the source of truth.
* **Monitoring** – Prometheus collects metrics from services, Grafana visualizes them. Loki aggregates structured logs.
* **Deployment** – Services containerised with Docker, orchestrated via Kubernetes on Render or DigitalOcean. CI/CD via GitHub Actions.

This architecture is designed to scale to 5‑10 M daily active users, with auto‑scaling of API pods, worker queues, and stateless frontend.

