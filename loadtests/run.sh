#!/usr/bin/env bash
set -euo pipefail

echo "🏃‍♂️ Running Artillery load test..."
artillery run ./artillery.yml --output results.json
echo "✅ Load test completed. View results.json for detailed metrics."
