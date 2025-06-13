#!/bin/bash

echo "🔍 CPQ Database Connection Debug"
echo "================================="

# Check if docker-compose is running
echo "📋 1. Checking Docker Compose services..."
docker-compose ps

echo ""
echo "🔌 2. Testing database connectivity..."

# Check if postgres container is running
if docker-compose ps | grep -q "postgres.*Up"; then
    echo "✅ PostgreSQL container is running"

    # Test database connection from host
    echo "🧪 Testing database connection from host..."
    docker-compose exec postgres psql -U cpq_user -d cpq_system -c "SELECT version();" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Database connection from host works"
    else
        echo "❌ Database connection from host failed"
    fi

    # Test database connection from backend container
    echo "🧪 Testing database connection from backend container..."
    docker-compose exec cpq-backend sh -c "nc -z postgres 5432" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Network connection to postgres:5432 works"
    else
        echo "❌ Network connection to postgres:5432 failed"
    fi

else
    echo "❌ PostgreSQL container is not running"
    echo "Starting PostgreSQL container..."
    docker-compose up -d postgres
    sleep 5
fi

echo ""
echo "🔧 3. Checking environment variables in backend..."
docker-compose exec cpq-backend sh -c "env | grep DB_" || echo "No DB_ environment variables found"

echo ""
echo "📊 4. Backend container logs (last 20 lines)..."
docker-compose logs --tail=20 cpq-backend

echo ""
echo "🐘 5. PostgreSQL logs (last 10 lines)..."
docker-compose logs --tail=10 postgres

echo ""
echo "🔧 6. Testing manual database connection..."
echo "Connection string that should be used:"
echo "host=postgres port=5432 user=cpq_user password=cpq_password_secure_2024 dbname=cpq_system sslmode=disable"

echo ""
echo "🧪 7. Testing if backend can resolve 'postgres' hostname..."
docker-compose exec cpq-backend sh -c "nslookup postgres" 2>/dev/null || echo "nslookup not available"
docker-compose exec cpq-backend sh -c "getent hosts postgres" 2>/dev/null || echo "Could not resolve postgres hostname"

echo ""
echo "📋 8. Docker network information..."
docker network ls | grep cpq
docker-compose exec cpq-backend sh -c "ip route" 2>/dev/null || echo "Could not get network info"

echo ""
echo "🎯 9. Suggested fixes:"
echo "   - If postgres hostname doesn't resolve: Check docker-compose network configuration"
echo "   - If DB_ env vars are missing: Check docker-compose.yml environment section"
echo "   - If postgres is not running: Run 'docker-compose up -d postgres' first"
echo "   - If connection times out: Check if postgres is ready (health check)"

echo ""
echo "🚀 10. Quick test - start everything fresh:"
echo "   docker-compose down"
echo "   docker-compose up -d postgres"
echo "   # Wait for postgres to be ready"
echo "   docker-compose up -d cpq-backend"