# Parser Generator Makefile
# Production-quality build system

.PHONY: all build clean test test-coverage example install help

# Configuration
BINARY_NAME=parser_generator
BUILD_DIR=./build
EXAMPLE_DIR=./examples
VERSION=2.0.0

# Default target
all: build test

# Build the parser generator
build:
	@echo "Building parser generator..."
	@mkdir -p $(BUILD_DIR)
	go build -ldflags "-X main.version=$(VERSION)" -o $(BUILD_DIR)/$(BINARY_NAME) .
	@echo "Built $(BUILD_DIR)/$(BINARY_NAME)"

# Build for multiple platforms
build-all:
	@echo "Building for multiple platforms..."
	@mkdir -p $(BUILD_DIR)
	
	# Linux amd64
	GOOS=linux GOARCH=amd64 go build -ldflags "-X main.version=$(VERSION)" \
		-o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 .
	
	# macOS amd64
	GOOS=darwin GOARCH=amd64 go build -ldflags "-X main.version=$(VERSION)" \
		-o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 .
	
	# macOS arm64
	GOOS=darwin GOARCH=arm64 go build -ldflags "-X main.version=$(VERSION)" \
		-o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 .
	
	# Windows amd64
	GOOS=windows GOARCH=amd64 go build -ldflags "-X main.version=$(VERSION)" \
		-o $(BUILD_DIR)/$(BINARY_NAME)-windows-amd64.exe .
	
	@echo "Built binaries for multiple platforms in $(BUILD_DIR)/"

# Install the binary to GOBIN
install: build
	@echo "Installing to GOBIN..."
	go install -ldflags "-X main.version=$(VERSION)" .
	@echo "Installed $(BINARY_NAME)"

# Run tests
test:
	@echo "Running tests..."
	go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Run benchmarks
benchmark:
	@echo "Running benchmarks..."
	go test -bench=. -benchmem ./...

# Create example grammar and generated parsers
example: build
	@echo "Creating example expression language..."
	@mkdir -p $(EXAMPLE_DIR)/go $(EXAMPLE_DIR)/typescript
	
	# Create example grammar
	$(BUILD_DIR)/$(BINARY_NAME) -example
	@mv example.grammar $(EXAMPLE_DIR)/
	
	# Generate Go parser
	$(BUILD_DIR)/$(BINARY_NAME) \
		-input $(EXAMPLE_DIR)/example.grammar \
		-go $(EXAMPLE_DIR)/go \
		-package exampleparser
	
	# Generate TypeScript parser
	$(BUILD_DIR)/$(BINARY_NAME) \
		-input $(EXAMPLE_DIR)/example.grammar \
		-typescript $(EXAMPLE_DIR)/typescript \
		-module exampleparser
	
	# Create Go example usage
	@echo 'package main\n\nimport (\n\t"fmt"\n\t"log"\n)\n\nfunc main() {\n\t// Test the generated parser\n\texpressions := []string{\n\t\t"x + y * 2",\n\t\t"(a + b) * c",\n\t\t"42",\n\t\t"variable",\n\t}\n\n\tfor _, expr := range expressions {\n\t\tfmt.Printf("Parsing: %s\\n", expr)\n\t\tast, err := ParseExpression(expr)\n\t\tif err != nil {\n\t\t\tfmt.Printf("Error: %s\\n", FormatError(err))\n\t\t\tcontinue\n\t\t}\n\t\tfmt.Printf("  AST: %s\\n\\n", ast.String())\n\t}\n}' > $(EXAMPLE_DIR)/go/example.go
	
	# Create TypeScript example usage
	@echo 'import { parseExpression, formatError } from "./parser";\n\n// Test the generated parser\nconst expressions = [\n    "x + y * 2",\n    "(a + b) * c",\n    "42",\n    "variable",\n];\n\nexpressions.forEach(expr => {\n    console.log(`Parsing: ${expr}`);\n    try {\n        const ast = parseExpression(expr);\n        console.log(`  AST: ${ast.toString()}\\n`);\n    } catch (error) {\n        console.log(`Error: ${formatError(error as Error)}`);\n    }\n});' > $(EXAMPLE_DIR)/typescript/example.ts
	
	# Create package.json for TypeScript example
	@echo '{\n  "name": "parser-example",\n  "version": "1.0.0",\n  "description": "Example usage of generated TypeScript parser",\n  "main": "example.js",\n  "scripts": {\n    "build": "tsc",\n    "run": "npm run build && node example.js",\n    "test": "npm run build && node example.js"\n  },\n  "devDependencies": {\n    "typescript": "^5.0.0",\n    "@types/node": "^20.0.0"\n  }\n}' > $(EXAMPLE_DIR)/typescript/package.json
	
	# Create tsconfig.json
	@echo '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "commonjs",\n    "outDir": "./",\n    "rootDir": "./",\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true\n  },\n  "include": ["*.ts"],\n  "exclude": ["node_modules"]\n}' > $(EXAMPLE_DIR)/typescript/tsconfig.json
	
	# Create Go module
	@cd $(EXAMPLE_DIR)/go && go mod init exampleparser && go mod tidy
	
	@echo "Example created in $(EXAMPLE_DIR)/"
	@echo "Go example: cd $(EXAMPLE_DIR)/go && go run ."
	@echo "TypeScript example: cd $(EXAMPLE_DIR)/typescript && npm install && npm run test"

