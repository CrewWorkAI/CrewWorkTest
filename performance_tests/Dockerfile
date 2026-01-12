# Use the official lightweight k6 image from Docker Hub
FROM loadimpact/k6:latest

# Copy the test script into the container
COPY k6_load_test.js /scripts/k6_load_test.js

# Default command: run the test with environment variables passed in
CMD ["run", "--summary-export=summary.json", "/scripts/k6_load_test.js"]
