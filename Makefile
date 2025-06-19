# Makefile for CPQ System

.PHONY: help build run test clean docker-up docker-down docker-rebuild logs db-connect

# Default target
help:
	@echo "CPQ System - Available Commands:"
	@echo ""
	@echo "  Development:"
	@echo "    run          - Run the application locally (requires PostgreSQL)"
	@echo "    test         - Run tests"
	@echo "    build        - Build the application binary"
	@echo ""
	@echo "  Docker:"
	@echo "    docker-up    - Start all services with Docker Compose"
	@echo "    docker-down  - Stop all Docker services"
	@echo "    docker-rebuild - Rebuild and restart Docker services"
	@echo "    logs         - View Docker logs"
	@echo ""
	@echo "  Database:"
	@echo "    db-connect   - Connect to PostgreSQL database"
	@echo "    db-reset     - Reset database (WARNING: destroys all data)"
	@echo ""
	@echo "  Utility:"
	@echo "    clean        - Clean build artifacts"
	@echo "    admin        - Start with pgAdmin for database management"

# Development
build:
	@echo "🔨 Building CPQ application..."
	go build -o bin/cpq-server .

run:
	@echo "🚀 Running CPQ application locally..."
	@echo "⚠️  Make sure PostgreSQL is running on localhost:5432"
	@echo "   Database: cpq_db, User: cpq_user, Password: cpq_password"
	go run .

test:
	@echo "🧪 Running tests..."
	go test -v ./...

# Docker operations
docker-up:
	@echo "🐳 Starting CPQ system with Docker Compose..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo ""
	@echo "🌐 CPQ API: http://localhost:8080"
	@echo "🗄️  Database: localhost:5432"
	@echo "📊 pgAdmin: http://localhost:5050 (admin@cpq.local / admin)"
	@echo ""
	@echo "📋 Default login: demo@cpq.local / demo123"

docker-down:
	@echo "🛑 Stopping Docker services..."
	docker-compose down

docker-rebuild:
	@echo "🔄 Rebuilding and restarting services..."
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "✅ Services rebuilt and restarted!"

logs:
	@echo "📜 Viewing Docker logs..."
	docker-compose logs -f

# Database operations
db-connect:
	@echo "🗄️  Connecting to PostgreSQL database..."
	@echo "Password: cpq_password"
	psql -h localhost -p 5432 -U cpq_user -d cpq_system

db-reset:
	@echo "⚠️  WARNING: This will destroy all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		echo "🗑️  Resetting database..."; \
		docker-compose down -v; \
		docker-compose up -d postgres; \
		sleep 5; \
		echo "✅ Database reset complete!"; \
	else \
		echo ""; \
		echo "❌ Database reset cancelled."; \
	fi

# Utility
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf bin/
	docker system prune -f

admin:
	@echo "🚀 Starting with pgAdmin for database management..."
	docker-compose --profile admin up -d
	@echo "✅ Services started with pgAdmin!"
	@echo ""
	@echo "🌐 CPQ API: http://localhost:8080"
	@echo "📊 pgAdmin: http://localhost:5050 (admin@cpq.local / admin)"

# Quick start
quick-start: docker-up
	@echo ""
	@echo "🎉 CPQ System is ready!"
	@echo ""
	@echo "Test the API:"
	@echo "  curl http://localhost:8080/health"
	@echo ""
	@echo "Login:"
	@echo "  curl -X POST http://localhost:8080/api/v1/auth/login \\"
	@echo "    -H 'Content-Type: application/json' \\"
	@echo "    -d '{\"email\":\"demo@cpq.local\",\"password\":\"demo123\"}'"