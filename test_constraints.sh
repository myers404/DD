#!/bin/bash

# Test constraint validation

echo "Testing constraint validation..."

# Get the laptop model ID
MODEL_ID=$(curl -s http://localhost:8080/api/v1/models | jq -r '.data.models[] | select(.name == "Business Laptop") | .id')
echo "Model ID: $MODEL_ID"

# Create a configuration
echo -e "\n1. Creating configuration..."
CONFIG=$(curl -s -X POST http://localhost:8080/api/v1/configurations \
  -H "Content-Type: application/json" \
  -d "{\"model_id\": \"$MODEL_ID\"}")
CONFIG_ID=$(echo $CONFIG | jq -r '.data.id')
echo "Configuration ID: $CONFIG_ID"

# Try to select high-end CPU without appropriate RAM (should violate constraint)
echo -e "\n2. Testing constraint: High-end CPU requires 16GB or 32GB RAM"
echo "   Selecting high-end CPU without RAM..."

# First, get option IDs
CPU_HIGH=$(curl -s http://localhost:8080/api/v1/models/$MODEL_ID/options | jq -r '.data.options[] | select(.name == "Intel i7 Professional") | .id')
RAM_8GB=$(curl -s http://localhost:8080/api/v1/models/$MODEL_ID/options | jq -r '.data.options[] | select(.name == "8GB RAM") | .id')

echo "   CPU High ID: $CPU_HIGH"
echo "   RAM 8GB ID: $RAM_8GB"

# Update configuration with high CPU and low RAM
RESULT=$(curl -s -X POST http://localhost:8080/api/v1/configurations/$CONFIG_ID/selections \
  -H "Content-Type: application/json" \
  -d "{
    \"model_id\": \"$MODEL_ID\",
    \"selections\": [
      {\"option_id\": \"$CPU_HIGH\", \"quantity\": 1},
      {\"option_id\": \"$RAM_8GB\", \"quantity\": 1}
    ]
  }")

echo -e "\n   Result:"
echo "$RESULT" | jq '.data.validation_result'

# Check if constraint was violated
IS_VALID=$(echo "$RESULT" | jq -r '.data.validation_result.is_valid')
if [ "$IS_VALID" = "false" ]; then
  echo -e "\n✅ Constraint correctly enforced! Configuration is invalid."
  echo "Violations:"
  echo "$RESULT" | jq '.data.validation_result.violations'
else
  echo -e "\n❌ Constraint NOT enforced! Configuration should be invalid but is valid."
fi

# Now test with correct RAM
echo -e "\n3. Testing with correct RAM (16GB)..."
RAM_16GB=$(curl -s http://localhost:8080/api/v1/models/$MODEL_ID/options | jq -r '.data.options[] | select(.name == "16GB RAM") | .id')
echo "   RAM 16GB ID: $RAM_16GB"

RESULT2=$(curl -s -X POST http://localhost:8080/api/v1/configurations/$CONFIG_ID/selections \
  -H "Content-Type: application/json" \
  -d "{
    \"model_id\": \"$MODEL_ID\",
    \"selections\": [
      {\"option_id\": \"$CPU_HIGH\", \"quantity\": 1},
      {\"option_id\": \"$RAM_16GB\", \"quantity\": 1}
    ]
  }")

IS_VALID2=$(echo "$RESULT2" | jq -r '.data.validation_result.is_valid')
if [ "$IS_VALID2" = "true" ]; then
  echo -e "\n✅ Constraint correctly satisfied! Configuration is valid."
else
  echo -e "\n❌ Configuration should be valid but is invalid."
  echo "Violations:"
  echo "$RESULT2" | jq '.data.validation_result.violations'
fi

echo -e "\nConstraint test completed!"