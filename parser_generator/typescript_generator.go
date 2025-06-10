package parser_generator

import (
	"fmt"
	"strings"
)

// TypeScriptGenerator generates TypeScript parser code
type TypeScriptGenerator struct {
	config *Config
}

// NewTypeScriptGenerator creates a new TypeScript generator
func NewTypeScriptGenerator(config *Config) *TypeScriptGenerator {
	return &TypeScriptGenerator{config: config}
}

// Generate creates TypeScript parser code from grammar
func (g *TypeScriptGenerator) Generate(grammar *Grammar) (string, error) {
	var buf strings.Builder

	// Generate token enums
	g.generateTokens(&buf, grammar)

	// Generate AST node interfaces and classes
	g.generateAST(&buf, grammar)

	// Generate lexer
	g.generateLexer(&buf, grammar)

	// Generate parser
	g.generateParser(&buf, grammar)

	// Generate utility functions
	g.generateUtilities(&buf, grammar)

	return buf.String(), nil
}

// generateTokens creates token enum definitions
func (g *TypeScriptGenerator) generateTokens(buf *strings.Builder, grammar *Grammar) {
	buf.WriteString("// Token definitions\n")
	buf.WriteString("export enum TokenType {\n")

	for _, token := range grammar.Tokens {
		buf.WriteString(fmt.Sprintf("  %s = '%s',\n",
			strings.ToUpper(token.Name), token.Name))
	}

	buf.WriteString("  EOF = 'EOF',\n")
	buf.WriteString("  INVALID = 'INVALID'\n")
	buf.WriteString("}\n\n")

	// Token interface
	buf.WriteString(`export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

`)
}

// generateAST creates AST node definitions
func (g *TypeScriptGenerator) generateAST(buf *strings.Builder, grammar *Grammar) {
	buf.WriteString(`// AST node interface
export interface ASTNode {
  toString(): string;
}

// Expression interface
export interface Expression extends ASTNode {
  // Marker interface for expressions
}

// Literal represents a literal value
export class Literal implements Expression {
  constructor(public value: any) {}

  toString(): string {
    return String(this.value);
  }
}

// Identifier represents a variable reference
export class Identifier implements Expression {
  constructor(public name: string) {}

  toString(): string {
    return this.name;
  }
}

// BinaryOp represents binary operations
export class BinaryOp implements Expression {
  constructor(
    public left: Expression,
    public operator: TokenType,
    public right: Expression
  ) {}

  toString(): string {
    return "(" + this.left.toString() + " " + this.operator + " " + this.right.toString() + ")";
  }
}

// UnaryOp represents unary operations
export class UnaryOp implements Expression {
  constructor(
    public operator: TokenType,
    public operand: Expression
  ) {}

  toString(): string {
    return "(" + this.operator + this.operand.toString() + ")";
  }
}

`)
}

// generateLexer creates lexer implementation
func (g *TypeScriptGenerator) generateLexer(buf *strings.Builder, grammar *Grammar) {
	buf.WriteString(`// Lexer tokenizes input text
export class Lexer {
  private position = 0;
  private current = '';

  constructor(private input: string) {
    this.readChar();
  }

  private readChar(): void {
    if (this.position >= this.input.length) {
      this.current = '\\0'; // EOF
    } else {
      this.current = this.input[this.position];
    }
    this.position++;
  }

  private peekChar(): string {
    if (this.position >= this.input.length) {
      return '\\0';
    }
    return this.input[this.position];
  }

  private skipWhitespace(): void {
    while (/\\s/.test(this.current)) {
      this.readChar();
    }
  }

  // Get next token
  nextToken(): Token {
    this.skipWhitespace();

    const startPos = this.position - 1;

    switch (this.current) {
`)

	// Generate token matching
	for _, token := range grammar.Tokens {
		if token.Skip {
			continue // Skip whitespace tokens
		}

		if token.Literal != "" {
			g.generateTSLiteralToken(buf, token)
		} else if token.Pattern != "" {
			g.generateTSPatternToken(buf, token)
		}
	}

	buf.WriteString(`      case '\\0':
        return { type: TokenType.EOF, value: '', pos: startPos };
      default:
        if (/[a-zA-Z]/.test(this.current)) {
          return this.readIdentifier(startPos);
        }
        if (/\\d/.test(this.current)) {
          return this.readNumber(startPos);
        }
        
        const char = this.current;
        this.readChar();
        return { type: TokenType.INVALID, value: char, pos: startPos };
    }
  }

  private readIdentifier(startPos: number): Token {
    const start = this.position - 1;
    while (/[a-zA-Z0-9_]/.test(this.current)) {
      this.readChar();
    }
    const value = this.input.substring(start, this.position - 1);
    return { type: TokenType.IDENTIFIER, value, pos: startPos };
  }

  private readNumber(startPos: number): Token {
    const start = this.position - 1;
    while (/\\d/.test(this.current)) {
      this.readChar();
    }
    if (this.current === '.' && /\\d/.test(this.peekChar())) {
      this.readChar(); // consume '.'
      while (/\\d/.test(this.current)) {
        this.readChar();
      }
    }
    const value = this.input.substring(start, this.position - 1);
    return { type: TokenType.NUMBER, value, pos: startPos };
  }
}

`)
}

