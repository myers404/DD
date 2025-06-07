// customer_context.go
// Customer context engine for SMB-optimized volume pricing with segment-based bonuses
// Handles customer segmentation, volume history analysis, and pricing personalization

package cpq

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

// CustomerContextEngine handles customer segmentation and context-aware pricing
type CustomerContextEngine struct {
	segments        map[string]*CustomerSegment
	segmentRules    []SegmentRule
	volumeHistory   map[string]*VolumeHistory
	bonusCalculator *BonusCalculator
	mutex           sync.RWMutex
	metrics         *ContextMetrics
	config          ContextConfig
}

// CustomerSegment defines customer segment characteristics
type CustomerSegment struct {
	ID               string                 `json:"id"`
	Name             string                 `json:"name"`
	Description      string                 `json:"description"`
	BaseBonus        float64                `json:"base_bonus"`         // Base bonus percentage (0.0-1.0)
	VolumeMultiplier float64                `json:"volume_multiplier"`  // Volume bonus multiplier
	MinVolumeHistory int                    `json:"min_volume_history"` // Minimum historical volume
	MaxVolumeHistory int                    `json:"max_volume_history"` // Maximum historical volume
	Attributes       map[string]interface{} `json:"attributes"`
	IsActive         bool                   `json:"is_active"`
	Priority         int                    `json:"priority"`
}

// SegmentRule defines rules for automatic customer segmentation
type SegmentRule struct {
	ID         string                 `json:"id"`
	Name       string                 `json:"name"`
	SegmentID  string                 `json:"segment_id"`
	Conditions []SegmentCondition     `json:"conditions"`
	Priority   int                    `json:"priority"`
	IsActive   bool                   `json:"is_active"`
	Metadata   map[string]interface{} `json:"metadata"`
}

// SegmentCondition defines individual conditions for segment rules
type SegmentCondition struct {
	Attribute string      `json:"attribute"`
	Operator  string      `json:"operator"` // eq, ne, gt, gte, lt, lte, in, contains
	Value     interface{} `json:"value"`
	Weight    float64     `json:"weight"`
}

// VolumeHistory tracks customer volume history for segment determination
type VolumeHistory struct {
	CustomerID       string         `json:"customer_id"`
	TotalVolume      int            `json:"total_volume"`
	AverageOrderSize float64        `json:"average_order_size"`
	OrderCount       int            `json:"order_count"`
	LastOrderDate    time.Time      `json:"last_order_date"`
	VolumeByMonth    map[string]int `json:"volume_by_month"`
	VolumeByQuarter  map[string]int `json:"volume_by_quarter"`
	TrendDirection   string         `json:"trend_direction"` // increasing, stable, decreasing
	TrendScore       float64        `json:"trend_score"`     // -1.0 to 1.0
}

// BonusCalculator handles customer-specific bonus calculations
type BonusCalculator struct {
	tierBonuses     map[string]map[string]float64 // segment -> tier -> bonus
	volumeBonuses   map[string]*VolumeBonusRule   // segment -> volume bonus rule
	loyaltyBonuses  map[string]*LoyaltyBonusRule  // segment -> loyalty bonus rule
	seasonalBonuses []SeasonalBonusRule           // time-based bonuses
}

// VolumeBonusRule defines volume-based bonus rules
type VolumeBonusRule struct {
	ID               string            `json:"id"`
	Name             string            `json:"name"`
	SegmentID        string            `json:"segment_id"`
	VolumeThresholds []VolumeThreshold `json:"volume_thresholds"`
	MaxBonus         float64           `json:"max_bonus"`
	IsActive         bool              `json:"is_active"`
}

// VolumeThreshold defines volume thresholds for bonuses
type VolumeThreshold struct {
	MinVolume int     `json:"min_volume"`
	MaxVolume int     `json:"max_volume"`
	Bonus     float64 `json:"bonus"`
}

// LoyaltyBonusRule defines loyalty-based bonus rules
type LoyaltyBonusRule struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	SegmentID      string  `json:"segment_id"`
	MinOrderCount  int     `json:"min_order_count"`
	MinCustomerAge int     `json:"min_customer_age_days"`
	LoyaltyBonus   float64 `json:"loyalty_bonus"`
	RetentionBonus float64 `json:"retention_bonus"`
	IsActive       bool    `json:"is_active"`
}

