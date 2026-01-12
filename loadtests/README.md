# Load Testing for Haiku Battle League

This directory contains an **Artillery** load‑test configuration that approximates the traffic patterns for 5 – 10 M daily active users.  The test is intentionally conservative; you can scale up the `arrivalRate` and `rampTo` values to push the system further.

## Prerequisites

* **Node.js** (≥ 14)
* **Artillery** – install globally with:
  ```bash
  npm install -g artillery
  ```

## Running the test

```bash
# Ensure your API server is running on http://localhost:3001
npm install artillery
artillery run loadtests/artillery.yml
```

The script will output detailed metrics—throughput, response times, error rates, and more—at the end of the run.

## Customizing

* Adjust the `target` URL if your API is hosted elsewhere.
* The `phases` section controls how many virtual users the test simulates. Increase `rampTo` values to model higher concurrency.
* The `register_and_login`, `submit_battle`, `get_leaderboard`, and `get_random_haiku` scenarios simulate typical user interactions.

## Interpreting Results

Key metrics to check:

* **RPS** – Requests per second.
* **Latency** – 50th, 95th, 99th percentiles.
* **Errors** – HTTP status codes ≥ 400.

If any error rate spikes or latency exceeds your thresholds, investigate the corresponding endpoint and consider scaling or caching strategies.