# Validate grammar files
validate: build
	@echo "Validating example grammar..."
	$(BUILD_DIR)/$(BINARY_NAME) -input example.grammar -validate
	@echo "Grammar validation passed!"

# Format Go code
fmt:
	@echo "Formatting Go code..."
	go fmt ./...

# Lint Go code
lint:
	@echo "Linting Go code..."
	@if command -v golangci-lint >/dev/null 2>&1; then \
		golangci-lint run; \
	else \
		echo "golangci-lint not installed. Install with: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; \
	fi

# Generate documentation
docs:
	@echo "Generating documentation..."
	@mkdir -p ./docs
	go doc -all . > ./docs/api.txt
	@echo "API documentation generated in ./docs/api.txt"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)
	rm -rf $(EXAMPLE_DIR)
	rm -f coverage.out coverage.html
	rm -f example.grammar
	@echo "Clean complete"

# Development setup
dev-setup:
	@echo "Setting up development environment..."
	go mod tidy
	@if command -v golangci-lint >/dev/null 2>&1; then \
		echo "golangci-lint already installed"; \
	else \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
	fi
	@echo "Development setup complete"

# Quick test of generated parsers
test-generated: example
	@echo "Testing generated Go parser..."
	@cd $(EXAMPLE_DIR)/go && go run . | head -10
	@echo "\nTesting generated TypeScript parser..."
	@cd $(EXAMPLE_DIR)/typescript && npm install --silent && npm run test 2>/dev/null | head -10

# Help
help:
	@echo "Parser Generator - Production Quality PEG Parser Generator"
	@echo ""
	@echo "Available targets:"
	@echo "  build         Build the parser generator binary"
	@echo "  build-all     Build for multiple platforms"
	@echo "  install       Install to GOBIN"
	@echo "  test          Run tests"
	@echo "  test-coverage Run tests with coverage report"
	@echo "  benchmark     Run performance benchmarks"
	@echo "  example       Create example grammar and generated parsers"
	@echo "  validate      Validate example grammar"
	@echo "  fmt           Format Go code"
	@echo "  lint          Lint Go code"
	@echo "  docs          Generate documentation"
	@echo "  clean         Clean build artifacts"
	@echo "  dev-setup     Set up development environment"
	@echo "  test-generated Quick test of generated parsers"
	@echo "  help          Show this help message"
	@echo ""
	@echo "Example usage:"
	@echo "  make example              # Create complete example"
	@echo "  make build test           # Build and test"
	@echo "  make install              # Install to system"
