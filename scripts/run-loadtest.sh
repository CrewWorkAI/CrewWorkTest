#!/usr/bin/env bash
# Script to run Artillery load test against the locally started API.
# Requirements:
#  - The API must be running on localhost:3000
#  - Artillery should be installed (npm i -g artillery or via npm script)

set -euo pipefail

echo "Running Artillery load test..."
artillery run loadtests/artillery.yml
echo "Load test completed."

