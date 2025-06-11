// pricing.go - Phase 2: Selection-Based Pricing Plugin
// Simple pricing calculator alongside constraint engine
// Basic arithmetic: quantity × price, volume tiers
// NO constraint changes from pricing - separate from MTBDD

package cpq

import (
	"fmt"
	"math"
	"sort"
	"sync"
	"time"
)

// ===================================================================
// PRICING CALCULATOR - SEPARATE FROM CONSTRAINTS
// ===================================================================

// PricingCalculator handles static pricing evaluations (Phase 2)
type PricingCalculator struct {
	model       *Model
	volumeTiers []VolumeTier
	cache       map[string]PriceBreakdown
	mutex       sync.RWMutex
	stats       PricingStats
}

// PricingStats tracks calculator performance
type PricingStats struct {
	TotalCalculations int64
	AverageTime       time.Duration
	CacheHits         int64
	CacheMisses       int64
}

// VolumeTierRule defines quantity-based pricing tiers
type VolumeTier struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	MinQuantity int     `json:"min_quantity"`
	MaxQuantity int     `json:"max_quantity"` // -1 for unlimited
	Multiplier  float64 `json:"multiplier"`   // Price multiplier (0.9 = 10% discount)
	Priority    int     `json:"priority"`     // Lower number = higher priority
}

// NewPricingCalculator creates a basic pricing calculator
func NewPricingCalculator(model *Model) *PricingCalculator {
	calc := &PricingCalculator{
		model:       model,
		volumeTiers: createDefaultVolumeTiers(),
		cache:       make(map[string]PriceBreakdown),
	}

	return calc
}

// createDefaultVolumeTiers creates SMB-focused volume tiers
func createDefaultVolumeTiers() []VolumeTier {
	return []VolumeTier{
		{
			ID:          "tier1",
			Name:        "Individual",
			MinQuantity: 1,
			MaxQuantity: 10,
			Multiplier:  1.0, // No discount
			Priority:    1,
		},
		{
			ID:          "tier2",
			Name:        "Small Volume",
			MinQuantity: 11,
			MaxQuantity: 50,
			Multiplier:  0.95, // 5% discount
			Priority:    2,
		},
		{
			ID:          "tier3",
			Name:        "Medium Volume",
			MinQuantity: 51,
			MaxQuantity: 100,
			Multiplier:  0.90, // 10% discount
			Priority:    3,
		},
		{
			ID:          "tier4",
			Name:        "Large Volume",
			MinQuantity: 101,
			MaxQuantity: -1,   // Unlimited
			Multiplier:  0.85, // 15% discount
			Priority:    4,
		},
	}
}

// ===================================================================
// CORE PRICING CALCULATION METHODS
// ===================================================================

// CalculatePrice computes total price for given selections
func (pc *PricingCalculator) CalculatePrice(selections []Selection) PriceBreakdown {
	startTime := time.Now()
	pc.mutex.Lock()
	defer pc.mutex.Unlock()

	// Generate cache key
	cacheKey := pc.generateCacheKey(selections)

	// Check cache first
	if cached, exists := pc.cache[cacheKey]; exists {
		pc.stats.CacheHits++
		pc.stats.TotalCalculations++
		return cached
	}

	pc.stats.CacheMisses++

	// Calculate base price
	basePrice := pc.calculateBasePrice(selections)

	// Calculate total quantity
	totalQuantity := pc.calculateTotalQuantity(selections)

	// Apply volume tier adjustments
	adjustments := pc.calculateVolumeAdjustments(basePrice, totalQuantity)

	// Apply price rule adjustments
	ruleAdjustments := pc.calculatePriceRuleAdjustments(selections, basePrice)
	adjustments = append(adjustments, ruleAdjustments...)

	// Calculate final price
	finalPrice := pc.applyAdjustments(basePrice, adjustments)

	breakdown := PriceBreakdown{
		BasePrice:       basePrice,
		Adjustments:     adjustments,
		TotalPrice:      finalPrice,
		CalculationTime: time.Since(startTime),
	}

	// Cache result
	pc.cache[cacheKey] = breakdown

	// Update stats
	pc.stats.TotalCalculations++
	elapsed := time.Since(startTime)
	pc.stats.AverageTime = time.Duration((int64(pc.stats.AverageTime)*pc.stats.TotalCalculations + int64(elapsed)) / (pc.stats.TotalCalculations + 1))

	return breakdown
}

// calculateBasePrice sums up base prices for all selections
func (pc *PricingCalculator) calculateBasePrice(selections []Selection) float64 {
	var total float64

	for _, selection := range selections {
		if selection.Quantity <= 0 {
			continue
		}

		option, err := pc.model.GetOption(selection.OptionID)
		if err != nil {
			continue // Skip invalid options
		}

		total += option.BasePrice * float64(selection.Quantity)
	}

	return total
}

// calculateTotalQuantity sums all selected quantities
func (pc *PricingCalculator) calculateTotalQuantity(selections []Selection) int {
	var total int
	for _, selection := range selections {
		if selection.Quantity > 0 {
			total += selection.Quantity
		}
	}
	return total
}

