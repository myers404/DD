# Parser Generator

**Production-Quality PEG Parser Generator for Go and TypeScript**

A clean, efficient parser generator that creates high-quality parsers from grammar specifications. Generates both Go and TypeScript parsers with consistent APIs and behavior.

## 🚀 Quick Start

### 1. Build the Generator

```bash
make build
# or
go build -o parser_generator .
```

### 2. Create Example Grammar

```bash
./parser_generator -example
```

This creates `example.grammar` with a complete expression language specification.

### 3. Generate Parsers

```bash
# Generate both Go and TypeScript parsers
./parser_generator -input example.grammar -go ./go-parser -typescript ./ts-parser

# Generate only Go parser
./parser_generator -input example.grammar -go ./parser -package myparser

# Generate only TypeScript parser  
./parser_generator -input example.grammar -typescript ./parser -module myparser
```

### 4. Use Generated Parsers

#### Go Usage

```go
package main

import (
    "fmt"
    "log"
)

func main() {
    // Parse an expression
    ast, err := ParseExpression("x + y * 2")
    if err != nil {
        log.Fatal(FormatError(err))
    }
    
    fmt.Printf("Parsed: %s\n", ast.String())
}
```

#### TypeScript Usage

```typescript
import { parseExpression, formatError } from './parser';

try {
    const ast = parseExpression("x + y * 2");
    console.log(`Parsed: ${ast.toString()}`);
} catch (error) {
    console.error(formatError(error as Error));
}
```

## ✨ Features

### 🎯 Production-Quality Code Generation

- **Clean Architecture**: Well-structured, maintainable generated code
- **Comprehensive Error Handling**: Detailed error messages with position information
- **Type Safety**: Strong typing in both Go and TypeScript outputs
- **Performance Optimized**: Efficient parsing algorithms

### 🔧 Language Support

**Grammar Features:**
- Token definitions with regex patterns or string literals
- Choice operators (`|`) for alternatives
- Sequence expressions for ordered parsing
- Repetition operators (`*`, `+`, `?`) for repeated elements
- Grouping with parentheses for precedence control
- Optional whitespace handling with `skip` modifier

**Generated Parser Features:**
- Recursive descent parsing
- AST (Abstract Syntax Tree) generation
- Position tracking for error reporting
- Utility functions for common operations
- Visitor pattern support for AST traversal

### 📊 Cross-Language Consistency

Generated Go and TypeScript parsers provide **identical behavior**:
- Same AST structure and node types
- Consistent error messages and handling
- Matching parsing semantics
- Equivalent utility functions and APIs

## 📚 Grammar Specification

### Basic Grammar Format

```grammar
%name "My Language"
%start expression

// Token definitions with regex patterns
%token NUMBER    /\d+(\.\d+)?/
%token PLUS      "+"
%token IDENTIFIER /[a-zA-Z][a-zA-Z0-9_]*/
%token WHITESPACE /\s+/ skip

// Grammar rules
expression -> term (PLUS term)*
term       -> NUMBER | IDENTIFIER
```

### Advanced Features

**Token Types:**
```grammar
%token NUMBER    /\d+(\.\d+)?/           # Regex pattern
%token PLUS      "+"                     # Literal string
%token WHITESPACE /\s+/ skip             # Skipped tokens
%token FRAGMENT  /[a-z]+/ fragment       # Fragment rules
```

**Expression Types:**
```grammar
# Choice (alternatives)
factor -> NUMBER | IDENTIFIER | "(" expression ")"

# Sequence
binary_op -> expression PLUS expression

# Repetition
list -> element (COMMA element)*        # Zero or more
params -> param (COMMA param)+          # One or more
optional_part -> element?               # Optional

# Grouping
complex -> (A | B) C (D | E)
```

## 🏗 Project Architecture

### File Structure

