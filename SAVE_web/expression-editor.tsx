import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AlertCircle, Check, Lightbulb, Calculator, Variable, Play, Hash, RotateCcw, AlertTriangle, Info } from 'lucide-react';

// ===== MOCK PARSER & EVALUATOR ENGINE =====

// Token types for lexical analysis
const TokenType = {
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN', 
  IDENTIFIER: 'IDENTIFIER',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  MODULO: 'MODULO',
  EQ: 'EQ',
  NE: 'NE',
  LT: 'LT',
  LE: 'LE',
  GT: 'GT',
  GE: 'GE',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  IMPLIES: 'IMPLIES',
  EQUIV: 'EQUIV',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  MIN: 'MIN',
  MAX: 'MAX',
  ABS: 'ABS',
  NEGATE: 'NEGATE',
  CEIL: 'CEIL',
  FLOOR: 'FLOOR',
  THRESHOLD: 'THRESHOLD',
  ITE: 'ITE',
  XOR: 'XOR',
  EOF: 'EOF',
  INVALID: 'INVALID'
};

// Enhanced lexer with detailed position tracking
class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.keywords = new Map([
      ['true', TokenType.BOOLEAN],
      ['false', TokenType.BOOLEAN],
      ['TRUE', TokenType.BOOLEAN],
      ['FALSE', TokenType.BOOLEAN],
      ['AND', TokenType.AND],
      ['OR', TokenType.OR],
      ['NOT', TokenType.NOT],
      ['MIN', TokenType.MIN],
      ['MAX', TokenType.MAX],
      ['ABS', TokenType.ABS],
      ['NEGATE', TokenType.NEGATE],
      ['CEIL', TokenType.CEIL],
      ['FLOOR', TokenType.FLOOR],
      ['THRESHOLD', TokenType.THRESHOLD],
      ['ITE', TokenType.ITE],
      ['IMPLIES', TokenType.IMPLIES],
      ['EQUIV', TokenType.EQUIV],
      ['XOR', TokenType.XOR]
    ]);
  }

  currentPos() {
    return { line: this.line, column: this.column, offset: this.position };
  }

  peek() {
    if (this.position >= this.input.length) return '\0';
    return this.input[this.position];
  }

  peekNext() {
    if (this.position + 1 >= this.input.length) return '\0';
    return this.input[this.position + 1];
  }

  advance() {
    if (this.position >= this.input.length) return '\0';
    const ch = this.input[this.position];
    this.position++;
    if (ch === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return ch;
  }

  skipWhitespace() {
    while (/\s/.test(this.peek())) {
      this.advance();
    }
  }

  readNumber() {
    const start = this.position;
    let hasDecimal = false;
    
    while (/\d/.test(this.peek()) || (this.peek() === '.' && !hasDecimal)) {
      if (this.peek() === '.') hasDecimal = true;
      this.advance();
    }
    
    return this.input.slice(start, this.position);
  }

  readIdentifier() {
    const start = this.position;
    while (/[a-zA-Z0-9_]/.test(this.peek())) {
      this.advance();
    }
    return this.input.slice(start, this.position);
  }

  nextToken() {
    this.skipWhitespace();
    
    if (this.position >= this.input.length) {
      return { type: TokenType.EOF, value: '', position: this.currentPos() };
    }

    const startPos = this.currentPos();
    const ch = this.peek();

    // Single character tokens
    const singleChars = {
      '+': TokenType.PLUS,
      '*': TokenType.MULTIPLY,
      '/': TokenType.DIVIDE,
      '%': TokenType.MODULO,
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      ',': TokenType.COMMA
    };

    if (singleChars[ch]) {
      this.advance();
      return { type: singleChars[ch], value: ch, position: startPos };
    }

    // Multi-character operators
    if (ch === '<') {
      this.advance();
      if (this.peek() === '=') {
        this.advance();
        return { type: TokenType.LE, value: '<=', position: startPos };
      } else if (this.peek() === '-' && this.peekNext() === '>') {
        this.advance(); // consume '-'
        this.advance(); // consume '>'
        return { type: TokenType.EQUIV, value: '<->', position: startPos };
      }
      return { type: TokenType.LT, value: '<', position: startPos };
    }

    if (ch === '>') {
      this.advance();
      if (this.peek() === '=') {
        this.advance();
        return { type: TokenType.GE, value: '>=', position: startPos };
      }
      return { type: TokenType.GT, value: '>', position: startPos };
    }

    if (ch === '=') {
      this.advance();
      if (this.peek() === '=') {
        this.advance();
        return { type: TokenType.EQ, value: '==', position: startPos };
      }
      return { type: TokenType.INVALID, value: '=', position: startPos, error: "Use '==' for equality" };
    }

    if (ch === '!') {
      this.advance();
      if (this.peek() === '=') {
        this.advance();
        return { type: TokenType.NE, value: '!=', position: startPos };
      }
      return { type: TokenType.NOT, value: '!', position: startPos };
    }

    if (ch === '&') {
      this.advance();
      if (this.peek() === '&') {
        this.advance();
        return { type: TokenType.AND, value: '&&', position: startPos };
      }
      return { type: TokenType.INVALID, value: '&', position: startPos, error: "Use '&&' or 'AND'" };
    }

    if (ch === '|') {
      this.advance();
      if (this.peek() === '|') {
        this.advance();
        return { type: TokenType.OR, value: '||', position: startPos };
      }
      return { type: TokenType.INVALID, value: '|', position: startPos, error: "Use '||' or 'OR'" };
    }

    if (ch === '-') {
      this.advance();
      if (this.peek() === '>') {
        this.advance();
        return { type: TokenType.IMPLIES, value: '->', position: startPos };
      }
      return { type: TokenType.MINUS, value: '-', position: startPos };
    }

    // Numbers
    if (/\d/.test(ch)) {
      const value = this.readNumber();
      return { type: TokenType.NUMBER, value, position: startPos };
    }

    // Identifiers and keywords
    if (/[a-zA-Z]/.test(ch)) {
      const value = this.readIdentifier();
      const tokenType = this.keywords.get(value) || TokenType.IDENTIFIER;
      return { type: tokenType, value, position: startPos };
    }

    // Unknown character
    this.advance();
    return { 
      type: TokenType.INVALID, 
      value: ch, 
      position: startPos, 
      error: `Unexpected character '${ch}'` 
    };
  }

  tokenize() {
    const tokens = [];
    let token;
    do {
      token = this.nextToken();
      tokens.push(token);
    } while (token.type !== TokenType.EOF);
    return tokens;
  }
}