// calculateVolumeAdjustments applies volume tier pricing
func (pc *PricingCalculator) calculateVolumeAdjustments(basePrice float64, totalQuantity int) []PriceAdjustment {
	var adjustments []PriceAdjustment

	// Find applicable volume tier
	tier := pc.findVolumeTier(totalQuantity)
	if tier == nil || tier.Multiplier == 1.0 {
		return adjustments // No volume discount
	}

	// Calculate discount amount
	discountAmount := basePrice * (1.0 - tier.Multiplier)

	adjustments = append(adjustments, PriceAdjustment{
		RuleID:      tier.ID,
		RuleName:    tier.Name,
		Type:        "volume_discount",
		Amount:      -discountAmount, // Negative for discount
		Description: fmt.Sprintf("%s discount (%.0f%% off)", tier.Name, (1.0-tier.Multiplier)*100),
	})

	return adjustments
}

// findVolumeTier finds the appropriate volume tier for given quantity
func (pc *PricingCalculator) findVolumeTier(quantity int) *VolumeTier {
	var applicableTier *VolumeTier

	for i := range pc.volumeTiers {
		tier := &pc.volumeTiers[i]

		// Check if quantity falls within tier range
		if quantity >= tier.MinQuantity {
			if tier.MaxQuantity == -1 || quantity <= tier.MaxQuantity {
				// Use tier with highest priority (lowest priority number)
				if applicableTier == nil || tier.Priority < applicableTier.Priority {
					applicableTier = tier
				}
			}
		}
	}

	return applicableTier
}

// calculatePriceRuleAdjustments applies static price rules
func (pc *PricingCalculator) calculatePriceRuleAdjustments(selections []Selection, basePrice float64) []PriceAdjustment {
	var adjustments []PriceAdjustment

	// Sort price rules by priority
	rules := make([]PriceRule, len(pc.model.PriceRules))
	copy(rules, pc.model.PriceRules)
	sort.Slice(rules, func(i, j int) bool {
		return rules[i].Priority < rules[j].Priority
	})

	for _, rule := range rules {
		if !rule.IsActive {
			continue
		}

		adjustment := pc.evaluatePriceRule(rule, selections, basePrice)
		if adjustment != nil {
			adjustments = append(adjustments, *adjustment)
		}
	}

	return adjustments
}

// evaluatePriceRule evaluates a single price rule
func (pc *PricingCalculator) evaluatePriceRule(rule PriceRule, selections []Selection, basePrice float64) *PriceAdjustment {
	switch rule.Type {
	case FixedDiscountRule:
		return pc.evaluateFixedDiscount(rule, selections)
	case PercentDiscountRule:
		return pc.evaluatePercentDiscount(rule, selections, basePrice)
	case SurchargeRule:
		return pc.evaluateSurcharge(rule, selections, basePrice)
	default:
		// For complex expressions, use simple evaluation
		return pc.evaluateExpressionRule(rule, selections, basePrice)
	}
}

// evaluateFixedDiscount applies fixed amount discounts
func (pc *PricingCalculator) evaluateFixedDiscount(rule PriceRule, selections []Selection) *PriceAdjustment {
	// Simple rule: if specific option selected, apply fixed discount
	// Expression format: "opt1:10.0" (if opt1 selected, $10 discount)

	parts := pc.parseSimpleExpression(rule.Expression)
	if len(parts) != 2 {
		return nil
	}

	optionID := parts[0]
	discountAmount := pc.parseFloat(parts[1])

	// Check if option is selected
	for _, selection := range selections {
		if selection.OptionID == optionID && selection.Quantity > 0 {
			return &PriceAdjustment{
				RuleID:      rule.ID,
				RuleName:    rule.Name,
				Type:        "fixed_discount",
				Amount:      -discountAmount,
				Description: fmt.Sprintf("$%.2f discount for %s", discountAmount, optionID),
			}
		}
	}

	return nil
}

// evaluatePercentDiscount applies percentage discounts
func (pc *PricingCalculator) evaluatePercentDiscount(rule PriceRule, selections []Selection, basePrice float64) *PriceAdjustment {
	// Expression format: "opt1:0.10" (if opt1 selected, 10% discount)

	parts := pc.parseSimpleExpression(rule.Expression)
	if len(parts) != 2 {
		return nil
	}

	optionID := parts[0]
	discountPercent := pc.parseFloat(parts[1])

	// Check if option is selected
	for _, selection := range selections {
		if selection.OptionID == optionID && selection.Quantity > 0 {
			discountAmount := basePrice * discountPercent
			return &PriceAdjustment{
				RuleID:      rule.ID,
				RuleName:    rule.Name,
				Type:        "percent_discount",
				Amount:      -discountAmount,
				Description: fmt.Sprintf("%.0f%% discount for %s", discountPercent*100, optionID),
			}
		}
	}

	return nil
}