// SeasonalBonusRule defines time-based bonus rules
type SeasonalBonusRule struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	Bonus     float64   `json:"bonus"`
	Segments  []string  `json:"segments"` // Empty means all segments
	IsActive  bool      `json:"is_active"`
}

// ContextMetrics tracks customer context performance
type ContextMetrics struct {
	TotalSegmentations  int64            `json:"total_segmentations"`
	SegmentationsByType map[string]int64 `json:"segmentations_by_type"`
	BonusCalculations   int64            `json:"bonus_calculations"`
	AverageSegmentTime  time.Duration    `json:"average_segment_time"`
	CacheHitRate        float64          `json:"cache_hit_rate"`
	ErrorCount          int64            `json:"error_count"`
	mutex               sync.Mutex
}

// ContextConfig configures customer context behavior
type ContextConfig struct {
	EnableVolumeHistory   bool          `json:"enable_volume_history"`
	EnableLoyaltyBonuses  bool          `json:"enable_loyalty_bonuses"`
	EnableSeasonalBonuses bool          `json:"enable_seasonal_bonuses"`
	CacheEnabled          bool          `json:"cache_enabled"`
	CacheTTL              time.Duration `json:"cache_ttl"`
	DefaultSegmentID      string        `json:"default_segment_id"`
	MaxVolumeHistoryDays  int           `json:"max_volume_history_days"`
}

// ===================================================================
// CONSTRUCTOR AND INITIALIZATION
// ===================================================================

// NewCustomerContextEngine creates a new customer context engine
func NewCustomerContextEngine() *CustomerContextEngine {
	engine := &CustomerContextEngine{
		segments:        make(map[string]*CustomerSegment),
		segmentRules:    make([]SegmentRule, 0),
		volumeHistory:   make(map[string]*VolumeHistory),
		bonusCalculator: NewBonusCalculator(),
		metrics:         NewContextMetrics(),
		config: ContextConfig{
			EnableVolumeHistory:   true,
			EnableLoyaltyBonuses:  true,
			EnableSeasonalBonuses: true,
			CacheEnabled:          true,
			CacheTTL:              10 * time.Minute,
			DefaultSegmentID:      "standard",
			MaxVolumeHistoryDays:  365,
		},
	}

	return engine
}

// NewBonusCalculator creates a new bonus calculator
func NewBonusCalculator() *BonusCalculator {
	return &BonusCalculator{
		tierBonuses:     make(map[string]map[string]float64),
		volumeBonuses:   make(map[string]*VolumeBonusRule),
		loyaltyBonuses:  make(map[string]*LoyaltyBonusRule),
		seasonalBonuses: make([]SeasonalBonusRule, 0),
	}
}

// NewContextMetrics creates a new context metrics tracker
func NewContextMetrics() *ContextMetrics {
	return &ContextMetrics{
		SegmentationsByType: make(map[string]int64),
	}
}

// InitializeStandardSegments sets up standard SMB customer segments
func (ce *CustomerContextEngine) InitializeStandardSegments() error {
	ce.mutex.Lock()
	defer ce.mutex.Unlock()

	// Standard segment (baseline)
	standardSegment := &CustomerSegment{
		ID:               "standard",
		Name:             "Standard Customer",
		Description:      "Basic customer segment with standard pricing",
		BaseBonus:        0.0, // No bonus
		VolumeMultiplier: 1.0, // No volume multiplier
		MinVolumeHistory: 0,
		MaxVolumeHistory: 25,
		Attributes:       make(map[string]interface{}),
		IsActive:         true,
		Priority:         1,
	}

	// Professional segment (+5% bonus)
	professionalSegment := &CustomerSegment{
		ID:               "professional",
		Name:             "Professional Customer",
		Description:      "Professional customers with 5% bonus and volume incentives",
		BaseBonus:        0.05, // 5% base bonus
		VolumeMultiplier: 1.2,  // 20% volume multiplier
		MinVolumeHistory: 25,
		MaxVolumeHistory: 100,
		Attributes: map[string]interface{}{
			"priority_support":  true,
			"extended_warranty": true,
		},
		IsActive: true,
		Priority: 2,
	}

	// Enterprise segment (+10% bonus)
	enterpriseSegment := &CustomerSegment{
		ID:               "enterprise",
		Name:             "Enterprise Customer",
		Description:      "Enterprise customers with 10% bonus and maximum volume incentives",
		BaseBonus:        0.10, // 10% base bonus
		VolumeMultiplier: 1.5,  // 50% volume multiplier
		MinVolumeHistory: 100,
		MaxVolumeHistory: 99999,
		Attributes: map[string]interface{}{
			"priority_support":          true,
			"extended_warranty":         true,
			"dedicated_account_manager": true,
			"custom_terms":              true,
		},
		IsActive: true,
		Priority: 3,
	}

	// Register segments
	ce.segments["standard"] = standardSegment
	ce.segments["professional"] = professionalSegment
	ce.segments["enterprise"] = enterpriseSegment

	// Initialize segment rules
	if err := ce.initializeSegmentRules(); err != nil {
		return fmt.Errorf("failed to initialize segment rules: %w", err)
	}

	// Initialize bonus calculator
	if err := ce.initializeBonusCalculator(); err != nil {
		return fmt.Errorf("failed to initialize bonus calculator: %w", err)
	}

	return nil
}

