package main

import (
	"encoding/json"
	"fmt"
	"log"
	
	"DD/cpq"
)

// Example showing the enhanced constraint validation API response
func main() {
	// Example of how the backend builds the enhanced response
	showEnhancedAPIResponse()
}

func showEnhancedAPIResponse() {
	// Example available options with various statuses
	availableOptions := []cpq.AvailableOption{
		{
			// Already selected CPU option
			Option: cpq.Option{
				ID:        "opt_cpu_i7",
				Name:      "Intel i7 Processor",
				GroupID:   "grp_cpu",
				BasePrice: 300.00,
			},
			Status:          cpq.StatusSelected,
			CanSelect:       true,
			SelectionMethod: "none",
			GroupInfo: cpq.GroupContext{
				GroupID:          "grp_cpu",
				GroupType:        "select-one",
				CurrentSelection: []string{"opt_cpu_i7"},
				MinSelections:    1,
				MaxSelections:    1,
			},
		},
		{
			// Alternative CPU option (switch required)
			Option: cpq.Option{
				ID:        "opt_cpu_i5",
				Name:      "Intel i5 Processor",
				GroupID:   "grp_cpu",
				BasePrice: 150.00,
			},
			Status:           cpq.StatusSwitch,
			CanSelect:        false,
			SelectionMethod:  "switch",
			RequiresDeselect: []string{"opt_cpu_i7"},
			GroupInfo: cpq.GroupContext{
				GroupID:          "grp_cpu",
				GroupType:        "select-one",
				CurrentSelection: []string{"opt_cpu_i7"},
				MinSelections:    1,
				MaxSelections:    1,
			},
		},
		{
			// Blocked RAM option (constraint violation)
			Option: cpq.Option{
				ID:        "opt_ram_8gb",
				Name:      "8GB RAM",
				GroupID:   "grp_ram",
				BasePrice: 80.00,
			},
			Status:          cpq.StatusBlocked,
			CanSelect:       false,
			SelectionMethod: "none",
			BlockedBy: []cpq.ConstraintInfo{
				{
					RuleID:      "rule_cpu_ram",
					Message:     "Intel i7 requires at least 16GB RAM",
					Type:        "requires",
					Description: "High-performance CPU requires adequate memory",
				},
			},
			Impact: "worsens",
			GroupInfo: cpq.GroupContext{
				GroupID:          "grp_ram",
				GroupType:        "select-one",
				CurrentSelection: []string{},
				MinSelections:    1,
				MaxSelections:    1,
			},
		},
		{
			// Helpful RAM option (resolves constraint)
			Option: cpq.Option{
				ID:        "opt_ram_16gb",
				Name:      "16GB RAM",
				GroupID:   "grp_ram",
				BasePrice: 160.00,
			},
			Status:          cpq.StatusSelectable,
			CanSelect:       true,
			SelectionMethod: "add",
			Impact:          "helps",
			HelpsResolve:    []string{"rule_cpu_ram"},
			GroupInfo: cpq.GroupContext{
				GroupID:          "grp_ram",
				GroupType:        "select-one",
				CurrentSelection: []string{},
				MinSelections:    1,
				MaxSelections:    1,
			},
		},
		{
			// Max reached example
			Option: cpq.Option{
				ID:        "opt_usb_port",
				Name:      "Additional USB Port",
				GroupID:   "grp_accessories",
				BasePrice: 25.00,
			},
			Status:          cpq.StatusMaxReached,
			CanSelect:       false,
			SelectionMethod: "none",
			GroupInfo: cpq.GroupContext{
				GroupID:          "grp_accessories",
				GroupType:        "multi-select",
				CurrentSelection: []string{"opt_usb_hub", "opt_card_reader", "opt_ethernet"},
				MinSelections:    0,
				MaxSelections:    3,
			},
		},
	}

	// Example API response structure
	response := map[string]interface{}{
		"available_options": availableOptions,
		"validation_result": cpq.ValidationResult{
			IsValid: false,
			Violations: []cpq.RuleViolation{
				{
					RuleID:          "rule_cpu_ram",
					RuleName:        "CPU Memory Requirement",
					Message:         "Intel i7 requires at least 16GB RAM",
					AffectedOptions: []string{"opt_cpu_i7", "opt_ram_8gb"},
				},
			},
		},
		"constraint_summary": map[string]interface{}{
			"has_violations": true,
			"blocked_count":  1,
			"available_count": 3,
			"blocked_options": []map[string]interface{}{
				{
					"id":      "opt_ram_8gb",
					"name":    "8GB RAM",
					"reasons": []string{"Intel i7 requires at least 16GB RAM"},
				},
			},
			"switchable_options": []map[string]interface{}{
				{
					"id":               "opt_cpu_i5",
					"name":             "Intel i5 Processor",
					"requires_deselect": []string{"opt_cpu_i7"},
				},
			},
			"helpful_options": []map[string]interface{}{
				{
					"id":            "opt_ram_16gb",
					"name":          "16GB RAM",
					"helps_resolve": []string{"rule_cpu_ram"},
				},
			},
		},
	}

	// Pretty print the response
	jsonBytes, err := json.MarshalIndent(response, "", "  ")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Enhanced API Response Example:")
	fmt.Println(string(jsonBytes))

	// Show example frontend usage
	fmt.Println("\n\nExample Frontend Usage:")
	fmt.Println("======================")
	
	for _, ao := range availableOptions {
		fmt.Printf("\nOption: %s\n", ao.Option.Name)
		fmt.Printf("  Status: %s\n", ao.Status)
		
		switch ao.Status {
		case cpq.StatusSelectable:
			if ao.Impact == "helps" {
				fmt.Printf("  ✅ Can select - Helps resolve: %v\n", ao.HelpsResolve)
			} else {
				fmt.Printf("  ✓ Can select directly\n")
			}
			
		case cpq.StatusSwitch:
			fmt.Printf("  🔄 Can switch - Must deselect: %v\n", ao.RequiresDeselect)
			
		case cpq.StatusBlocked:
			fmt.Printf("  ❌ Blocked - Reason: %s\n", ao.BlockedBy[0].Message)
			
		case cpq.StatusSelected:
			fmt.Printf("  ✓ Currently selected\n")
			
		case cpq.StatusMaxReached:
			fmt.Printf("  ⚠️ Max selections reached (%d/%d)\n", 
				len(ao.GroupInfo.CurrentSelection), ao.GroupInfo.MaxSelections)
		}
	}
}