// generateTSLiteralToken generates TypeScript code for literal tokens
func (g *TypeScriptGenerator) generateTSLiteralToken(buf *strings.Builder, token *TokenDef) {
	if len(token.Literal) == 1 {
		buf.WriteString(fmt.Sprintf("      case '%s':\n", token.Literal))
		buf.WriteString("        this.readChar();\n")
		buf.WriteString(fmt.Sprintf("        return { type: TokenType.%s, value: '%s', pos: startPos };\n",
			strings.ToUpper(token.Name), token.Literal))
	} else {
		// Multi-character literal - would need more complex matching
		buf.WriteString(fmt.Sprintf("      // TODO: Handle multi-char literal '%s'\n", token.Literal))
	}
}

// generateTSPatternToken generates TypeScript code for pattern tokens
func (g *TypeScriptGenerator) generateTSPatternToken(buf *strings.Builder, token *TokenDef) {
	// For now, just add a comment - full regex support would be complex
	buf.WriteString(fmt.Sprintf("      // TODO: Handle pattern token %s: %s\n",
		token.Name, token.Pattern))
}

// generateParser creates parser implementation
func (g *TypeScriptGenerator) generateParser(buf *strings.Builder, grammar *Grammar) {
	buf.WriteString(`// Parser parses tokens into AST
export class Parser {
  private currentToken!: Token;
  private peekToken!: Token;

  constructor(private lexer: Lexer) {
    this.nextToken();
    this.nextToken();
  }

  private nextToken(): void {
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  private expectToken(tokenType: TokenType): void {
    if (this.currentToken.type !== tokenType) {
      throw new Error("Expected " + tokenType + ", got " + this.currentToken.type);
    }
    this.nextToken();
  }

  // Parse the input and return the AST
  parse(): Expression {
`)

	// Generate parse method for start rule
	if grammar.StartRule != "" {
		buf.WriteString(fmt.Sprintf("    return this.parse%s();\n",
			capitalizeFirst(grammar.StartRule)))
	} else {
		buf.WriteString("    throw new Error('No start rule defined');\n")
	}

	buf.WriteString("  }\n\n")

	// Generate parsing methods for each rule
	for _, rule := range grammar.Rules {
		g.generateTSParseMethod(buf, rule, grammar)
	}
}

// generateTSParseMethod creates a TypeScript parsing method for a rule
func (g *TypeScriptGenerator) generateTSParseMethod(buf *strings.Builder, rule *Rule, grammar *Grammar) {
	methodName := fmt.Sprintf("parse%s", capitalizeFirst(rule.Name))

	buf.WriteString(fmt.Sprintf("  private %s(): Expression {\n", methodName))

	// Generate parsing logic based on the rule expression
	g.generateTSExpressionParsing(buf, rule.Expression, grammar)

	buf.WriteString("  }\n\n")
}

// generateTSExpressionParsing generates TypeScript parsing code for expressions
func (g *TypeScriptGenerator) generateTSExpressionParsing(buf *strings.Builder, expr Expression, grammar *Grammar) {
	switch e := expr.(type) {
	case *RuleRef:
		if grammar.GetTokenByName(e.Name) != nil {
			// It's a token
			buf.WriteString(fmt.Sprintf("    if (this.currentToken.type !== TokenType.%s) {\n",
				strings.ToUpper(e.Name)))
			buf.WriteString(fmt.Sprintf("      throw new Error('Expected %s');\n", e.Name))
			buf.WriteString("    }\n")
			buf.WriteString("    const value = this.currentToken.value;\n")
			buf.WriteString("    this.nextToken();\n")

			if e.Name == "NUMBER" {
				buf.WriteString("    const num = parseFloat(value);\n")
				buf.WriteString("    if (isNaN(num)) {\n")
				buf.WriteString("      throw new Error('Invalid number');\n")
				buf.WriteString("    }\n")
				buf.WriteString("    return new Literal(num);\n")
			} else if e.Name == "IDENTIFIER" {
				buf.WriteString("    return new Identifier(value);\n")
			} else {
				buf.WriteString("    return new Literal(value);\n")
			}
		} else {
			// It's a rule reference
			buf.WriteString(fmt.Sprintf("    return this.parse%s();\n", capitalizeFirst(e.Name)))
		}

	case *Choice:
		buf.WriteString("    // Try each alternative\n")
		for i, alt := range e.Alternatives {
			if i > 0 {
				buf.WriteString("    // Try next alternative\n")
			}
			g.generateTSExpressionParsing(buf, alt, grammar)
		}

	case *Sequence:
		buf.WriteString("    // Parse sequence\n")
		for _, item := range e.Items {
			g.generateTSExpressionParsing(buf, item, grammar)
		}

	case *Repetition:
		buf.WriteString("    // Parse repetition\n")
		if e.Min == 0 && e.Max == -1 {
			buf.WriteString("    // Zero or more\n")
		} else if e.Min == 1 && e.Max == -1 {
			buf.WriteString("    // One or more\n")
		}
		g.generateTSExpressionParsing(buf, e.Expression, grammar)

	case *Optional:
		buf.WriteString("    // Parse optional\n")
		g.generateTSExpressionParsing(buf, e.Expression, grammar)

	case *Literal:
		buf.WriteString(fmt.Sprintf("    // Parse literal '%s'\n", e.Value))
		buf.WriteString("    return new Literal('" + e.Value + "');\n")

	default:
		buf.WriteString("    // TODO: Implement parsing for this expression type\n")
		buf.WriteString("    throw new Error('Not implemented');\n")
	}
}

// generateUtilities creates utility functions
func (g *TypeScriptGenerator) generateUtilities(buf *strings.Builder, grammar *Grammar) {
	buf.WriteString(`// Parse expression convenience function
export function parseExpression(input: string): Expression {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  return parser.parse();
}

// Format parsing errors nicely
export function formatError(error: Error): string {
  return "Parse error: " + error.message;
}

`)
}