// Enhanced parser with better error recovery
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  peek() {
    return this.tokens[this.current] || { type: TokenType.EOF };
  }

  advance() {
    if (this.current < this.tokens.length - 1) {
      this.current++;
    }
    return this.tokens[this.current - 1];
  }

  match(...types) {
    return types.includes(this.peek().type);
  }

  consume(type, message) {
    if (this.peek().type === type) {
      return this.advance();
    }
    throw new Error(`${message} at ${this.peek().position?.line}:${this.peek().position?.column}`);
  }

  parse() {
    try {
      const expr = this.parseExpression();
      if (this.peek().type !== TokenType.EOF) {
        throw new Error(`Unexpected token after expression: ${this.peek().value}`);
      }
      return { success: true, ast: expr, errors: [] };
    } catch (error) {
      return { 
        success: false, 
        ast: null, 
        errors: [{ 
          message: error.message, 
          position: this.peek().position,
          type: 'syntax'
        }] 
      };
    }
  }

  parseExpression() {
    return this.parseLogicalOr();
  }

  parseLogicalOr() {
    let expr = this.parseLogicalAnd();
    
    while (this.match(TokenType.OR)) {
      const operator = this.advance();
      const right = this.parseLogicalAnd();
      expr = { type: 'BinaryOp', operator: operator.value, left: expr, right };
    }
    
    return expr;
  }

  parseLogicalAnd() {
    let expr = this.parseLogicalImplies();
    
    while (this.match(TokenType.AND)) {
      const operator = this.advance();
      const right = this.parseLogicalImplies();
      expr = { type: 'BinaryOp', operator: operator.value, left: expr, right };
    }
    
    return expr;
  }

  parseLogicalImplies() {
    let expr = this.parseLogicalNot();
    
    // Non-associative handling for -> and <->
    if (this.match(TokenType.IMPLIES, TokenType.EQUIV)) {
      const operator = this.advance();
      const right = this.parseLogicalNot();
      
      // Check for chaining (not allowed)
      if (this.match(TokenType.IMPLIES, TokenType.EQUIV)) {
        throw new Error(`Chained logical operators require explicit parentheses: ${operator.value}`);
      }
      
      expr = { type: 'BinaryOp', operator: operator.value, left: expr, right };
    }
    
    return expr;
  }

  parseLogicalNot() {
    if (this.match(TokenType.NOT)) {
      const operator = this.advance();
      const operand = this.parseComparison();
      return { type: 'UnaryOp', operator: operator.value, operand };
    }
    
    return this.parseComparison();
  }

  parseComparison() {
    let expr = this.parseArithmetic();
    
    if (this.match(TokenType.EQ, TokenType.NE, TokenType.LT, TokenType.LE, TokenType.GT, TokenType.GE)) {
      const operator = this.advance();
      const right = this.parseArithmetic();
      expr = { type: 'BinaryOp', operator: operator.value, left: expr, right };
    }
    
    return expr;
  }

  parseArithmetic() {
    let expr = this.parseTerm();
    
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.advance();
      const right = this.parseTerm();
      expr = { 
        type: 'BinaryOp', 
        operator: operator.value, 
        left: expr, 
        right,
        position: operator.position
      };
    }
    
    return expr;
  }

  parseTerm() {
    let expr = this.parseFactor();
    
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO, TokenType.MIN, TokenType.MAX)) {
      const operator = this.advance();
      const right = this.parseFactor();
      expr = { 
        type: 'BinaryOp', 
        operator: operator.value, 
        left: expr, 
        right,
        position: operator.position
      };
    }
    
    return expr;
  }

  parseFactor() {
    if (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.advance();
      const operand = this.parsePrimary();
      return { type: 'UnaryOp', operator: operator.value, operand };
    }
    
    return this.parsePrimary();
  }

  parsePrimary() {
    if (this.match(TokenType.NUMBER)) {
      const token = this.advance();
      return { 
        type: 'Number', 
        value: parseFloat(token.value),
        position: token.position
      };
    }
    
    if (this.match(TokenType.BOOLEAN)) {
      const token = this.advance();
      return { 
        type: 'Boolean', 
        value: token.value === 'true' || token.value === 'TRUE',
        position: token.position
      };
    }
    
    if (this.match(TokenType.IDENTIFIER)) {
      const token = this.advance();
      return { 
        type: 'Variable', 
        name: token.value,
        position: token.position
      };
    }
    
    if (this.match(TokenType.LPAREN)) {
      this.advance();
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, "Expected ')'");
      return expr;
    }
    
    // Function calls
    if (this.match(TokenType.ABS, TokenType.NEGATE, TokenType.CEIL, TokenType.FLOOR)) {
      return this.parseUnaryFunction();
    }
    
    if (this.match(TokenType.MIN, TokenType.MAX, TokenType.THRESHOLD, TokenType.XOR, TokenType.IMPLIES, TokenType.EQUIV)) {
      return this.parseBinaryFunction();
    }
    
    if (this.match(TokenType.ITE)) {
      return this.parseITEFunction();
    }
    
    throw new Error(`Unexpected token: ${this.peek().value}`);
  }

  parseUnaryFunction() {
    const func = this.advance();
    this.consume(TokenType.LPAREN, "Expected '('");
    const arg = this.parseExpression();
    this.consume(TokenType.RPAREN, "Expected ')'");
    return { type: 'FunctionCall', name: func.value, args: [arg] };
  }

  parseBinaryFunction() {
    const func = this.advance();
    this.consume(TokenType.LPAREN, "Expected '('");
    const arg1 = this.parseExpression();
    this.consume(TokenType.COMMA, "Expected ','");
    const arg2 = this.parseExpression();
    this.consume(TokenType.RPAREN, "Expected ')'");
    return { type: 'FunctionCall', name: func.value, args: [arg1, arg2] };
  }

  parseITEFunction() {
    const func = this.advance();
    this.consume(TokenType.LPAREN, "Expected '('");
    const condition = this.parseExpression();
    this.consume(TokenType.COMMA, "Expected ','");
    const thenExpr = this.parseExpression();
    this.consume(TokenType.COMMA, "Expected ','");
    const elseExpr = this.parseExpression();
    this.consume(TokenType.RPAREN, "Expected ')'");
    return { type: 'FunctionCall', name: func.value, args: [condition, thenExpr, elseExpr] };
  }
}

// Enhanced evaluator with comprehensive function support
class Evaluator {
  constructor(variables = {}) {
    this.variables = variables;
    this.errors = [];
  }

  evaluate(ast) {
    this.errors = [];
    try {
      const result = this.evaluateNode(ast);
      return { success: true, result, errors: this.errors };
    } catch (error) {
      return { 
        success: false, 
        result: null, 
        errors: [...this.errors, { message: error.message, type: 'runtime' }] 
      };
    }
  }