// initializeSegmentRules sets up automatic segmentation rules
func (ce *CustomerContextEngine) initializeSegmentRules() error {
	// Rule for professional segment
	professionalRule := SegmentRule{
		ID:        "auto_professional",
		Name:      "Automatic Professional Segmentation",
		SegmentID: "professional",
		Conditions: []SegmentCondition{
			{
				Attribute: "volume_history",
				Operator:  "gte",
				Value:     25.0,
				Weight:    1.0,
			},
			{
				Attribute: "volume_history",
				Operator:  "lt",
				Value:     100.0,
				Weight:    1.0,
			},
		},
		Priority: 2,
		IsActive: true,
		Metadata: map[string]interface{}{
			"auto_created": true,
		},
	}

	// Rule for enterprise segment
	enterpriseRule := SegmentRule{
		ID:        "auto_enterprise",
		Name:      "Automatic Enterprise Segmentation",
		SegmentID: "enterprise",
		Conditions: []SegmentCondition{
			{
				Attribute: "volume_history",
				Operator:  "gte",
				Value:     100.0,
				Weight:    1.0,
			},
		},
		Priority: 3,
		IsActive: true,
		Metadata: map[string]interface{}{
			"auto_created": true,
		},
	}

	// Rule for explicit type-based segmentation
	typeBasedRule := SegmentRule{
		ID:        "explicit_type",
		Name:      "Explicit Type-Based Segmentation",
		SegmentID: "", // Will be determined by type attribute
		Conditions: []SegmentCondition{
			{
				Attribute: "type",
				Operator:  "in",
				Value:     []string{"standard", "professional", "enterprise"},
				Weight:    2.0, // Higher weight for explicit type
			},
		},
		Priority: 1, // Highest priority
		IsActive: true,
		Metadata: map[string]interface{}{
			"explicit_type": true,
		},
	}

	ce.segmentRules = []SegmentRule{typeBasedRule, enterpriseRule, professionalRule}
	return nil
}

