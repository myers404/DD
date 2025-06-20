// rule_analyzer.go - Analyzes rules to detect implications and dependencies
package cpq

import (
	"DD/parser"
	"strings"
)

// RuleAnalyzer provides methods to analyze rules for implications and dependencies
type RuleAnalyzer struct {
	model *Model
}

// NewRuleAnalyzer creates a new rule analyzer
func NewRuleAnalyzer(model *Model) *RuleAnalyzer {
	return &RuleAnalyzer{
		model: model,
	}
}

// ImplicationInfo contains information about an implication rule
type ImplicationInfo struct {
	RuleID      string
	RuleName    string
	Expression  string
	Antecedent  string   // The "if" part (e.g., "opt_a")
	Consequents []string // The "then" part(s) (e.g., ["opt_b", "opt_c"] for OR)
	IsDisjunctive bool   // True if consequent is OR (opt_b OR opt_c), false if AND
}

// HasImplicationRules checks if a specific option has any implication rules
// where it appears as the antecedent (the "if" part)
func (ra *RuleAnalyzer) HasImplicationRules(optionID string) bool {
	implications := ra.GetImplicationRules(optionID)
	return len(implications) > 0
}

// GetImplicationRules returns all implication rules where the given option
// appears as the antecedent (the "if" part)
func (ra *RuleAnalyzer) GetImplicationRules(optionID string) []ImplicationInfo {
	var implications []ImplicationInfo

	for _, rule := range ra.model.Rules {
		if !rule.IsActive {
			continue
		}

		// Parse the rule expression
		implication := ra.parseImplicationRule(rule)
		if implication != nil && implication.Antecedent == optionID {
			implications = append(implications, *implication)
		}
	}

	return implications
}

// GetAllImplicationRules returns all implication rules in the model
func (ra *RuleAnalyzer) GetAllImplicationRules() []ImplicationInfo {
	var implications []ImplicationInfo

	for _, rule := range ra.model.Rules {
		if !rule.IsActive {
			continue
		}

		implication := ra.parseImplicationRule(rule)
		if implication != nil {
			implications = append(implications, *implication)
		}
	}

	return implications
}

// parseImplicationRule attempts to parse a rule as an implication
func (ra *RuleAnalyzer) parseImplicationRule(rule Rule) *ImplicationInfo {
	// First try to parse the expression
	ast, err := parser.ParseExpression(rule.Expression)
	if err != nil {
		return nil
	}

	// Check if it's a binary operation with IMPLIES operator
	if binOp, ok := ast.(*parser.BinaryOperation); ok {
		if binOp.Operator == parser.TOKEN_IMPLIES_OP {
			// This is an implication: left -> right
			antecedent := ra.extractIdentifier(binOp.Left)
			if antecedent == "" {
				return nil
			}

			consequents, isDisjunctive := ra.extractConsequents(binOp.Right)
			if len(consequents) == 0 {
				return nil
			}

			return &ImplicationInfo{
				RuleID:        rule.ID,
				RuleName:      rule.Name,
				Expression:    rule.Expression,
				Antecedent:    antecedent,
				Consequents:   consequents,
				IsDisjunctive: isDisjunctive,
			}
		}
	}

	// Also check for IMPLIES function call format
	if fnCall, ok := ast.(*parser.FunctionCall); ok {
		if fnCall.Function == parser.TOKEN_IMPLIES && len(fnCall.Args) == 2 {
			antecedent := ra.extractIdentifier(fnCall.Args[0])
			if antecedent == "" {
				return nil
			}

			consequents, isDisjunctive := ra.extractConsequents(fnCall.Args[1])
			if len(consequents) == 0 {
				return nil
			}

			return &ImplicationInfo{
				RuleID:        rule.ID,
				RuleName:      rule.Name,
				Expression:    rule.Expression,
				Antecedent:    antecedent,
				Consequents:   consequents,
				IsDisjunctive: isDisjunctive,
			}
		}
	}

	return nil
}

// extractIdentifier extracts a simple identifier from an expression
func (ra *RuleAnalyzer) extractIdentifier(expr parser.Expression) string {
	if id, ok := expr.(*parser.Identifier); ok {
		return id.Name
	}
	return ""
}

// extractConsequents extracts the consequents from the right side of an implication
func (ra *RuleAnalyzer) extractConsequents(expr parser.Expression) ([]string, bool) {
	// Simple identifier
	if id, ok := expr.(*parser.Identifier); ok {
		return []string{id.Name}, false
	}

	// OR expression (disjunctive)
	if binOp, ok := expr.(*parser.BinaryOperation); ok {
		if binOp.Operator == parser.TOKEN_OR {
			var consequents []string
			
			// Extract left side
			if leftID := ra.extractIdentifier(binOp.Left); leftID != "" {
				consequents = append(consequents, leftID)
			} else {
				// Try to extract from nested OR
				leftConseq, _ := ra.extractConsequents(binOp.Left)
				consequents = append(consequents, leftConseq...)
			}
			
			// Extract right side
			if rightID := ra.extractIdentifier(binOp.Right); rightID != "" {
				consequents = append(consequents, rightID)
			} else {
				// Try to extract from nested OR
				rightConseq, _ := ra.extractConsequents(binOp.Right)
				consequents = append(consequents, rightConseq...)
			}
			
			return consequents, true
		}
		
		// AND expression (conjunctive)
		if binOp.Operator == parser.TOKEN_AND {
			var consequents []string
			
			// Extract left side
			if leftID := ra.extractIdentifier(binOp.Left); leftID != "" {
				consequents = append(consequents, leftID)
			}
			
			// Extract right side
			if rightID := ra.extractIdentifier(binOp.Right); rightID != "" {
				consequents = append(consequents, rightID)
			}
			
			return consequents, false
		}
	}

	return nil, false
}

// GetOptionDependencies returns all options that depend on the given option
// (i.e., rules where this option implies other options)
func (ra *RuleAnalyzer) GetOptionDependencies(optionID string) []string {
	dependencies := make(map[string]bool)
	
	implications := ra.GetImplicationRules(optionID)
	for _, impl := range implications {
		for _, consequent := range impl.Consequents {
			dependencies[consequent] = true
		}
	}
	
	// Convert map to slice
	var result []string
	for dep := range dependencies {
		result = append(result, dep)
	}
	
	return result
}

// GetOptionDependents returns all options that require the given option
// (i.e., rules where other options imply this option)
func (ra *RuleAnalyzer) GetOptionDependents(optionID string) []string {
	dependents := make(map[string]bool)
	
	allImplications := ra.GetAllImplicationRules()
	for _, impl := range allImplications {
		for _, consequent := range impl.Consequents {
			if consequent == optionID {
				dependents[impl.Antecedent] = true
				break
			}
		}
	}
	
	// Convert map to slice
	var result []string
	for dep := range dependents {
		result = append(result, dep)
	}
	
	return result
}

// IsImplicationExpression checks if a rule expression is an implication
func IsImplicationExpression(expression string) bool {
	// Quick check for implication operators
	if strings.Contains(expression, "->") || strings.Contains(expression, "IMPLIES") {
		// Parse to confirm it's actually an implication
		ast, err := parser.ParseExpression(expression)
		if err != nil {
			return false
		}
		
		// Check for binary operation with implies
		if binOp, ok := ast.(*parser.BinaryOperation); ok {
			return binOp.Operator == parser.TOKEN_IMPLIES_OP
		}
		
		// Check for IMPLIES function
		if fnCall, ok := ast.(*parser.FunctionCall); ok {
			return fnCall.Function == parser.TOKEN_IMPLIES
		}
	}
	
	return false
}