  evaluateNode(node) {
    switch (node.type) {
      case 'Number':
        return node.value;
      
      case 'Boolean':
        return node.value;
      
      case 'Variable':
        if (!(node.name in this.variables)) {
          throw new Error(`Undefined variable: ${node.name}`);
        }
        return this.variables[node.name];
      
      case 'UnaryOp':
        return this.evaluateUnaryOp(node);
      
      case 'BinaryOp':
        return this.evaluateBinaryOp(node);
      
      case 'FunctionCall':
        return this.evaluateFunctionCall(node);
      
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  evaluateUnaryOp(node) {
    const operand = this.evaluateNode(node.operand);
    
    switch (node.operator) {
      case '+':
        if (typeof operand !== 'number') throw new Error('Unary + requires number');
        return operand;
      case '-':
        if (typeof operand !== 'number') throw new Error('Unary - requires number');
        return -operand;
      case 'NOT':
      case '!':
        if (typeof operand !== 'boolean') throw new Error('NOT requires boolean');
        return !operand;
      default:
        throw new Error(`Unknown unary operator: ${node.operator}`);
    }
  }

  evaluateBinaryOp(node) {
    // Short-circuit evaluation for logical operators
    if (node.operator === 'AND' || node.operator === '&&') {
      const left = this.evaluateNode(node.left);
      if (typeof left !== 'boolean') throw new Error('AND requires boolean operands');
      if (!left) return false;
      const right = this.evaluateNode(node.right);
      if (typeof right !== 'boolean') throw new Error('AND requires boolean operands');
      return right;
    }
    
    if (node.operator === 'OR' || node.operator === '||') {
      const left = this.evaluateNode(node.left);
      if (typeof left !== 'boolean') throw new Error('OR requires boolean operands');
      if (left) return true;
      const right = this.evaluateNode(node.right);
      if (typeof right !== 'boolean') throw new Error('OR requires boolean operands');
      return right;
    }

    // Evaluate both operands for other operators
    const left = this.evaluateNode(node.left);
    const right = this.evaluateNode(node.right);

    switch (node.operator) {
      // Arithmetic
      case '+':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('Arithmetic requires numbers');
        return left + right;
      case '-':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('Arithmetic requires numbers');
        return left - right;
      case '*':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('Arithmetic requires numbers');
        return left * right;
      case '/':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('Division requires numbers');
        if (right === 0) throw new Error('Division by zero');
        return left / right;
      case '%':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('Modulo requires numbers');
        if (right === 0) throw new Error('Modulo by zero');
        return left % right;

      // Comparison  
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '<':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('Ordering requires numbers');
        return left < right;
      case '<=':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('Ordering requires numbers');
        return left <= right;
      case '>':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('Ordering requires numbers');
        return left > right;
      case '>=':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('Ordering requires numbers');
        return left >= right;

      // Logical
      case '->':
        if (typeof left !== 'boolean' || typeof right !== 'boolean') 
          throw new Error('Implies requires boolean operands');
        return !left || right;
      case '<->':
        if (typeof left !== 'boolean' || typeof right !== 'boolean') 
          throw new Error('Equivalence requires boolean operands');
        return left === right;

      // Math functions as operators
      case 'MIN':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('MIN requires numbers');
        return Math.min(left, right);
      case 'MAX':
        if (typeof left !== 'number' || typeof right !== 'number') 
          throw new Error('MAX requires numbers');
        return Math.max(left, right);

      default:
        throw new Error(`Unknown binary operator: ${node.operator}`);
    }
  }

  evaluateFunctionCall(node) {
    const args = node.args.map(arg => this.evaluateNode(arg));

    switch (node.name) {
      case 'ABS':
        if (args.length !== 1) throw new Error('ABS requires 1 argument');
        if (typeof args[0] !== 'number') throw new Error('ABS requires number');
        return Math.abs(args[0]);
        
      case 'NEGATE':
        if (args.length !== 1) throw new Error('NEGATE requires 1 argument');
        if (typeof args[0] !== 'number') throw new Error('NEGATE requires number');
        return -args[0];
        
      case 'CEIL':
        if (args.length !== 1) throw new Error('CEIL requires 1 argument');
        if (typeof args[0] !== 'number') throw new Error('CEIL requires number');
        return Math.ceil(args[0]);
        
      case 'FLOOR':
        if (args.length !== 1) throw new Error('FLOOR requires 1 argument');
        if (typeof args[0] !== 'number') throw new Error('FLOOR requires number');
        return Math.floor(args[0]);

      case 'MIN':
        if (args.length !== 2) throw new Error('MIN requires 2 arguments');
        if (typeof args[0] !== 'number' || typeof args[1] !== 'number') 
          throw new Error('MIN requires numbers');
        return Math.min(args[0], args[1]);
        
      case 'MAX':
        if (args.length !== 2) throw new Error('MAX requires 2 arguments');
        if (typeof args[0] !== 'number' || typeof args[1] !== 'number') 
          throw new Error('MAX requires numbers');
        return Math.max(args[0], args[1]);

      case 'THRESHOLD':
        if (args.length !== 2) throw new Error('THRESHOLD requires 2 arguments');
        if (typeof args[0] !== 'number' || typeof args[1] !== 'number') 
          throw new Error('THRESHOLD requires numbers');
        return args[0] >= args[1];

      case 'ITE':
        if (args.length !== 3) throw new Error('ITE requires 3 arguments');
        if (typeof args[0] !== 'boolean') throw new Error('ITE condition must be boolean');
        return args[0] ? args[1] : args[2];

      case 'IMPLIES':
        if (args.length !== 2) throw new Error('IMPLIES requires 2 arguments');
        if (typeof args[0] !== 'boolean' || typeof args[1] !== 'boolean') 
          throw new Error('IMPLIES requires booleans');
        return !args[0] || args[1];

      case 'EQUIV':
        if (args.length !== 2) throw new Error('EQUIV requires 2 arguments');
        if (typeof args[0] !== 'boolean' || typeof args[1] !== 'boolean') 
          throw new Error('EQUIV requires booleans');
        return args[0] === args[1];

      case 'XOR':
        if (args.length !== 2) throw new Error('XOR requires 2 arguments');
        if (typeof args[0] !== 'boolean' || typeof args[1] !== 'boolean') 
          throw new Error('XOR requires booleans');
        return args[0] !== args[1];

      default:
        throw new Error(`Unknown function: ${node.name}`);
    }
  }
}

// ===== PHASE 3: AUTO-FORMATTER =====

class ExpressionFormatter {
  constructor() {
    this.indentSize = 2;
  }

  format(expression) {
    try {
      const lexer = new Lexer(expression);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const result = parser.parse();
      
      if (!result.success) {
        // If parse fails, try basic formatting
        return this.basicFormat(expression);
      }
      
      return this.formatAST(result.ast, 0);
    } catch (error) {
      return this.basicFormat(expression);
    }
  }

  basicFormat(expression) {
    // Basic formatting for invalid expressions
    let formatted = expression;
    
    // Add spaces around operators
    formatted = formatted.replace(/([+\-*/%<>=!&|])/g, ' $1 ');
    formatted = formatted.replace(/([<>])(\s*)(=)/g, '$1$3');
    formatted = formatted.replace(/([!])(\s*)(=)/g, '$1$3');
    formatted = formatted.replace(/([&])(\s*)([&])/g, '$1$3');
    formatted = formatted.replace(/([|])(\s*)([|])/g, '$1$3');
    formatted = formatted.replace(/(<)(\s*)(-)\s*(>)/g, '$1$3$4');
    formatted = formatted.replace(/(-)(\s*)(>)/g, '$1$3');
    
    // Clean up multiple spaces
    formatted = formatted.replace(/\s+/g, ' ');
    
    // Add spaces after commas
    formatted = formatted.replace(/,\s*/g, ', ');
    
    // Clean up spaces around parentheses
    formatted = formatted.replace(/\(\s+/g, '(');
    formatted = formatted.replace(/\s+\)/g, ')');
    
    return formatted.trim();
  }

  formatAST(node, depth = 0) {
    if (!node) return '';
    
    const indent = ' '.repeat(depth * this.indentSize);
    
    switch (node.type) {
      case 'Number':
        return node.value.toString();
      
      case 'Boolean':
        return node.value.toString();
      
      case 'Variable':
        return node.name;
      
      case 'UnaryOp':
        const operand = this.formatAST(node.operand, depth);
        if (node.operator === 'NOT') {
          return `NOT ${operand}`;
        }
        return `${node.operator}${operand}`;
      
      case 'BinaryOp':
        const left = this.formatAST(node.left, depth);
        const right = this.formatAST(node.right, depth);
        
        // Check if we need to wrap in parentheses based on complexity
        const needsParens = this.needsParentheses(node);
        const formatted = `${left} ${node.operator} ${right}`;
        
        return needsParens ? `(${formatted})` : formatted;
      
      case 'FunctionCall':
        const args = node.args.map(arg => this.formatAST(arg, depth + 1));
        
        if (node.name === 'ITE' && args.length === 3) {
          // Special formatting for ITE - multi-line if complex
          const isComplex = node.args.some(arg => this.isComplexExpression(arg));
          
          if (isComplex) {
            return `ITE(\n${indent}  ${args[0]},\n${indent}  ${args[1]},\n${indent}  ${args[2]}\n${indent})`;
          }
        }
        
        return `${node.name}(${args.join(', ')})`;
      
      default:
        return '';
    }
  }

  needsParentheses(node) {
    // Add parentheses for complex nested expressions
    if (node.type !== 'BinaryOp') return false;
    
    const hasNestedBinaryOp = (n) => {
      if (!n) return false;
      if (n.type === 'BinaryOp') return true;
      if (n.left && hasNestedBinaryOp(n.left)) return true;
      if (n.right && hasNestedBinaryOp(n.right)) return true;
      return false;
    };
    
    return hasNestedBinaryOp(node.left) || hasNestedBinaryOp(node.right);
  }

  isComplexExpression(node) {
    if (!node) return false;
    
    const countNodes = (n) => {
      if (!n) return 0;
      let count = 1;
      if (n.left) count += countNodes(n.left);
      if (n.right) count += countNodes(n.right);
      if (n.operand) count += countNodes(n.operand);
      if (n.args) count += n.args.reduce((sum, arg) => sum + countNodes(arg), 0);
      return count;
    };
    
    return countNodes(node) > 3;
  }
}

// ===== PHASE 3: BRACKET MATCHING =====

const findMatchingBracket = (text, cursorPos) => {
  const brackets = { '(': ')', ')': '(' };
  const openBrackets = ['('];
  const closeBrackets = [')'];
  
  if (cursorPos >= text.length) return null;
  
  const char = text[cursorPos];
  if (!brackets[char]) return null;
  
  const isOpenBracket = openBrackets.includes(char);
  const matchingChar = brackets[char];
  const direction = isOpenBracket ? 1 : -1;
  const start = cursorPos + direction;
  
  let depth = 1;
  let pos = start;
  
  while (pos >= 0 && pos < text.length && depth > 0) {
    const currentChar = text[pos];
    
    if (currentChar === char) {
      depth++;
    } else if (currentChar === matchingChar) {
      depth--;
    }
    
    if (depth === 0) {
      return { start: cursorPos, end: pos, char, matchingChar };
    }
    
    pos += direction;
  }
  
  return null;
};

// ===== PHASE 3: SEMANTIC VALIDATION =====

class SemanticValidator {
  constructor() {
    this.warnings = [];
    this.suggestions = [];
  }

  validate(ast, variables) {
    this.warnings = [];
    this.suggestions = [];
    
    if (!ast) return { warnings: this.warnings, suggestions: this.suggestions };
    
    this.validateNode(ast, variables);
    
    return {
      warnings: this.warnings,
      suggestions: this.suggestions
    };
  }

  validateNode(node, variables) {
    if (!node) return;
    
    switch (node.type) {
      case 'Variable':
        this.validateVariable(node, variables);
        break;
      
      case 'BinaryOp':
        this.validateBinaryOp(node, variables);
        break;
      
      case 'UnaryOp':
        this.validateUnaryOp(node, variables);
        break;
      
      case 'FunctionCall':
        this.validateFunctionCall(node, variables);
        break;
    }
    
    // Recursively validate child nodes
    if (node.left) this.validateNode(node.left, variables);
    if (node.right) this.validateNode(node.right, variables);
    if (node.operand) this.validateNode(node.operand, variables);
    if (node.args) node.args.forEach(arg => this.validateNode(arg, variables));
  }

  validateVariable(node, variables) {
    if (!(node.name in variables)) {
      this.warnings.push({
        type: 'undefined-variable',
        message: `Variable '${node.name}' is not defined`,
        suggestion: `Define variable '${node.name}' or check spelling`,
        severity: 'error'
      });
    }
  }

  validateBinaryOp(node, variables) {
    // Check for potential type mismatches
    const leftType = this.inferType(node.left, variables);
    const rightType = this.inferType(node.right, variables);
    
    if (leftType && rightType && leftType !== rightType) {
      if (['==', '!='].includes(node.operator)) {
        this.warnings.push({
          type: 'type-mismatch',
          message: `Comparing ${leftType} with ${rightType}`,
          suggestion: `Ensure both operands are the same type`,
          severity: 'warning'
        });
      } else if (['+', '-', '*', '/', '%', '<', '<=', '>', '>='].includes(node.operator)) {
        if (leftType !== 'number' || rightType !== 'number') {
          this.warnings.push({
            type: 'type-mismatch',
            message: `Arithmetic operation requires numbers, got ${leftType} and ${rightType}`,
            suggestion: `Use numeric expressions for arithmetic`,
            severity: 'error'
          });
        }
      }
    }

    // Suggest more readable alternatives
    if (node.operator === '!=' && node.left.type === 'Boolean' && node.right.type === 'Boolean') {
      this.suggestions.push({
        type: 'readability',
        message: `Consider using XOR for boolean inequality`,
        suggestion: `Replace '!=' with 'XOR()' for boolean comparisons`,
        severity: 'info'
      });
    }
  }

  validateUnaryOp(node, variables) {
    const operandType = this.inferType(node.operand, variables);
    
    if (operandType) {
      if ((node.operator === '+' || node.operator === '-') && operandType !== 'number') {
        this.warnings.push({
          type: 'type-mismatch',
          message: `Unary ${node.operator} requires number, got ${operandType}`,
          suggestion: `Use numeric expression`,
          severity: 'error'
        });
      } else if ((node.operator === 'NOT' || node.operator === '!') && operandType !== 'boolean') {
        this.warnings.push({
          type: 'type-mismatch',
          message: `NOT requires boolean, got ${operandType}`,
          suggestion: `Use boolean expression`,
          severity: 'error'
        });
      }
    }
  }

  validateFunctionCall(node, variables) {
    // Validate argument counts and types
    const argTypes = node.args.map(arg => this.inferType(arg, variables));
    
    switch (node.name) {
      case 'ITE':
        if (argTypes[0] && argTypes[0] !== 'boolean') {
          this.warnings.push({
            type: 'type-mismatch',
            message: `ITE condition must be boolean, got ${argTypes[0]}`,
            suggestion: `Use boolean expression for condition`,
            severity: 'error'
          });
        }
        break;
      
      case 'THRESHOLD':
        if (argTypes.some(t => t && t !== 'number')) {
          this.warnings.push({
            type: 'type-mismatch',
            message: `THRESHOLD requires numeric arguments`,
            suggestion: `Use numeric expressions`,
            severity: 'error'
          });
        }
        break;
    }
  }

  inferType(node, variables) {
    if (!node) return null;
    
    switch (node.type) {
      case 'Number':
        return 'number';
      case 'Boolean':
        return 'boolean';
      case 'Variable':
        if (node.name in variables) {
          return typeof variables[node.name];
        }
        return null;
      case 'BinaryOp':
        if (['+', '-', '*', '/', '%'].includes(node.operator)) {
          return 'number';
        } else if (['==', '!=', '<', '<=', '>', '>=', 'AND', '&&', 'OR', '||', '->', '<->'].includes(node.operator)) {
          return 'boolean';
        }
        break;
      case 'UnaryOp':
        if (['+', '-'].includes(node.operator)) {
          return 'number';
        } else if (['NOT', '!'].includes(node.operator)) {
          return 'boolean';
        }
        break;
      case 'FunctionCall':
        if (['ABS', 'NEGATE', 'CEIL', 'FLOOR', 'MIN', 'MAX'].includes(node.name)) {
          return 'number';
        } else if (['THRESHOLD', 'IMPLIES', 'EQUIV', 'XOR'].includes(node.name)) {
          return 'boolean';
        }
        break;
    }
    
    return null;
  }
}

// ===== PHASE 3: AUTO-INDENTATION =====

const calculateIndentation = (text, cursorPos) => {
  const lines = text.slice(0, cursorPos).split('\n');
  const currentLine = lines[lines.length - 1];
  
  let indent = 0;
  let openParens = 0;
  
  // Count open parentheses up to cursor
  for (let i = 0; i < cursorPos; i++) {
    if (text[i] === '(') openParens++;
    else if (text[i] === ')') openParens--;
  }
  
  // Base indentation on open parentheses
  indent = Math.max(0, openParens * 2);
  
  // Special cases for function calls
  const beforeCursor = text.slice(0, cursorPos);
  const afterComma = /,\s*$/.test(currentLine);
  const inFunction = /\w+\([^)]*$/.test(beforeCursor);
  
  if (afterComma && inFunction) {
    indent += 2; // Extra indent after comma in function
  }
  
  return ' '.repeat(indent);
};

// Enhanced variable extraction with type inference - FIXED
function extractVariablesWithTypes(ast, variables = {}) {
  const foundVars = new Map();
  
  function traverse(node, expectedType = 'unknown') {
    if (!node) return;
    
    switch (node.type) {
      case 'Variable':
        if (!foundVars.has(node.name)) {
          foundVars.set(node.name, {
            name: node.name,
            type: expectedType,
            usages: []
          });
        }
        foundVars.get(node.name).usages.push({ context: expectedType });
        break;
        
      case 'BinaryOp':
        // Infer types based on operator context
        if (['==', '!='].includes(node.operator)) {
          traverse(node.left, 'any');
          traverse(node.right, 'any');
        } else if (['<', '<=', '>', '>=', '+', '-', '*', '/', '%', 'MIN', 'MAX'].includes(node.operator)) {
          traverse(node.left, 'number');
          traverse(node.right, 'number');
        } else if (['AND', '&&', 'OR', '||', '->', '<->'].includes(node.operator)) {
          traverse(node.left, 'boolean');
          traverse(node.right, 'boolean');
        } else {
          traverse(node.left);
          traverse(node.right);
        }
        break;
        
      case 'UnaryOp':
        if (node.operator === 'NOT' || node.operator === '!') {
          traverse(node.operand, 'boolean');
        } else if (node.operator === '+' || node.operator === '-') {
          traverse(node.operand, 'number');
        } else {
          traverse(node.operand);
        }
        break;
        
      case 'FunctionCall':
        // Type inference for function arguments
        const typeMap = {
          'ABS': ['number'], 'NEGATE': ['number'], 'CEIL': ['number'], 'FLOOR': ['number'],
          'MIN': ['number', 'number'], 'MAX': ['number', 'number'],
          'THRESHOLD': ['number', 'number'],
          'ITE': ['boolean', 'any', 'any'],
          'IMPLIES': ['boolean', 'boolean'], 'EQUIV': ['boolean', 'boolean'], 'XOR': ['boolean', 'boolean']
        };
        
        const argTypes = typeMap[node.name] || [];
        if (node.args) {
          node.args.forEach((arg, i) => {
            traverse(arg, argTypes[i] || 'unknown');
          });
        }
        break;
        
      default:
        if (node.left) traverse(node.left);
        if (node.right) traverse(node.right);
        if (node.operand) traverse(node.operand);
        if (node.args) node.args.forEach(arg => traverse(arg));
    }
  }
  
  traverse(ast);
  
  // Merge with existing variables and add current values
  const result = Array.from(foundVars.values()).map(varInfo => {
    // Infer type from current value if available
    let inferredType = varInfo.type;
    if (varInfo.name in variables && variables[varInfo.name] !== undefined) {
      const currentType = typeof variables[varInfo.name];
      if (currentType === 'number' || currentType === 'boolean') {
        inferredType = currentType;
      }
    }
    
    return {
      ...varInfo,
      type: inferredType === 'unknown' && varInfo.name in variables 
        ? typeof variables[varInfo.name] 
        : inferredType,
      value: variables[varInfo.name],
      isDefined: varInfo.name in variables
    };
  });
  
  return result;
}

// Auto-completion engine
const createAutoCompleteEngine = () => {
  const keywords = [
    // Literals
    { text: 'true', type: 'boolean', description: 'Boolean true literal' },
    { text: 'false', type: 'boolean', description: 'Boolean false literal' },
    
    // Operators
    { text: 'AND', type: 'operator', description: 'Logical AND operator' },
    { text: 'OR', type: 'operator', description: 'Logical OR operator' },
    { text: 'NOT', type: 'operator', description: 'Logical NOT operator' },
    
    // Math functions
    { text: 'ABS(', type: 'function', description: 'Absolute value function' },
    { text: 'NEGATE(', type: 'function', description: 'Negation function' },
    { text: 'CEIL(', type: 'function', description: 'Ceiling function' },
    { text: 'FLOOR(', type: 'function', description: 'Floor function' },
    { text: 'MIN(', type: 'function', description: 'Minimum of two values' },
    { text: 'MAX(', type: 'function', description: 'Maximum of two values' },
    { text: 'THRESHOLD(', type: 'function', description: 'Threshold comparison (x >= threshold)' },
    
    // Logical functions
    { text: 'ITE(', type: 'function', description: 'If-then-else conditional' },
    { text: 'IMPLIES(', type: 'function', description: 'Logical implication function' },
    { text: 'EQUIV(', type: 'function', description: 'Logical equivalence function' },
    { text: 'XOR(', type: 'function', description: 'Exclusive OR function' }
  ];

  return {
    getSuggestions(input, cursorPos, variables = []) {
      const beforeCursor = input.slice(0, cursorPos);
      const afterCursor = input.slice(cursorPos);
      
      // Find current word being typed
      const wordMatch = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
      const currentWord = wordMatch ? wordMatch[0] : '';
      
      const suggestions = [];
      
      // Add keyword suggestions
      keywords.forEach(keyword => {
        if (keyword.text.toLowerCase().startsWith(currentWord.toLowerCase())) {
          suggestions.push({
            ...keyword,
            insertText: keyword.text,
            detail: keyword.description
          });
        }
      });
      
      // Add variable suggestions
      variables.forEach(variable => {
        if (variable.name.toLowerCase().startsWith(currentWord.toLowerCase())) {
          suggestions.push({
            text: variable.name,
            type: 'variable',
            description: `Variable (${variable.type || 'unknown'})`,
            insertText: variable.name,
            detail: variable.isDefined ? `Value: ${variable.value}` : 'Undefined'
          });
        }
      });
      
      // Context-aware suggestions
      const context = this.analyzeContext(beforeCursor);
      if (context.expectsOperator) {
        const operators = ['==', '!=', '<', '<=', '>', '>=', '+', '-', '*', 'AND', 'OR', '->', '<->'];
        operators.forEach(op => {
          if (op.toLowerCase().includes(currentWord.toLowerCase())) {
            suggestions.push({
              text: op,
              type: 'operator',
              description: `${op} operator`,
              insertText: op,
              detail: 'Operator'
            });
          }
        });
      }
      
      return suggestions.slice(0, 10); // Limit to 10 suggestions
    },

    analyzeContext(text) {
      const tokens = text.trim().split(/\s+/);
      const lastToken = tokens[tokens.length - 1];
      
      // Simple context analysis
      return {
        expectsOperator: /[a-zA-Z0-9_)]$/.test(text),
        expectsOperand: /[+\-*/=<>!&|,]$/.test(text),
        inFunction: text.includes('(') && !text.includes(')'),
        lastToken
      };
    }
  };
};

// ===== REACT COMPONENTS =====

// Enhanced syntax highlighter with bracket matching
const SyntaxHighlighter = ({ text, errors = [], bracketMatch = null }) => {
  const highlightText = useCallback((text) => {
    if (!text) return [];
    
    const lexer = new Lexer(text);
    const tokens = lexer.tokenize();
    const elements = [];
    
    let currentIndex = 0;
    
    tokens.forEach((token, i) => {
      if (token.type === TokenType.EOF) return;
      
      const startPos = token.position?.offset || currentIndex;
      
      // Add any unhighlighted text before this token
      if (startPos > currentIndex) {
        elements.push({
          type: 'text',
          content: text.slice(currentIndex, startPos),
          index: elements.length
        });
      }
      
      const endPos = startPos + token.value.length;
      
      // Determine token class
      let className = 'text-gray-800';
      
      // Check for bracket highlighting
      const isBracketMatch = bracketMatch && 
        (startPos === bracketMatch.start || startPos === bracketMatch.end);
      
      if (isBracketMatch) {
        className = 'text-gray-800 bg-yellow-200 border border-yellow-400 rounded';
      } else if (token.type === TokenType.INVALID) {
        className = 'text-red-600 bg-red-100 rounded px-1';
      } else if ([TokenType.NUMBER].includes(token.type)) {
        className = 'text-blue-600 font-medium';
      } else if ([TokenType.BOOLEAN].includes(token.type)) {
        className = 'text-purple-600 font-medium';
      } else if ([TokenType.IDENTIFIER].includes(token.type)) {
        className = 'text-green-600';
      } else if ([TokenType.PLUS, TokenType.MINUS, TokenType.MULTIPLY, TokenType.DIVIDE, 
                 TokenType.EQ, TokenType.NE, TokenType.LT, TokenType.LE, TokenType.GT, TokenType.GE,
                 TokenType.IMPLIES, TokenType.EQUIV].includes(token.type)) {
        className = 'text-orange-600 font-bold';
      } else if ([TokenType.AND, TokenType.OR, TokenType.NOT].includes(token.type)) {
        className = 'text-red-600 font-bold';
      } else if ([TokenType.MIN, TokenType.MAX, TokenType.ABS, TokenType.NEGATE, TokenType.CEIL, 
                 TokenType.FLOOR, TokenType.THRESHOLD, TokenType.ITE, TokenType.XOR].includes(token.type)) {
        className = 'text-indigo-600 font-bold';
      } else if ([TokenType.LPAREN, TokenType.RPAREN, TokenType.COMMA].includes(token.type)) {
        className = 'text-gray-600';
      }
      
      elements.push({
        type: 'token',
        content: token.value,
        className,
        index: elements.length,
        token
      });
      
      currentIndex = endPos;
    });
    
    // Add any remaining text
    if (currentIndex < text.length) {
      elements.push({
        type: 'text',
        content: text.slice(currentIndex),
        index: elements.length
      });
    }
    
    return elements;
  }, [bracketMatch]);

  const elements = highlightText(text);
  
  return (
    <pre className="whitespace-pre-wrap font-mono text-sm leading-6">
      {elements.map(element => (
        <span key={element.index} className={element.className}>
          {element.content}
        </span>
      ))}
    </pre>
  );
};

// Line numbers component
const LineNumbers = ({ text, visible }) => {
  if (!visible) return null;
  
  const lines = text.split('\n');
  const lineCount = Math.max(1, lines.length);
  
  return (
    <div className="flex-shrink-0 w-12 bg-gray-50 border-r border-gray-200 text-xs text-gray-500 text-right pr-2 py-4 font-mono leading-6">
      {Array.from({ length: lineCount }, (_, i) => (
        <div key={i + 1} className="h-6 flex items-center justify-end">
          {i + 1}
        </div>
      ))}
    </div>
  );
};

// Auto-complete popup component
const AutoCompletePopup = ({ suggestions, selectedIndex, onSelect, onClose, position }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div 
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      style={{ top: position.top, left: position.left, minWidth: '250px' }}
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
            index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(suggestion)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                suggestion.type === 'function' ? 'bg-indigo-100 text-indigo-800' :
                suggestion.type === 'variable' ? 'bg-green-100 text-green-800' :
                suggestion.type === 'operator' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {suggestion.type}
              </span>
              <span className="font-medium">{suggestion.text}</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-1">{suggestion.description}</div>
          {suggestion.detail && (
            <div className="text-xs text-gray-500 mt-1">{suggestion.detail}</div>
          )}
        </div>
      ))}
    </div>
  );
};

