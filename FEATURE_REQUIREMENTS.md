# Haiku Battle League – Feature Requirements & Architecture Overview

## Core Functionalities
- **User Accounts** – Sign‑up, email verification, password reset, OAuth (GitHub/Google) optional.
- **Dashboard** – Overview of user stats: total battles, win %, current leaderboard rank.
- **Battle Flow**
  - Queue two random *unrated* haiku submissions.
  - Present side‑by‑side with clean, accessible UI.
  - Submit a vote; instant update of local counts.
  - Persist each battle as a record (haiku‑id1, haiku‑id2, winner, timestamp).
- **Haiku Submission** – Authenticated users can post a haiku (max 3 lines, 17‑17‑17 syllables optional).
  - Validation, anti‑spam (reCAPTCHA, rate‑limit).
  - Moderate via flags, user reports.
- **Leaderboards** – Global & time‑based (daily, weekly, monthly).
  - Serve as a separate API endpoint (e.g., `/api/leaderboard?period=week`).
- **Points System** – 1 point per win, optional bonus points for popularity.
  - Aggregate totals served via `/api/points?userId=...`.

## API Design (REST + WebSocket)
- **/api/auth/** – register, login, logout, refresh.
- **/api/haiku/** – CRUD (public: read, private: create, delete).  `GET /api/haiku/random?qty=2` returns two random, unrated haiku.
- **/api/battle/** – `POST /battle` with `{haikuIds: [id1, id2], winnerId}`. Auto‑create battle record.
- **/api/leaderboard/** – `{period: 'daily'|'weekly'|'monthly'}` → list of `{userId, wins, points, rank}`.
- **/api/points/** – `{userId}` → `{totalPoints, weekPoints, monthPoints}`.
- **/api/report/** – `/report/haiku/{id}` to flag unsuitable content.

## Data Model (RDBMS & Cache)
```
users  (id, email, password_hash, joined_at, points, rank, ...)
haiku  (id, user_id, text, lines, created_at, status)
battles (id, haiku_a_id, haiku_b_id, winner_id, created_at)
reports (id, haiku_id, user_id, reason, created_at)
```
* Redis Cache*: Hot leaderboard snapshots, recent battle queue.
* PostgreSQL:* durable storage; consider sharding/partitioning on `created_at` for millions of users.

## Asynchronous Processing & Scaling
1. **Job Queue** – BullMQ/Redis for:
   * Badge/point recalculations after each battle.
   * Daily/weekly aggregations.
2. **Micro‑service Layer** – Separate API and worker binaries for isolation.
3. **Autoscaling** – Containerised services (Docker/K8s) with HPA.
4. **CDN caching** – Frontend assets via Vercel or CloudFront.

## Frontend UX (Plain CSS + Vanilla JS)
* Home page → Show top 5 battles, login prompt.
* Battle page → Two haiku blocks, Vote button, real‑time result.
* Submit page → Textarea with line‑count helper.
* Dashboard → Leaderboard tables, rank, points, recent battles.
* Accessibility: focus management, alt text, color‑contrast.

## Deployment Guidance
1. **Infrastructure** – Use a PaaS (e.g., Render) or self‑host on DigitalOcean with Docker Compose.
2. **CI/CD** – GitHub Actions: lint, unit tests, integration test, deploy on PR merge.
3. **Monitoring & Logging** – Prometheus + Grafana for metrics; Loki for logs.
4. **Security** – HTTPS enforced, rate‑limit, CSRF protection.

## Growth Path
* Introduce AI‑generated haiku suggestions.
* Community events, tournaments.
* Gamification badges, social sharing.

---

This document serves as the living product spec for the MVP.
