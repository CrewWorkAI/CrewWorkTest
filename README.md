# CrewWorkTest – Enterprise Customer Success Platform
## Architecture Overview
The system is decomposed into classic **D‑C‑I** layers (Domain‑Application‑Interface) that keep the core business logic isolated from infrastructure and presentation concerns.
```
┌───────────────────────┐
│  1️⃣  Domain Layer     │  │ Entities
│  (Business Rules)      │  │  • classes in src/entities
│─────────────────────── │  │  • pure POJOs / value objects
│  2️⃣  Application Layer│  │ Services & orchestrators
│  (Use‑Case Logic)      │  │  • functions that consume Domain
│─────────────────────── │  │  • no external side‑effects
│  3️⃣  Interface         │  │ Controllers
│  (Adjacency to world) │  │  • REST+UI entry points
├───────────────────────┤
│ Infra    (Mocks)       │  │ In‑memory persistence
│  • repositories        │  │ • queue / scheduler mock
└───────────────────────┘
```
The diagram above is intentionally **text‑only** – the repository contains
the source for the mock infrastructure and the small web UI bundled into the
same project to keep the prototype lightweight.
## Design Decisions
| Decision | Rationale |
|----------|-----------|
| **Plain JavaScript** | Avoids compilation overhead and keeps the prototype fast to iterate. |
| **No database** | In‑memory store keeps all tests deterministic and prevents external
dependencies during CI. |
| **Node.js + Express (or built‑in http)** | Minimal runtime, well‑known ecosystem, unit tests use the same. |
| **CSS‑only UI** | No CSS framework to keep bundle size low and focus on business.
| **Svelte** for UI (commented because the repo uses plain HTML + JS for now) | Allows fast SPA while still being lightweight. |
| **Deterministic ID generation** | Enables reliable test fixtures. |
| **Mock event loop for SLA timers** | Simulates asynchronous escalation without real async timers. |
| **Minimal test harness** | Using native `node --test` to avoid extra test framework complexity. |
## Testing Guide
### Running Tests
All tests are in `src/__tests__` and can be executed with the built‑in Node
test runner:
```bash
npm test
```
The command runs both **unit** and **integration** tests in two phases.
1. **Unit** – individual services (`src/services/*.js`) are evaluated with
   mocked dependencies to assert pure logic.  Each unit test file exports a
   function named `runTest` returning a Promise.
2. **Integration** – the mock controller (`src/app/index.js`) and mock
   infrastructure are started in a single process; tests hit the exposed
   HTTP endpoints using `node --test`'s `fetch` polyfill.

### Test Coverage
Coverage is measured during the CI run; a minimum of **90 %** for statements
and branches is required.  The `coverage` folder is generated in the root
after `npm test`.

### Smoke Test for UI
The file `src/__tests__/smoke.test.js` spins up the server on an ephemerally
assigned port, launches a headless browser via `playwright`, navigates to
`/accounts` and checks that the table contains at least one row.

### Writing a New Test
To add a new test:
1. Create a file under `src/__tests__/` ending with `.test.js`.
2. Export an async function `runTest()` that performs the test.  The
   function should `throw` if the test fails – the harness will capture
   the error.
3. Ensure new code paths are exercised in the unit tests first, then write
   integration tests to cover the HTTP flow.

> **Note** – The test harness intentionally does *not* start an external
> database; any persistence must be performed against the provided
> in‑memory repository.

This repository contains an in‑memory prototype of an **Enterprise Customer Success** platform. It focuses on core business concepts such as accounts, contacts, contracts, health signals, playbooks, and renewal risks. The goal is to demonstrate a clean architecture, testability, and a minimal UI that can be extended or moved to a real database later.

## Project Outline

The platform is split into five key layers:

* **Core domain** – Entity definitions, value objects, and domain services.
* **Application layer** – High‑level business logic and orchestration.
* **Infrastructure** – In‑memory persistence, logging and scheduling mocks.
* **API / UI** – A lightweight HTTP/JSON API with a small web frontend.
* **Testing** – Comprehensive unit and integration tests that exercise
  the core services and a smoke‑test of the UI.

### Core Entities

| Entity | Key Relationships | Primary Fields |
|--------|--------------------|----------------|
| **Account** | has many `Contact`, one `Contract`, many `HealthSignal`, many `Playbook`, many `Risk` | `id`, `name`, `industry`, `created_at` |
| **Contact** | belongs to `Account`, can be an `Owner` or `Collaborator` | `id`, `account_id`, `role`, `email` |
| **Contract** | belongs to `Account` | `id`, `account_id`, `start_date`, `end_date`, `terms` |
| **HealthSignal** | belongs to `Account` | `id`, `account_id`, `metric`, `value`, `timestamp` |
| **Playbook** | belongs to `Account`, has many `Task` | `id`, `account_id`, `name`, `description` |
| **Task** | belongs to `Playbook`, assigned to a `Contact` | `id`, `playbook_id`, `owner_id`, `status`, `due_at` |
| **Risk** | belongs to `Account` | `id`, `account_id`, `risk_type`, `severity`, `created_at` |

### Workflows

* **Onboarding Playbooks** – Each onboarding process is a playbook with sequenced tasks and owners.
* **Risk Escalation** – Risks are escalated when SLA timers expire. An event loop (mocked) triggers notifications and escalations.
* **Executive Summaries** – Periodic endpoints produce concise CSV/JSON summaries of key metrics.

### Analytics

* Daily batch job that rolls up **health scores** per account.
* **Churn‑risk buckets** – accounts are labeled Low/Medium/High churn risk based on thresholds.
* **Trend charts** – simple line charts (served as static JSON) for health scores over time.

### UI

* **Account List** – searchable, filterable list with pagination.
* **Account Detail** – shows timeline of health signals, risk dashboard, and active playbooks.
* **Risk Dashboard** – table of open risks with escalation status.
* **Playbook Execution** – view to see tasks, change status, assign users.

The UI is built with **Svelte** (or similar) and communicates to the backend via REST endpoints.

### Permissions

* Roles: `Owner` (read/write) and `Collaborator` (read‑only at first).
* Access checks are implemented on a critical route: `/accounts/:id/health`. Only users whose `account_id` matches and who have the owner role can access.

### Tests

* **Service Unit Tests** – health rollups, risk escalation logic, and playbook progression.
* **UI Smoke Test** – spins up the server, accesses the account list page, and verifies basic rendering.

## Local Development

```bash
# clone and change into repo
git clone <repo-url> 
cd CrewWorkTest

# install dependencies (Node.js required)
npm install

# run the development server
npm run dev

# run tests
npm test
```

No cloud provisioning is required – everything operates in‑memory for quick iteration.

## Contributing

Feel free to fork, open PRs, or add your own domain extensions. The test suite is the safety net – please keep it green after changes.

---

*Author – [Your Name]*
