#!/bin/bash

echo "Creating new configuration..."
CONFIG_ID=$(curl -s -X POST http://localhost:8080/api/v1/configurations \
  -H "Content-Type: application/json" \
  -d '{"model_id": "sample-laptop"}' \
  | jq -r '.data.id')

echo "Configuration ID: $CONFIG_ID"

echo -e "\nAdding high-end CPU..."
curl -s -X POST "http://localhost:8080/api/v1/configurations/$CONFIG_ID/selections" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "sample-laptop",
    "selections": [
      {"option_id": "opt_cpu_high", "quantity": 1}
    ]
  }' | jq '.data.validation_result'

echo -e "\nAdding 8GB RAM (should violate constraint)..."
curl -s -X POST "http://localhost:8080/api/v1/configurations/$CONFIG_ID/selections" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "sample-laptop",
    "selections": [
      {"option_id": "opt_cpu_high", "quantity": 1},
      {"option_id": "opt_ram_8gb", "quantity": 1}
    ]
  }' | jq '.data.validation_result'

echo -e "\nChecking current model rules..."
curl -s "http://localhost:8080/api/v1/models/sample-laptop" | jq '.data.rules[0]'