// Enhanced results panel
const ResultsPanel = ({ result, variables, executionTime, ast }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Calculator className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Evaluation Results</h3>
      </div>

      {result?.success ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Successfully evaluated</span>
            {executionTime && (
              <span className="text-xs text-gray-500">({executionTime}ms)</span>
            )}
          </div>
          
          <div className="bg-white p-3 rounded border">
            <div className="text-sm text-gray-600 mb-1">Result:</div>
            <div className="font-mono text-lg">
              <span className={`${
                typeof result.result === 'boolean' ? 'text-purple-600' : 'text-blue-600'
              }`}>
                {typeof result.result === 'boolean' ? result.result.toString() : result.result}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                ({typeof result.result})
              </span>
            </div>
          </div>

          {variables && variables.length > 0 && (
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-600 mb-2">Variable Values:</div>
              <div className="space-y-1">
                {variables.map(variable => (
                  <div key={variable.name} className="flex justify-between items-center text-sm">
                    <span className="font-mono text-green-600">{variable.name}</span>
                    <span className="font-mono">
                      {variable.isDefined ? (
                        <span className={typeof variable.value === 'boolean' ? 'text-purple-600' : 'text-blue-600'}>
                          {variable.value?.toString()}
                        </span>
                      ) : (
                        <span className="text-red-600">undefined</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Evaluation failed</span>
          </div>
          
          {result?.errors?.map((error, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
              <div className="text-sm text-red-800">{error.message}</div>
              {error.type && (
                <div className="text-xs text-red-600 mt-1">Type: {error.type}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Variable panel component
const VariablePanel = ({ variables, onVariableChange }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Variable className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-gray-900">Variables</h3>
      </div>

      {variables && variables.length > 0 ? (
        <div className="space-y-3">
          {variables.map(variable => (
            <div key={variable.name} className="bg-white p-3 rounded border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-green-600 font-medium">{variable.name}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  variable.type === 'number' ? 'bg-blue-100 text-blue-800' :
                  variable.type === 'boolean' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {variable.type || 'unknown'}
                </span>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Value:</label>
                {variable.type === 'boolean' || (variable.value !== undefined && typeof variable.value === 'boolean') ? (
                  <select
                    value={variable.value?.toString() || 'undefined'}
                    onChange={(e) => {
                      const value = e.target.value === 'undefined' ? undefined : e.target.value === 'true';
                      onVariableChange(variable.name, value);
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="undefined">undefined</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    value={variable.value?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      onVariableChange(variable.name, value);
                    }}
                    placeholder="Enter number..."
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                Used {variable.usages?.length || 0} time{variable.usages?.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-4">
          No variables detected in expression
        </div>
      )}
    </div>
  );
};

// Warnings panel component
const WarningsPanel = ({ warnings, suggestions }) => {
  const allIssues = [...(warnings || []), ...(suggestions || [])];
  
  if (allIssues.length === 0) return null;

  return (
    <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <h3 className="font-semibold text-gray-900">Code Analysis</h3>
      </div>

      <div className="space-y-2">
        {allIssues.map((issue, index) => (
          <div key={index} className={`p-3 rounded border ${
            issue.severity === 'error' ? 'bg-red-50 border-red-200' :
            issue.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start space-x-2">
              {issue.severity === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              ) : issue.severity === 'warning' ? (
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              ) : (
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  issue.severity === 'error' ? 'text-red-800' :
                  issue.severity === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {issue.message}
                </div>
                {issue.suggestion && (
                  <div className={`text-xs mt-1 ${
                    issue.severity === 'error' ? 'text-red-700' :
                    issue.severity === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    💡 {issue.suggestion}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Expression Editor Component
const ExpressionEditor = () => {
  const [expression, setExpression] = useState('ITE(x > 5 AND y < 10, x * y, ABS(x - y))');
  const [variables, setVariables] = useState({ x: 7, y: 3 });
  const [parseResult, setParseResult] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [detectedVariables, setDetectedVariables] = useState([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [autoCompletePosition, setAutoCompletePosition] = useState({ top: 0, left: 0 });
  const [executionTime, setExecutionTime] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [bracketMatch, setBracketMatch] = useState(null);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [validationResult, setValidationResult] = useState({ warnings: [], suggestions: [] });
  
  const textareaRef = useRef(null);
  const autoCompleteEngine = useMemo(() => createAutoCompleteEngine(), []);
  const formatter = useMemo(() => new ExpressionFormatter(), []);
  const validator = useMemo(() => new SemanticValidator(), []);

  // Parse expression whenever it changes
  useEffect(() => {
    const parseExpression = () => {
      try {
        const lexer = new Lexer(expression);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const result = parser.parse();
        
        setParseResult(result);
        
        if (result.success) {
          const extractedVars = extractVariablesWithTypes(result.ast, variables);
          setDetectedVariables(extractedVars);
          
          // Run semantic validation
          const validation = validator.validate(result.ast, variables);
          setValidationResult(validation);
        } else {
          setDetectedVariables([]);
          setValidationResult({ warnings: [], suggestions: [] });
        }
      } catch (error) {
        setParseResult({
          success: false,
          errors: [{ message: error.message, type: 'parse' }]
        });
        setDetectedVariables([]);
        setValidationResult({ warnings: [], suggestions: [] });
      }
    };

    const timeoutId = setTimeout(parseExpression, 100);
    return () => clearTimeout(timeoutId);
  }, [expression, variables, validator]);

  // Evaluate expression whenever parse result or variables change
  useEffect(() => {
    if (parseResult?.success) {
      const startTime = performance.now();
      
      try {
        const evaluator = new Evaluator(variables);
        const result = evaluator.evaluate(parseResult.ast);
        const endTime = performance.now();
        
        setEvaluationResult(result);
        setExecutionTime(Math.round((endTime - startTime) * 1000) / 1000);
      } catch (error) {
        setEvaluationResult({
          success: false,
          errors: [{ message: error.message, type: 'evaluation' }]
        });
        setExecutionTime(null);
      }
    } else {
      setEvaluationResult(null);
      setExecutionTime(null);
    }
  }, [parseResult, variables]);

  // Update bracket matching on cursor position change
  useEffect(() => {
    const match = findMatchingBracket(expression, cursorPosition);
    setBracketMatch(match);
  }, [expression, cursorPosition]);

  // Handle input changes 
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setExpression(value);
    setCursorPosition(cursorPos);
    
    // Disable auto-complete popup
    setShowAutoComplete(false);
  }, []);

  // Handle auto-complete selection
  const handleAutoCompleteSelect = useCallback((suggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const beforeCursor = expression.slice(0, cursorPos);
    const afterCursor = expression.slice(cursorPos);
    
    // Find current word to replace
    const wordMatch = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    const replaceStart = wordMatch ? cursorPos - wordMatch[0].length : cursorPos;
    
    const newExpression = expression.slice(0, replaceStart) + suggestion.insertText + afterCursor;
    const newCursorPos = replaceStart + suggestion.insertText.length;
    
    setExpression(newExpression);
    setShowAutoComplete(false);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [expression]);

  // Handle keyboard navigation and shortcuts
  const handleKeyDown = useCallback((e) => {
    // Handle keyboard shortcuts
    switch (e.key) {
      case 'Enter':
        // Auto-indentation on Enter
        if (!e.shiftKey) {
          e.preventDefault();
          const textarea = textareaRef.current;
          if (!textarea) return;
          
          const cursorPos = textarea.selectionStart;
          const indent = calculateIndentation(expression, cursorPos);
          const beforeCursor = expression.slice(0, cursorPos);
          const afterCursor = expression.slice(cursorPos);
          const newExpression = beforeCursor + '\n' + indent + afterCursor;
          const newCursorPos = cursorPos + 1 + indent.length;
          
          setExpression(newExpression);
          setTimeout(() => {
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
        }
        break;
    }
  }, [expression]);

  // Handle cursor position changes
  const handleCursorChange = useCallback((e) => {
    setCursorPosition(e.target.selectionStart);
  }, []);

  // Handle variable value changes
  const handleVariableChange = useCallback((name, value) => {
    setVariables(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Auto-format function with cursor position preservation
  const handleFormat = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const currentCursorPos = textarea.selectionStart;
    const formatted = formatter.format(expression);
    
    setExpression(formatted);
    
    // Calculate new cursor position after formatting
    // For now, place cursor at the end to avoid misalignment
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(formatted.length, formatted.length);
      }
    }, 0);
  }, [expression, formatter]);

  // Handle paste with auto-formatting and proper cursor positioning
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const beforeCursor = expression.slice(0, cursorPos);
    const afterCursor = expression.slice(cursorPos);
    
    // Try to format the pasted text
    const formattedPaste = formatter.format(pastedText);
    const newExpression = beforeCursor + formattedPaste + afterCursor;
    const newCursorPos = beforeCursor.length + formattedPaste.length;
    
    setExpression(newExpression);
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [expression, formatter]);

  // Quick action buttons
  const handleQuickAction = useCallback((action) => {
    switch (action) {
      case 'evaluate':
        // Force re-evaluation by clearing and re-setting parse result
        if (parseResult?.success && parseResult.ast) {
          const startTime = performance.now();
          
          try {
            const evaluator = new Evaluator(variables);
            const result = evaluator.evaluate(parseResult.ast);
            const endTime = performance.now();
            
            setEvaluationResult(result);
            setExecutionTime(Math.round((endTime - startTime) * 1000) / 1000);
          } catch (error) {
            setEvaluationResult({
              success: false,
              errors: [{ message: error.message, type: 'evaluation' }]
            });
            setExecutionTime(null);
          }
        }
        break;
      case 'clear':
        setExpression('');
        setVariables({});
        setEvaluationResult(null);
        setExecutionTime(null);
        break;
      case 'sample':
        setExpression('ITE(temperature > 20 AND humidity < 80, comfort_level * 0.9, comfort_level * 0.6)');
        setVariables({ temperature: 25, humidity: 65, comfort_level: 8 });
        break;
      case 'format':
        handleFormat();
        break;
      case 'toggleLineNumbers':
        setShowLineNumbers(prev => !prev);
        break;
    }
  }, [parseResult, variables, handleFormat]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Expression Language Editor</h1>
        <p className="text-gray-600">
          Professional-grade expression editor with auto-formatting, bracket matching, and semantic validation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Expression Editor</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleQuickAction('format')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Format expression (Ctrl+Shift+F)"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Format
                </button>
                <button
                  onClick={() => handleQuickAction('toggleLineNumbers')}
                  className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    showLineNumbers ? 'text-blue-700 bg-blue-50' : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                  title="Toggle line numbers"
                >
                  <Hash className="h-4 w-4 mr-1" />
                  Lines
                </button>
                <button
                  onClick={() => handleQuickAction('evaluate')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Evaluate
                </button>
                <button
                  onClick={() => handleQuickAction('sample')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Sample
                </button>
                <button
                  onClick={() => handleQuickAction('clear')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="relative flex">
              <LineNumbers text={expression} visible={showLineNumbers} />
              
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={expression}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onSelect={handleCursorChange}
                  onPaste={handlePaste}
                  placeholder="Enter your expression here..."
                  className="w-full h-48 p-4 font-mono text-sm resize-none border-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent relative z-10 leading-6"
                  style={{ color: 'transparent', caretColor: 'black' }}
                />
                
                <div className="absolute inset-4 pointer-events-none z-0">
                  <SyntaxHighlighter 
                    text={expression} 
                    errors={parseResult?.errors || []}
                    bracketMatch={bracketMatch}
                  />
                </div>
              </div>
            </div>
            
            {/* Error display */}
            {parseResult?.errors && parseResult.errors.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-red-50">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Syntax Errors</span>
                </div>
                <div className="space-y-1">
                  {parseResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">
                      {error.message}
                      {error.position && (
                        <span className="text-red-600 ml-2">
                          (line {error.position.line}, column {error.position.column})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <ResultsPanel 
            result={evaluationResult}
            variables={detectedVariables}
            executionTime={executionTime}
            ast={parseResult?.ast}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <VariablePanel 
            variables={detectedVariables}
            onVariableChange={handleVariableChange}
          />
          
          {/* Warnings and Suggestions Panel */}
          <WarningsPanel 
            warnings={validationResult.warnings}
            suggestions={validationResult.suggestions}
          />
          
          {/* Quick Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Reference</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div><code className="bg-blue-100 px-1 rounded">Ctrl+Space</code> - Auto-complete</div>
              <div><code className="bg-blue-100 px-1 rounded">Enter</code> - Auto-indent</div>
              <div><code className="bg-blue-100 px-1 rounded">Ctrl+Shift+F</code> - Format</div>
              <div><code className="bg-blue-100 px-1 rounded">Tab/Enter</code> - Accept suggestion</div>
              <div><code className="bg-blue-100 px-1 rounded">-></code> - Implies operator</div>
              <div><code className="bg-blue-100 px-1 rounded">&lt;-></code> - Equivalence operator</div>
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="font-medium mb-1">Functions:</div>
                <div><code className="bg-blue-100 px-1 rounded">ITE(cond, then, else)</code></div>
                <div><code className="bg-blue-100 px-1 rounded">THRESHOLD(x, limit)</code></div>
                <div><code className="bg-blue-100 px-1 rounded">MIN/MAX(a, b)</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpressionEditor;