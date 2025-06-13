// frontend_evaluation.ts - Frontend Expression Evaluation Implementation Example
// This shows how ITE, ->, and <-> are handled in the generated TypeScript parser

// ===== EVALUATION ENGINE =====

// Context for variable values during evaluation
export interface EvaluationContext {
  [variableName: string]: number | boolean | unknown;
}

// Result of expression evaluation
export interface EvaluationResult {
  value: number | boolean;
  type: ExpressionType;
}

// Add evaluation methods to AST nodes
export abstract class BaseNode implements ASTNode {
  // ... existing code ...

  // Main evaluation method - implemented by each node type
  abstract evaluate(context: EvaluationContext): EvaluationResult;
}

// ===== LITERAL NODE EVALUATION =====
export class Literal extends BaseNode {
  // ... existing code ...

  public evaluate(context: EvaluationContext): EvaluationResult {
    return {
      value: this.value as number | boolean,
      type: this.getType()
    };
  }
}

// ===== IDENTIFIER NODE EVALUATION =====
export class Identifier extends BaseNode {
  // ... existing code ...

  public evaluate(context: EvaluationContext): EvaluationResult {
    if (!(this.name in context)) {
      throw new Error(`Undefined variable: ${this.name}`);
    }
    
    const value = context[this.name];
    
    // Type checking
    if (typeof value === 'number') {
      return { value, type: ExpressionType.Number };
    } else if (typeof value === 'boolean') {
      return { value, type: ExpressionType.Boolean };
    } else {
      throw new Error(`Invalid variable type for ${this.name}: ${typeof value}`);
    }
  }
}

// ===== BINARY OPERATION EVALUATION =====
export class BinaryOp extends BaseNode {
  // ... existing code ...

  public evaluate(context: EvaluationContext): EvaluationResult {
    // SHORT-CIRCUIT EVALUATION for logical operators
    if (this.operator === 'AND' || this.operator === '&&') {
      const leftResult = this.left.evaluate(context);
      this.ensureBoolean(leftResult, 'left operand of AND');
      
      // Short-circuit: if left is false, don't evaluate right
      if (!leftResult.value) {
        return { value: false, type: ExpressionType.Boolean };
      }
      
      const rightResult = this.right.evaluate(context);
      this.ensureBoolean(rightResult, 'right operand of AND');
      return { value: !!rightResult.value, type: ExpressionType.Boolean };
    }

    if (this.operator === 'OR' || this.operator === '||') {
      const leftResult = this.left.evaluate(context);
      this.ensureBoolean(leftResult, 'left operand of OR');
      
      // Short-circuit: if left is true, don't evaluate right
      if (leftResult.value) {
        return { value: true, type: ExpressionType.Boolean };
      }
      
      const rightResult = this.right.evaluate(context);
      this.ensureBoolean(rightResult, 'right operand of OR');
      return { value: !!rightResult.value, type: ExpressionType.Boolean };
    }

    // IMPLIES OPERATOR (->)
    if (this.operator === '->') {
      const leftResult = this.left.evaluate(context);
      const rightResult = this.right.evaluate(context);
      
      this.ensureBoolean(leftResult, 'left operand of ->');
      this.ensureBoolean(rightResult, 'right operand of ->');
      
      // A -> B is equivalent to !A || B
      const implies = !leftResult.value || !!rightResult.value;
      return { value: implies, type: ExpressionType.Boolean };
    }

    // EQUIVALENCE OPERATOR (<->)
    if (this.operator === '<->') {
      const leftResult = this.left.evaluate(context);
      const rightResult = this.right.evaluate(context);
      
      this.ensureBoolean(leftResult, 'left operand of <->');