// initializeBonusCalculator sets up bonus calculation rules
func (ce *CustomerContextEngine) initializeBonusCalculator() error {
	// Tier-based bonuses for each segment
	ce.bonusCalculator.tierBonuses["standard"] = map[string]float64{
		"tier_1": 0.0,
		"tier_2": 0.0,
		"tier_3": 0.0,
		"tier_4": 0.0,
	}

	ce.bonusCalculator.tierBonuses["professional"] = map[string]float64{
		"tier_1": 0.02, // 2% additional bonus
		"tier_2": 0.03, // 3% additional bonus
		"tier_3": 0.04, // 4% additional bonus
		"tier_4": 0.05, // 5% additional bonus
	}

	ce.bonusCalculator.tierBonuses["enterprise"] = map[string]float64{
		"tier_1": 0.03, // 3% additional bonus
		"tier_2": 0.05, // 5% additional bonus
		"tier_3": 0.07, // 7% additional bonus
		"tier_4": 0.10, // 10% additional bonus
	}

	// Volume bonus rules
	professionalVolumeRule := &VolumeBonusRule{
		ID:        "professional_volume",
		Name:      "Professional Volume Bonus",
		SegmentID: "professional",
		VolumeThresholds: []VolumeThreshold{
			{MinVolume: 50, MaxVolume: 100, Bonus: 0.02},
			{MinVolume: 100, MaxVolume: 200, Bonus: 0.03},
		},
		MaxBonus: 0.05,
		IsActive: true,
	}

	enterpriseVolumeRule := &VolumeBonusRule{
		ID:        "enterprise_volume",
		Name:      "Enterprise Volume Bonus",
		SegmentID: "enterprise",
		VolumeThresholds: []VolumeThreshold{
			{MinVolume: 100, MaxVolume: 250, Bonus: 0.03},
			{MinVolume: 250, MaxVolume: 500, Bonus: 0.05},
			{MinVolume: 500, MaxVolume: 99999, Bonus: 0.08},
		},
		MaxBonus: 0.10,
		IsActive: true,
	}

	ce.bonusCalculator.volumeBonuses["professional"] = professionalVolumeRule
	ce.bonusCalculator.volumeBonuses["enterprise"] = enterpriseVolumeRule

	// Loyalty bonus rules
	professionalLoyalty := &LoyaltyBonusRule{
		ID:             "professional_loyalty",
		Name:           "Professional Customer Loyalty",
		SegmentID:      "professional",
		MinOrderCount:  5,
		MinCustomerAge: 90, // 90 days
		LoyaltyBonus:   0.02,
		RetentionBonus: 0.01,
		IsActive:       true,
	}

	enterpriseLoyalty := &LoyaltyBonusRule{
		ID:             "enterprise_loyalty",
		Name:           "Enterprise Customer Loyalty",
		SegmentID:      "enterprise",
		MinOrderCount:  3,
		MinCustomerAge: 60, // 60 days
		LoyaltyBonus:   0.03,
		RetentionBonus: 0.02,
		IsActive:       true,
	}

	ce.bonusCalculator.loyaltyBonuses["professional"] = professionalLoyalty
	ce.bonusCalculator.loyaltyBonuses["enterprise"] = enterpriseLoyalty

	return nil
}

// ===================================================================
// CUSTOMER SEGMENTATION
// ===================================================================

// DetermineSegment determines customer segment based on context
func (ce *CustomerContextEngine) DetermineSegment(context *ConfigurationContext) (string, error) {
	startTime := time.Now()
	defer func() {
		ce.updateMetrics("segmentation", time.Since(startTime))
	}()

	if context == nil || context.Customer == nil {
		return ce.config.DefaultSegmentID, nil
	}

	ce.mutex.RLock()
	defer ce.mutex.RUnlock()

	// Try rules in priority order
	bestMatch := ""
	bestScore := 0.0

	for _, rule := range ce.segmentRules {
		if !rule.IsActive {
			continue
		}

		score, matches := ce.evaluateSegmentRule(rule, context)
		if matches && score > bestScore {
			bestScore = score

			// For explicit type rule, use the type as segment ID
			if rule.ID == "explicit_type" {
				if typeAttr, exists := context.Customer.Attributes["type"]; exists {
					if typeStr, ok := typeAttr.(string); ok {
						bestMatch = typeStr
					}
				}
			} else {
				bestMatch = rule.SegmentID
			}
		}
	}

	// Fallback to default if no match
	if bestMatch == "" {
		bestMatch = ce.config.DefaultSegmentID
	}

	// Validate segment exists
	if _, exists := ce.segments[bestMatch]; !exists {
		bestMatch = ce.config.DefaultSegmentID
	}

	return bestMatch, nil
}

// evaluateSegmentRule evaluates a segment rule against customer context
func (ce *CustomerContextEngine) evaluateSegmentRule(rule SegmentRule, context *ConfigurationContext) (float64, bool) {
	totalWeight := 0.0
	matchedWeight := 0.0

	for _, condition := range rule.Conditions {
		totalWeight += condition.Weight

		if ce.evaluateCondition(condition, context) {
			matchedWeight += condition.Weight
		}
	}

	if totalWeight == 0 {
		return 0, false
	}

	score := matchedWeight / totalWeight
	matches := score >= 0.5 // Require at least 50% condition match

	return score, matches
}

