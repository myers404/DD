#!/bin/bash

# Create a configuration
CONFIG_ID=$(curl -s -X POST http://localhost:8080/api/v1/configurations \
  -H "Content-Type: application/json" \
  -d '{"model_id": "sample-laptop"}' \
  | jq -r '.data.id')

echo "Created configuration: $CONFIG_ID"

# Test 1: Add high CPU with low RAM (should fail)
echo -e "\n\nTest 1: High CPU + 8GB RAM (should violate constraint)"
curl -s -X POST "http://localhost:8080/api/v1/configurations/$CONFIG_ID/selections" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "sample-laptop",
    "selections": [
      {"option_id": "opt_cpu_high", "quantity": 1},
      {"option_id": "opt_ram_8gb", "quantity": 1}
    ]
  }' | jq '.data.validation_result'

# Test 2: Validate configuration directly
echo -e "\n\nTest 2: Direct validation"
curl -s -X POST "http://localhost:8080/api/v1/configurations/$CONFIG_ID/validate?model_id=sample-laptop" | jq '.data'