// evaluateSurcharge applies additional charges
func (pc *PricingCalculator) evaluateSurcharge(rule PriceRule, selections []Selection, basePrice float64) *PriceAdjustment {
	// Expression format: "opt1:25.0" (if opt1 selected, $25 surcharge)

	parts := pc.parseSimpleExpression(rule.Expression)
	if len(parts) != 2 {
		return nil
	}

	optionID := parts[0]
	surchargeAmount := pc.parseFloat(parts[1])

	// Check if option is selected
	for _, selection := range selections {
		if selection.OptionID == optionID && selection.Quantity > 0 {
			return &PriceAdjustment{
				RuleID:      rule.ID,
				RuleName:    rule.Name,
				Type:        "surcharge",
				Amount:      surchargeAmount,
				Description: fmt.Sprintf("$%.2f surcharge for %s", surchargeAmount, optionID),
			}
		}
	}

	return nil
}

// evaluateExpressionRule handles complex expressions (simplified)
func (pc *PricingCalculator) evaluateExpressionRule(rule PriceRule, selections []Selection, basePrice float64) *PriceAdjustment {
	// This is a simplified implementation
	// In a full system, you'd parse and evaluate the expression properly

	// For now, return nil (no adjustment)
	return nil
}

// ===================================================================
// HELPER METHODS
// ===================================================================

// applyAdjustments applies all price adjustments to base price
func (pc *PricingCalculator) applyAdjustments(basePrice float64, adjustments []PriceAdjustment) float64 {
	total := basePrice
	for _, adjustment := range adjustments {
		total += adjustment.Amount
	}

	// Ensure price is not negative
	if total < 0 {
		total = 0
	}

	return math.Round(total*100) / 100 // Round to 2 decimal places
}

// generateCacheKey creates a cache key for selections
func (pc *PricingCalculator) generateCacheKey(selections []Selection) string {
	// Sort selections for consistent cache keys
	sorted := make([]Selection, len(selections))
	copy(sorted, selections)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].OptionID < sorted[j].OptionID
	})

	var key string
	for _, selection := range sorted {
		if selection.Quantity > 0 {
			key += fmt.Sprintf("%s:%d,", selection.OptionID, selection.Quantity)
		}
	}
	return key
}

// parseSimpleExpression parses expressions like "opt1:10.0"
func (pc *PricingCalculator) parseSimpleExpression(expression string) []string {
	// Simple split on colon
	parts := make([]string, 0, 2)
	for i, part := range []string{expression} {
		if i == 0 {
			colonIndex := -1
			for j, char := range part {
				if char == ':' {
					colonIndex = j
					break
				}
			}
			if colonIndex > 0 {
				parts = append(parts, part[:colonIndex])
				parts = append(parts, part[colonIndex+1:])
			}
		}
	}
	return parts
}

// parseFloat converts string to float64
func (pc *PricingCalculator) parseFloat(s string) float64 {
	// Simple float parsing - in production use strconv.ParseFloat
	var result float64
	fmt.Sscanf(s, "%f", &result)
	return result
}

// ===================================================================
// CONFIGURATION AND STATS METHODS
// ===================================================================

// SetVolumeTiers allows customizing volume tier structure
func (pc *PricingCalculator) SetVolumeTiers(tiers []VolumeTier) {
	pc.mutex.Lock()
	defer pc.mutex.Unlock()

	pc.volumeTiers = make([]VolumeTier, len(tiers))
	copy(pc.volumeTiers, tiers)

	// Clear cache as tier changes affect pricing
	pc.cache = make(map[string]PriceBreakdown)
}

// GetVolumeTiers returns current volume tier configuration
func (pc *PricingCalculator) GetVolumeTiers() []VolumeTier {
	pc.mutex.RLock()
	defer pc.mutex.RUnlock()

	tiers := make([]VolumeTier, len(pc.volumeTiers))
	copy(tiers, pc.volumeTiers)
	return tiers
}

// GetStats returns current pricing calculator statistics
func (pc *PricingCalculator) GetStats() PricingStats {
	pc.mutex.RLock()
	defer pc.mutex.RUnlock()
	return pc.stats
}

// ClearCache clears the pricing calculation cache
func (pc *PricingCalculator) ClearCache() {
	pc.mutex.Lock()
	defer pc.mutex.Unlock()
	pc.cache = make(map[string]PriceBreakdown)
}

// GetCacheSize returns the number of cached price calculations
func (pc *PricingCalculator) GetCacheSize() int {
	pc.mutex.RLock()
	defer pc.mutex.RUnlock()
	return len(pc.cache)
}

// GetCacheHitRate returns the cache hit rate as a percentage
func (pc *PricingCalculator) GetCacheHitRate() float64 {
	pc.mutex.RLock()
	defer pc.mutex.RUnlock()

	total := pc.stats.CacheHits + pc.stats.CacheMisses
	if total == 0 {
		return 0.0
	}

	return float64(pc.stats.CacheHits) / float64(total) * 100.0
}