// evaluateCondition evaluates a single segment condition
func (ce *CustomerContextEngine) evaluateCondition(condition SegmentCondition, context *ConfigurationContext) bool {
	// Get attribute value from customer
	var attrValue interface{}
	if context.Customer != nil && context.Customer.Attributes != nil {
		attrValue = context.Customer.Attributes[condition.Attribute]
	}

	// Handle different operators
	switch condition.Operator {
	case "eq":
		return ce.compareEqual(attrValue, condition.Value)
	case "ne":
		return !ce.compareEqual(attrValue, condition.Value)
	case "gt":
		return ce.compareGreater(attrValue, condition.Value)
	case "gte":
		return ce.compareGreaterEqual(attrValue, condition.Value)
	case "lt":
		return ce.compareLess(attrValue, condition.Value)
	case "lte":
		return ce.compareLessEqual(attrValue, condition.Value)
	case "in":
		return ce.compareIn(attrValue, condition.Value)
	case "contains":
		return ce.compareContains(attrValue, condition.Value)
	default:
		return false
	}
}

// ===================================================================
// BONUS CALCULATION
// ===================================================================

// CalculateSegmentBonus calculates customer segment bonus
func (ce *CustomerContextEngine) CalculateSegmentBonus(segment string, tier *VolumeTier, quantity int) float64 {
	startTime := time.Now()
	defer func() {
		ce.updateMetrics("bonus_calculation", time.Since(startTime))
	}()

	ce.mutex.RLock()
	defer ce.mutex.RUnlock()

	totalBonus := 0.0

	// Get base segment bonus
	if segmentInfo, exists := ce.segments[segment]; exists {
		totalBonus += segmentInfo.BaseBonus
	}

	// Get tier-specific bonus
	if tier != nil {
		if tierBonuses, exists := ce.bonusCalculator.tierBonuses[segment]; exists {
			if tierBonus, exists := tierBonuses[tier.ID]; exists {
				totalBonus += tierBonus
			}
		}
	}

	// Apply volume bonus if enabled
	if ce.config.EnableVolumeHistory {
		volumeBonus := ce.calculateVolumeBonus(segment, quantity)
		totalBonus += volumeBonus
	}

	// Apply seasonal bonuses if enabled
	if ce.config.EnableSeasonalBonuses {
		seasonalBonus := ce.calculateSeasonalBonus(segment)
		totalBonus += seasonalBonus
	}

	return totalBonus
}

// calculateVolumeBonus calculates volume-based bonus
func (ce *CustomerContextEngine) calculateVolumeBonus(segment string, quantity int) float64 {
	volumeRule, exists := ce.bonusCalculator.volumeBonuses[segment]
	if !exists || !volumeRule.IsActive {
		return 0.0
	}

	for _, threshold := range volumeRule.VolumeThresholds {
		if quantity >= threshold.MinVolume && quantity <= threshold.MaxVolume {
			bonus := threshold.Bonus
			if bonus > volumeRule.MaxBonus {
				bonus = volumeRule.MaxBonus
			}
			return bonus
		}
	}

	return 0.0
}

// calculateSeasonalBonus calculates seasonal/time-based bonus
func (ce *CustomerContextEngine) calculateSeasonalBonus(segment string) float64 {
	now := time.Now()
	maxBonus := 0.0

	for _, seasonalRule := range ce.bonusCalculator.seasonalBonuses {
		if !seasonalRule.IsActive {
			continue
		}

		// Check if current time is within seasonal period
		if now.After(seasonalRule.StartDate) && now.Before(seasonalRule.EndDate) {
			// Check if segment is included (empty means all segments)
			if len(seasonalRule.Segments) == 0 {
				if seasonalRule.Bonus > maxBonus {
					maxBonus = seasonalRule.Bonus
				}
			} else {
				for _, seg := range seasonalRule.Segments {
					if seg == segment {
						if seasonalRule.Bonus > maxBonus {
							maxBonus = seasonalRule.Bonus
						}
						break
					}
				}
			}
		}
	}

	return maxBonus
}

// ===================================================================
// VOLUME HISTORY MANAGEMENT
// ===================================================================