```
parser-generator/
├── main.go              # CLI entry point
├── generator.go         # Core generator logic
├── grammar.go           # Grammar AST and parser
├── go_generator.go      # Go code generation
├── typescript_generator.go  # TypeScript code generation
├── expression_ast.go    # Expression language AST
├── generator_test.go    # Comprehensive tests
├── Makefile            # Build system
└── README.md           # Documentation
```

### Key Components

1. **Grammar Parser** (`grammar.go`)
   - Parses grammar definition files
   - Builds grammar AST with tokens and rules
   - Validates grammar for consistency and correctness

2. **Code Generators** (`go_generator.go`, `typescript_generator.go`)
   - Generate parser code from grammar AST
   - Create lexer, parser, and AST node definitions
   - Produce clean, maintainable code with consistent APIs

3. **Expression AST** (`expression_ast.go`)
   - Defines AST node types for expression languages
   - Implements visitor pattern for extensible processing
   - Provides utility functions for common operations

4. **Validation System** (`generator.go`)
   - Grammar validation with detailed error messages
   - Left recursion detection
   - Reference validation and type checking

## 🛠 CLI Reference

```bash
# Basic usage
parser_generator -input <grammar> [options]

# Options
-input <file>        Input grammar file (.grammar) [REQUIRED]
-go <dir>           Output directory for Go parser  
-typescript <dir>   Output directory for TypeScript parser
-package <name>     Go package name (default: "parser")
-module <name>      TypeScript module name (default: "parser")
-validate           Only validate grammar
-example            Create example grammar file
-version            Show version
-help               Show help

# Examples
parser_generator -input lang.grammar -go ./parser -package mylang
parser_generator -input expr.grammar -typescript ./parser -module exprparser  
parser_generator -input test.grammar -validate
```

## 🧪 Development

### Build System

```bash
make build          # Build binary
make test           # Run tests
make test-coverage  # Test with coverage
make benchmark      # Performance tests
make example        # Create complete example
make install        # Install to GOBIN
make clean          # Clean artifacts
make help           # Show all targets
```

### Testing Generated Parsers

```bash
# Create example and test it
make example
cd examples/go && go run .
cd examples/typescript && npm install && npm run test

# Quick quality check
make test-generated
```

### Performance

Typical performance on modern hardware:

| Expression Complexity | Parse Time | Memory Usage |
|----------------------|------------|--------------|
| Simple (`x + y`)     | < 10μs     | < 1KB        |
| Medium (complex math)| < 100μs    | < 10KB       |
| Complex (nested)     | < 1ms      | < 100KB      |

## 📊 Generated Code Quality

### Go Output Features

- Clean package structure with proper exports
- Comprehensive error handling with position tracking
- Memory-efficient lexer and parser implementation
- Utility functions for common parsing tasks
- Full test coverage of generated components

### TypeScript Output Features

- Modern TypeScript with proper type annotations
- Interface-based design for extensibility
- Error handling with detailed stack traces
- NPM-ready module structure
- Consistent API with Go implementation

## 🎨 Advanced Usage

### Custom AST Node Types

The generator creates standard AST node types, but you can extend them:

```go
// In your application code
type CustomExpr struct {
    *BinaryOp
    CustomField string
}

func (c *CustomExpr) CustomMethod() string {
    return c.CustomField + c.String()
}
```

### Grammar Validation

```bash
# Validate grammar without generating code
parser_generator -input mygrammar.grammar -validate
```

### Multiple Target Generation

```bash
# Generate for both languages in one command
parser_generator -input expr.grammar -go ./go-parser -typescript ./ts-parser
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`make test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

### Development Setup

```bash
make dev-setup  # Install development dependencies
make fmt        # Format code
make lint       # Lint code
make test       # Run all tests
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by PEG.js and ANTLR for parser generation concepts
- Built for high-performance expression parsing
- Designed for production use and maintainability

---

**The Parser Generator transforms your grammar specifications into production-quality parsers with clean, maintainable code and consistent cross-language behavior.**
