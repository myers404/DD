# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Configure-Price-Quote (CPQ) Enterprise System with:
- **Backend**: Go API server with MTBDD constraint engine
- **Frontend**: Dual implementation - React admin UI (`/frontend`) and Svelte customer UI (`/web`)
- **Database**: PostgreSQL with comprehensive schema for models, rules, configurations
- **Authentication**: JWT-based with role management (admin, user, viewer)

## Common Development Commands

### Backend Development
```bash
# Run tests
make test
go test -v ./cpq           # Test specific package
go test -cover ./...       # With coverage

# Run locally (requires PostgreSQL)
make run
# Or with custom environment
DATABASE_URL="postgres://cpq_user:cpq_password@localhost/cpq_db?sslmode=disable" \
JWT_SECRET="your-secret-key" \
go run .

# Build binary
make build
```

### Docker Operations
```bash
# Quick start (recommended)
make quick-start

# Start/stop services
make docker-up
make docker-down
make docker-rebuild

# View logs
make logs

# Database access
make db-connect         # Connect via psql (password: cpq_password)
make db-reset          # Reset database (WARNING: destroys data)
```

### Frontend Development

**React Admin UI** (`/frontend`):
```bash
cd frontend
npm install
npm run dev            # Start dev server
npm run build          # Production build
npm run lint           # Run linter
npm run test           # Run tests
```

**Svelte Customer UI** (`/web`):
```bash
cd web
npm install
npm run dev            # Start dev server
npm run build          # Standard build
npm run build:widget   # Widget build
npm run build:embed    # Embed build
npm run build:all      # All builds
npm run lint           # Run linter
npm run check          # Svelte type checking
```

## High-Level Architecture

### Core Business Logic Flow
1. **Model Definition**: Products defined with groups, options, and rules in database
2. **Configuration Creation**: Users create configurations selecting options
3. **Constraint Resolution**: MTBDD engine validates selections against rules (<50ms)
4. **Pricing Calculation**: Volume tiers and discounts applied (<25ms)
5. **Persistence**: Configurations saved with user selections

### Key Components

**MTBDD Engine** (`/mtbdd`):
- Custom Multi-Terminal Binary Decision Diagram implementation
- Handles boolean operations, arithmetic, comparisons, quantification
- Memory-efficient with caching and garbage collection
- Critical for <50ms constraint resolution performance

**CPQ Package** (`/cpq`):
- `Configurator`: Main entry point, orchestrates validation and pricing
- `Constraints`: Rule processing and MTBDD compilation
- `Pricing`: Volume discounts, bundles, tier calculations
- `Validation`: Configuration integrity checks

**Server Layer** (`/server`):
- RESTful API with 56 endpoints
- JWT authentication middleware
- Modular handlers for models, configurations, pricing
- CORS support for frontend integration

**Model Builder** (`/modelbuilder`):
- Conflict detection between rules
- Impact analysis for changes
- Rule priority management
- Model validation

### Database Schema
- `models`: Product definitions
- `groups` & `options`: Configuration structure
- `rules`: Constraints (requires, excludes, validation)
- `pricing_rules`: Volume tiers and discounts
- `configurations` & `selections`: User data
- `users`: Authentication and roles

### API Authentication Flow
1. Login: `POST /api/v1/auth/login` with email/password
2. Receive JWT token in response
3. Include token in Authorization header: `Bearer <token>`
4. Token expires after 24h (configurable)

## Testing Approach

- **Unit Tests**: Table-driven tests for all core packages
- **Integration Tests**: API endpoint testing with mock services
- **E2E Tests**: Complete workflow validation
- **Performance Tests**: Ensure <50ms constraints, <25ms pricing

Run specific test files:
```bash
go test -v ./cpq/configurator_test.go
go test -v ./mtbdd/core_test.go
go test -v ./server/integration_test.go
```

## Performance Targets
- Constraint resolution: <50ms
- Pricing calculation: <25ms
- API response: <100ms end-to-end
- Support 200+ concurrent users
- Database connection pool: 25 max

## Important Notes

1. **Environment Variables**: Always check `.env` or docker-compose.yml for required variables
2. **Database Migrations**: Schema in `/database/init/*.sql` runs automatically with Docker
3. **Sample Data**: Includes laptop model with realistic options and demo users
4. **CORS**: Enabled by default for development, configure for production
5. **JWT Secret**: Must be set for authentication to work
6. **Parser Generator**: Can regenerate expression parser with `cd parser_generator && go run .`