// UpdateVolumeHistory updates customer volume history
func (ce *CustomerContextEngine) UpdateVolumeHistory(customerID string, orderVolume int, orderValue float64) error {
	ce.mutex.Lock()
	defer ce.mutex.Unlock()

	if customerID == "" {
		return fmt.Errorf("customer ID cannot be empty")
	}

	if orderVolume < 0 {
		return fmt.Errorf("order volume cannot be negative")
	}

	history, exists := ce.volumeHistory[customerID]
	if !exists {
		history = &VolumeHistory{
			CustomerID:      customerID,
			VolumeByMonth:   make(map[string]int),
			VolumeByQuarter: make(map[string]int),
			TrendDirection:  "stable",
			TrendScore:      0.0,
		}
		ce.volumeHistory[customerID] = history
	}

	// Update totals
	history.TotalVolume += orderVolume
	history.OrderCount++
	history.LastOrderDate = time.Now()

	// Recalculate average order size
	if history.OrderCount > 0 {
		history.AverageOrderSize = float64(history.TotalVolume) / float64(history.OrderCount)
	}

	// Update monthly and quarterly tracking
	now := time.Now()
	monthKey := now.Format("2006-01")
	quarterKey := fmt.Sprintf("%d-Q%d", now.Year(), (now.Month()-1)/3+1)

	history.VolumeByMonth[monthKey] += orderVolume
	history.VolumeByQuarter[quarterKey] += orderVolume

	// Calculate trend
	ce.calculateVolumeTrend(history)

	return nil
}

