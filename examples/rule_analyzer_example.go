// Example demonstrating how to detect and analyze implication rules
package main

import (
	"DD/cpq"
	"fmt"
)

func main() {
	// Create a sample model with implication rules
	model := &cpq.Model{
		ID:   "laptop_model",
		Name: "Laptop Configuration",
		Options: []cpq.Option{
			{ID: "opt_cpu_high", Name: "High-Performance CPU"},
			{ID: "opt_cpu_standard", Name: "Standard CPU"},
			{ID: "opt_cooling_basic", Name: "Basic Cooling"},
			{ID: "opt_cooling_liquid", Name: "Liquid Cooling"},
			{ID: "opt_cooling_advanced", Name: "Advanced Cooling"},
			{ID: "opt_gaming_gpu", Name: "Gaming GPU"},
			{ID: "opt_ram_32gb", Name: "32GB RAM"},
			{ID: "opt_ram_64gb", Name: "64GB RAM"},
		},
		Rules: []cpq.Rule{
			{
				ID:         "rule1",
				Name:       "High CPU requires better cooling",
				Expression: "opt_cpu_high -> (opt_cooling_liquid || opt_cooling_advanced)",
				Message:    "High-performance CPU requires liquid or advanced cooling",
				IsActive:   true,
				Type:       cpq.RequiresRule,
			},
			{
				ID:         "rule2",
				Name:       "Gaming GPU requires high CPU",
				Expression: "opt_gaming_gpu -> opt_cpu_high",
				Message:    "Gaming GPU requires high-performance CPU",
				IsActive:   true,
				Type:       cpq.RequiresRule,
			},
			{
				ID:         "rule3",
				Name:       "64GB RAM requires high CPU",
				Expression: "opt_ram_64gb -> opt_cpu_high",
				Message:    "64GB RAM requires high-performance CPU",
				IsActive:   true,
				Type:       cpq.RequiresRule,
			},
			{
				ID:         "rule4",
				Name:       "Basic cooling excludes high CPU",
				Expression: "opt_cooling_basic && opt_cpu_high",
				Message:    "Basic cooling cannot be used with high-performance CPU",
				IsActive:   true,
				Type:       cpq.ExcludesRule,
			},
		},
	}

	// Create a rule analyzer
	analyzer := cpq.NewRuleAnalyzer(model)

	fmt.Println("=== Rule Analysis Example ===\n")

	// Example 1: Check if an option has implication rules
	fmt.Println("1. Checking which options have implication rules:")
	for _, option := range model.Options {
		if analyzer.HasImplicationRules(option.ID) {
			fmt.Printf("   ✓ %s (%s) has implication rules\n", option.Name, option.ID)
		}
	}

	// Example 2: Get detailed implication rules for an option
	fmt.Println("\n2. Detailed implications for High-Performance CPU:")
	implications := analyzer.GetImplicationRules("opt_cpu_high")
	for _, impl := range implications {
		fmt.Printf("   Rule: %s\n", impl.RuleName)
		fmt.Printf("   Expression: %s\n", impl.Expression)
		fmt.Printf("   If %s is selected, then ", impl.Antecedent)
		
		if impl.IsDisjunctive {
			fmt.Printf("at least one of these must be selected:\n")
			for _, cons := range impl.Consequents {
				fmt.Printf("     - %s\n", cons)
			}
		} else {
			fmt.Printf("these must be selected:\n")
			for _, cons := range impl.Consequents {
				fmt.Printf("     - %s\n", cons)
			}
		}
		fmt.Println()
	}

	// Example 3: Find dependencies
	fmt.Println("3. Option Dependencies:")
	dependencies := analyzer.GetOptionDependencies("opt_cpu_high")
	if len(dependencies) > 0 {
		fmt.Printf("   When opt_cpu_high is selected, these options may be required:\n")
		for _, dep := range dependencies {
			fmt.Printf("   - %s\n", dep)
		}
	}

	// Example 4: Find dependents (reverse dependencies)
	fmt.Println("\n4. Options that require opt_cpu_high:")
	dependents := analyzer.GetOptionDependents("opt_cpu_high")
	for _, dep := range dependents {
		fmt.Printf("   - %s\n", dep)
	}

	// Example 5: Check if a rule expression is an implication
	fmt.Println("\n5. Checking rule expressions:")
	testExpressions := []string{
		"opt_a -> opt_b",
		"opt_a && opt_b",
		"opt_a -> (opt_b || opt_c)",
		"IMPLIES(opt_a, opt_b)",
		"opt_a || opt_b",
	}
	
	for _, expr := range testExpressions {
		isImpl := cpq.IsImplicationExpression(expr)
		if isImpl {
			fmt.Printf("   ✓ '%s' is an implication\n", expr)
		} else {
			fmt.Printf("   ✗ '%s' is NOT an implication\n", expr)
		}
	}

	// Example 6: Practical use case - UI hint generation
	fmt.Println("\n6. UI Hints for options with implications:")
	for _, option := range model.Options {
		implications := analyzer.GetImplicationRules(option.ID)
		if len(implications) > 0 {
			fmt.Printf("\n   %s:\n", option.Name)
			for _, impl := range implications {
				if impl.IsDisjunctive {
					fmt.Printf("   ℹ️  Selecting this will require one of: ")
					for i, cons := range impl.Consequents {
						if i > 0 {
							fmt.Printf(", ")
						}
						// Find option name
						for _, opt := range model.Options {
							if opt.ID == cons {
								fmt.Printf("%s", opt.Name)
								break
							}
						}
					}
					fmt.Println()
				} else {
					fmt.Printf("   ℹ️  Selecting this will also require: ")
					for i, cons := range impl.Consequents {
						if i > 0 {
							fmt.Printf(", ")
						}
						// Find option name
						for _, opt := range model.Options {
							if opt.ID == cons {
								fmt.Printf("%s", opt.Name)
								break
							}
						}
					}
					fmt.Println()
				}
			}
		}
	}
}