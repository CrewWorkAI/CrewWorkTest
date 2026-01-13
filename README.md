# CrewWorkTest – Enterprise Customer Success Platform

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