// calculateVolumeTrend calculates volume trend direction and score
func (ce *CustomerContextEngine) calculateVolumeTrend(history *VolumeHistory) {
	// Critical fix: Validate we have enough data and avoid bounds errors
	if history == nil || len(history.VolumeByMonth) < 3 {
		if history != nil {
			history.TrendDirection = "stable"
			history.TrendScore = 0.0
		}
		return
	}

	// Get sorted months to ensure consistent ordering
	months := make([]string, 0, len(history.VolumeByMonth))
	for month := range history.VolumeByMonth {
		months = append(months, month)
	}

	// Critical fix: Ensure consistent sorting order
	sort.Strings(months)

	// Critical fix: Bounds checking to prevent array index errors
	if len(months) < 3 {
		history.TrendDirection = "stable"
		history.TrendScore = 0.0
		return
	}

	// Get the last 3 months safely
	lastIndex := len(months) - 1
	secondLastIndex := lastIndex - 1
	thirdLastIndex := lastIndex - 2

	// Critical fix: Additional bounds checking
	if thirdLastIndex < 0 || secondLastIndex < 0 || lastIndex < 0 {
		history.TrendDirection = "stable"
		history.TrendScore = 0.0
		return
	}

	recent := history.VolumeByMonth[months[lastIndex]]
	previous := history.VolumeByMonth[months[secondLastIndex]]
	older := history.VolumeByMonth[months[thirdLastIndex]]

	// Calculate trend score
	recentAvg := float64(recent+previous) / 2.0
	olderAvg := float64(previous+older) / 2.0

	// Critical fix: Avoid division by zero
	if olderAvg == 0 {
		if recentAvg > 0 {
			history.TrendDirection = "increasing"
			history.TrendScore = 1.0
		} else {
			history.TrendDirection = "stable"
			history.TrendScore = 0.0
		}
		return
	}

	trendScore := (recentAvg - olderAvg) / olderAvg
	history.TrendScore = trendScore

	// Determine trend direction based on score
	if trendScore > 0.1 {
		history.TrendDirection = "increasing"
	} else if trendScore < -0.1 {
		history.TrendDirection = "decreasing"
	} else {
		history.TrendDirection = "stable"
	}
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

// Comparison functions for condition evaluation
func (ce *CustomerContextEngine) compareEqual(a, b interface{}) bool {
	return fmt.Sprintf("%v", a) == fmt.Sprintf("%v", b)
}

func (ce *CustomerContextEngine) compareGreater(a, b interface{}) bool {
	aFloat, aOk := ce.toFloat64(a)
	bFloat, bOk := ce.toFloat64(b)
	return aOk && bOk && aFloat > bFloat
}

func (ce *CustomerContextEngine) compareGreaterEqual(a, b interface{}) bool {
	aFloat, aOk := ce.toFloat64(a)
	bFloat, bOk := ce.toFloat64(b)
	return aOk && bOk && aFloat >= bFloat
}

func (ce *CustomerContextEngine) compareLess(a, b interface{}) bool {
	aFloat, aOk := ce.toFloat64(a)
	bFloat, bOk := ce.toFloat64(b)
	return aOk && bOk && aFloat < bFloat
}

func (ce *CustomerContextEngine) compareLessEqual(a, b interface{}) bool {
	aFloat, aOk := ce.toFloat64(a)
	bFloat, bOk := ce.toFloat64(b)
	return aOk && bOk && aFloat <= bFloat
}

func (ce *CustomerContextEngine) compareIn(a, b interface{}) bool {
	aStr := fmt.Sprintf("%v", a)

	switch bSlice := b.(type) {
	case []string:
		for _, item := range bSlice {
			if item == aStr {
				return true
			}
		}
	case []interface{}:
		for _, item := range bSlice {
			if fmt.Sprintf("%v", item) == aStr {
				return true
			}
		}
	}

	return false
}

func (ce *CustomerContextEngine) compareContains(a, b interface{}) bool {
	aStr := fmt.Sprintf("%v", a)
	bStr := fmt.Sprintf("%v", b)
	return len(aStr) > 0 && len(bStr) > 0 &&
		(aStr == bStr || (len(aStr) > len(bStr) && aStr[:len(bStr)] == bStr))
}

func (ce *CustomerContextEngine) toFloat64(value interface{}) (float64, bool) {
	switch v := value.(type) {
	case float64:
		return v, true
	case float32:
		return float64(v), true
	case int:
		return float64(v), true
	case int64:
		return float64(v), true
	case int32:
		return float64(v), true
	default:
		return 0, false
	}
}

// updateMetrics updates performance metrics
func (ce *CustomerContextEngine) updateMetrics(operation string, duration time.Duration) {
	if ce.metrics == nil {
		return
	}

	ce.metrics.mutex.Lock()
	defer ce.metrics.mutex.Unlock()

	switch operation {
	case "segmentation":
		ce.metrics.TotalSegmentations++
		ce.metrics.AverageSegmentTime = duration
	case "bonus_calculation":
		ce.metrics.BonusCalculations++
	}
}

// ===================================================================
// PUBLIC INTERFACE
// ===================================================================

// GetSegment retrieves segment information by ID
func (ce *CustomerContextEngine) GetSegment(segmentID string) (*CustomerSegment, bool) {
	ce.mutex.RLock()
	defer ce.mutex.RUnlock()

	segment, exists := ce.segments[segmentID]
	return segment, exists
}

// GetAllSegments returns all available segments
func (ce *CustomerContextEngine) GetAllSegments() map[string]*CustomerSegment {
	ce.mutex.RLock()
	defer ce.mutex.RUnlock()

	result := make(map[string]*CustomerSegment)
	for id, segment := range ce.segments {
		result[id] = segment
	}

	return result
}

// GetVolumeHistory retrieves volume history for a customer
func (ce *CustomerContextEngine) GetVolumeHistory(customerID string) (*VolumeHistory, bool) {
	ce.mutex.RLock()
	defer ce.mutex.RUnlock()

	history, exists := ce.volumeHistory[customerID]
	return history, exists
}

// GetMetrics returns current context engine metrics
func (ce *CustomerContextEngine) GetMetrics() map[string]interface{} {
	if ce.metrics == nil {
		return make(map[string]interface{})
	}

	ce.metrics.mutex.Lock()
	defer ce.metrics.mutex.Unlock()

	return map[string]interface{}{
		"total_segmentations":     ce.metrics.TotalSegmentations,
		"segmentations_by_type":   ce.metrics.SegmentationsByType,
		"bonus_calculations":      ce.metrics.BonusCalculations,
		"average_segment_time_ms": float64(ce.metrics.AverageSegmentTime.Nanoseconds()) / 1e6,
		"cache_hit_rate":          ce.metrics.CacheHitRate,
		"error_count":             ce.metrics.ErrorCount,
		"total_segments":          len(ce.segments),
		"total_volume_histories":  len(ce.volumeHistory),
	}
}

// SetConfig updates context engine configuration
func (ce *CustomerContextEngine) SetConfig(config ContextConfig) {
	ce.mutex.Lock()
	defer ce.mutex.Unlock()
	ce.config = config
}
