package parser_generator

import (
	"fmt"
	"os"
	"path/filepath"
)

// Config holds generator configuration
type Config struct {
	PackageName string
	ModuleName  string
	Debug       bool
}

// Generator orchestrates parser generation
type Generator struct {
	config *Config
	goGen  *GoGenerator
	tsGen  *TypeScriptGenerator
}

// NewGenerator creates a new parser generator
func NewGenerator(config *Config) *Generator {
	return &Generator{
		config: config,
		goGen:  NewGoGenerator(config),
		tsGen:  NewTypeScriptGenerator(config),
	}
}

// Validate performs comprehensive grammar validation
func (g *Generator) Validate(grammar *Grammar) error {
	if grammar == nil {
		return fmt.Errorf("grammar is nil")
	}

	if grammar.Name == "" {
		return fmt.Errorf("grammar must have a name")
	}

	if grammar.StartRule == "" {
		return fmt.Errorf("grammar must specify a start rule")
	}

	if len(grammar.Tokens) == 0 {
		return fmt.Errorf("grammar must define at least one token")
	}

	if len(grammar.Rules) == 0 {
		return fmt.Errorf("grammar must define at least one rule")
	}

	// Validate start rule exists
	if grammar.GetRuleByName(grammar.StartRule) == nil {
		return fmt.Errorf("start rule '%s' not found", grammar.StartRule)
	}

	// Validate token uniqueness
	tokenNames := make(map[string]bool)
	for _, token := range grammar.Tokens {
		if token.Name == "" {
			return fmt.Errorf("token name cannot be empty")
		}
		if tokenNames[token.Name] {
			return fmt.Errorf("duplicate token name: %s", token.Name)
		}
		tokenNames[token.Name] = true

		if err := token.Validate(); err != nil {
			return fmt.Errorf("token '%s': %w", token.Name, err)
		}
	}

	// Validate rule uniqueness and references
	ruleNames := make(map[string]bool)
	for _, rule := range grammar.Rules {
		if rule.Name == "" {
			return fmt.Errorf("rule name cannot be empty")
		}
		if ruleNames[rule.Name] {
			return fmt.Errorf("duplicate rule name: %s", rule.Name)
		}
		ruleNames[rule.Name] = true

		if err := rule.Validate(); err != nil {
			return fmt.Errorf("rule '%s': %w", rule.Name, err)
		}

		if err := g.validateExpression(rule.Expression, grammar); err != nil {
			return fmt.Errorf("rule '%s': %w", rule.Name, err)
		}
	}

	// Check for left recursion
	if err := g.checkLeftRecursion(grammar); err != nil {
		return err
	}

	return nil
}

// validateExpression validates all references in an expression
func (g *Generator) validateExpression(expr Expression, grammar *Grammar) error {
	if expr == nil {
		return fmt.Errorf("expression cannot be nil")
	}

	switch e := expr.(type) {
	case *RuleRef:
		if grammar.GetRuleByName(e.Name) == nil && grammar.GetTokenByName(e.Name) == nil {
			return fmt.Errorf("undefined rule or token: %s", e.Name)
		}
	case *Sequence:
		for _, item := range e.Items {
			if err := g.validateExpression(item, grammar); err != nil {
				return err
			}
		}
	case *Choice:
		for _, alt := range e.Alternatives {
			if err := g.validateExpression(alt, grammar); err != nil {
				return err
			}
		}
	case *Repetition:
		return g.validateExpression(e.Expression, grammar)
	case *Optional:
		return g.validateExpression(e.Expression, grammar)
	case *Group:
		return g.validateExpression(e.Expression, grammar)
	case *Predicate:
		return g.validateExpression(e.Expression, grammar)
	case *Literal, *CharClass:
		// Always valid
		return nil
	}
	return nil
}

// checkLeftRecursion detects problematic left recursion
func (g *Generator) checkLeftRecursion(grammar *Grammar) error {
	visiting := make(map[string]bool)
	visited := make(map[string]bool)

	var checkRule func(string) error
	checkRule = func(ruleName string) error {
		if visiting[ruleName] {
			return fmt.Errorf("left recursion detected in rule: %s", ruleName)
		}
		if visited[ruleName] {
			return nil
		}

		visiting[ruleName] = true
		defer func() { visiting[ruleName] = false }()

		rule := grammar.GetRuleByName(ruleName)
		if rule != nil {
			if err := g.checkExpressionLeftRecursion(rule.Expression, ruleName, checkRule, grammar); err != nil {
				return err
			}
		}

		visited[ruleName] = true
		return nil
	}

	for _, rule := range grammar.Rules {
		if err := checkRule(rule.Name); err != nil {
			return err
		}
	}

	return nil
}

// checkExpressionLeftRecursion checks for left recursion in expressions
func (g *Generator) checkExpressionLeftRecursion(expr Expression, currentRule string, checkRule func(string) error, grammar *Grammar) error {
	switch e := expr.(type) {
	case *RuleRef:
		if e.Name == currentRule {
			return fmt.Errorf("direct left recursion in rule: %s", currentRule)
		}
		if grammar.GetRuleByName(e.Name) != nil {
			return checkRule(e.Name)
		}
	case *Sequence:
		if len(e.Items) > 0 {
			return g.checkExpressionLeftRecursion(e.Items[0], currentRule, checkRule, grammar)
		}
	case *Choice:
		for _, alt := range e.Alternatives {
			if err := g.checkExpressionLeftRecursion(alt, currentRule, checkRule, grammar); err != nil {
				return err
			}
		}
	case *Group:
		return g.checkExpressionLeftRecursion(e.Expression, currentRule, checkRule, grammar)
	}
	return nil
}

// GenerateGo generates a Go parser
func (g *Generator) GenerateGo(grammar *Grammar, outputDir string) error {
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	content, err := g.goGen.Generate(grammar)
	if err != nil {
		return fmt.Errorf("failed to generate Go parser: %w", err)
	}

	path := filepath.Join(outputDir, "parser.go")
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write parser file: %w", err)
	}

	return nil
}

// GenerateTypeScript generates a TypeScript parser
func (g *Generator) GenerateTypeScript(grammar *Grammar, outputDir string) error {
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	content, err := g.tsGen.Generate(grammar)
	if err != nil {
		return fmt.Errorf("failed to generate TypeScript parser: %w", err)
	}

	path := filepath.Join(outputDir, "parser.ts")
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write parser file: %w", err)
	}

	return nil
}

// ParseGrammarFile parses a grammar file
func ParseGrammarFile(filename string) (*Grammar, error) {
	content, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	parser := NewGrammarParser(string(content))
	return parser.ParseGrammar()
}
