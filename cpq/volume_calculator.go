// volume_calculator.go
// Volume pricing calculator with SMB optimization, customer context, and performance tracking
// Handles real-time pricing calculations with sub-50ms response times

package cpq

import (
	"fmt"
	"sync"
	"time"
)

// VolumePricingCalculator handles comprehensive volume pricing calculations
type VolumePricingCalculator struct {
	tierCompiler  *SMBVolumeTierCompiler
	contextEngine *CustomerContextEngine
	validator     *PricingValidator
	performance   *PricingPerformanceTracker
	cache         map[string]*PricingCacheEntry
	mutex         sync.RWMutex
	config        CalculatorConfig
}

// VolumePricingResult represents the result of a volume pricing calculation
type VolumePricingResult struct {
	BasePrice       float64                `json:"base_price"`
	TierID          string                 `json:"tier_id"`
	TierDiscount    float64                `json:"tier_discount"`
	CustomerSegment string                 `json:"customer_segment"`
	SegmentBonus    float64                `json:"segment_bonus"`
	VolumeBonus     float64                `json:"volume_bonus"`
	SeasonalBonus   float64                `json:"seasonal_bonus"`
	TotalDiscount   float64                `json:"total_discount"`
	FinalPrice      float64                `json:"final_price"`
	Savings         float64                `json:"savings"`
	CalculationTime time.Duration          `json:"calculation_time"`
	Details         map[string]interface{} `json:"details"`
	Metadata        map[string]interface{} `json:"metadata"`
}

// PricingCacheEntry represents a cached pricing calculation
type PricingCacheEntry struct {
	CacheKey     string               `json:"cache_key"`
	Result       *VolumePricingResult `json:"result"`
	CreatedAt    time.Time            `json:"created_at"`
	LastAccessed time.Time            `json:"last_accessed"`
	AccessCount  int64                `json:"access_count"`
	CustomerID   string               `json:"customer_id,omitempty"`
	ExpiresAt    time.Time            `json:"expires_at"`
}

// PricingPerformanceTracker tracks calculation performance metrics
type PricingPerformanceTracker struct {
	calculations    int64         `json:"calculations"`
	cacheHits       int64         `json:"cache_hits"`
	cacheMisses     int64         `json:"cache_misses"`
	averageTime     time.Duration `json:"average_time"`
	totalTime       time.Duration `json:"total_time"`
	lastCalculation time.Time     `json:"last_calculation"`
	errors          int64         `json:"errors"`
	mutex           sync.Mutex
}

// CalculatorConfig configures calculator behavior
type CalculatorConfig struct {
	EnableCaching             bool          `json:"enable_caching"`
	CacheTTL                  time.Duration `json:"cache_ttl"`
	MaxCacheSize              int           `json:"max_cache_size"`
	EnablePerformanceTracking bool          `json:"enable_performance_tracking"`
	MaxCalculationTime        time.Duration `json:"max_calculation_time"`
	EnableDetailedResults     bool          `json:"enable_detailed_results"`
	RoundPrecision            int           `json:"round_precision"`
}

// PricingValidator validates pricing calculations and inputs
type PricingValidator struct {
	minBasePrice float64
	maxBasePrice float64
	minQuantity  int
	maxQuantity  int
	maxDiscount  float64
}

// ===================================================================
// CONSTRUCTOR AND INITIALIZATION
// ===================================================================

// NewVolumePricingCalculator creates a new volume pricing calculator
func NewVolumePricingCalculator(
	tierCompiler *SMBVolumeTierCompiler,
	contextEngine *CustomerContextEngine,
	validator *PricingValidator,
) *VolumePricingCalculator {

	if validator == nil {
		validator = NewDefaultPricingValidator()
	}

	return &VolumePricingCalculator{
		tierCompiler:  tierCompiler,
		contextEngine: contextEngine,
		validator:     validator,
		performance:   NewPricingPerformanceTracker(),
		cache:         make(map[string]*PricingCacheEntry),
		config: CalculatorConfig{
			EnableCaching:             true,
			CacheTTL:                  15 * time.Minute,
			MaxCacheSize:              500,
			EnablePerformanceTracking: true,
			MaxCalculationTime:        50 * time.Millisecond, // Target <50ms
			EnableDetailedResults:     true,
			RoundPrecision:            2,
		},
	}
}

// NewPricingPerformanceTracker creates a new performance tracker
func NewPricingPerformanceTracker() *PricingPerformanceTracker {
	return &PricingPerformanceTracker{}
}

// NewDefaultPricingValidator creates a validator with default constraints
func NewDefaultPricingValidator() *PricingValidator {
	return &PricingValidator{
		minBasePrice: 0.01,   // Minimum $0.01
		maxBasePrice: 999999, // Maximum $999,999
		minQuantity:  1,      // Minimum 1 unit
		maxQuantity:  99999,  // Maximum 99,999 units
		maxDiscount:  0.50,   // Maximum 50% discount
	}
}

// ===================================================================
// MAIN CALCULATION INTERFACE
// ===================================================================

func (c *VolumePricingCalculator) recordError() {
	if c.performance != nil {
		c.performance.RecordError()
	}
}

func (c *VolumePricingCalculator) recordCacheHit() {
	if c.performance != nil {
		c.performance.RecordCacheHit()
	}
}

func (c *VolumePricingCalculator) recordCacheMiss() {
	if c.performance != nil {
		c.performance.RecordCacheMiss()
	}
}

// CalculateVolumePrice performs complete volume pricing calculation with customer context
func (c *VolumePricingCalculator) CalculateVolumePrice(
	basePrice float64,
	quantity int,
	context *ConfigurationContext,
) (*VolumePricingResult, error) {

	startTime := time.Now()
	defer func() {
		if c.config.EnablePerformanceTracking {
			c.performance.RecordCalculation(time.Since(startTime), false)
		}
	}()

	// Critical fix: Validate calculator is properly initialized
	if c.tierCompiler == nil {
		c.recordError() // CHANGED: Use safe method
		return nil, fmt.Errorf("tier compiler not initialized")
	}

	if c.contextEngine == nil {
		c.recordError() // CHANGED: Use safe method
		return nil, fmt.Errorf("context engine not initialized")
	}

	// Validate inputs
	if err := c.validateInputs(basePrice, quantity); err != nil {
		c.recordError() // CHANGED: Use safe method
		return nil, fmt.Errorf("input validation failed: %w", err)
	}

	// Check cache first
	if c.config.EnableCaching {
		cacheKey := c.generateCacheKey(basePrice, quantity, context)
		if cached := c.getCachedResult(cacheKey); cached != nil {
			c.performance.RecordCacheHit()
			cached.CalculationTime = time.Since(startTime)
			return cached, nil
		}
		c.performance.RecordCacheMiss()
	}

	// Create result structure
	result := &VolumePricingResult{
		BasePrice:       basePrice,
		CalculationTime: time.Duration(0), // Will be set at the end
		Details:         make(map[string]interface{}),
		Metadata:        make(map[string]interface{}),
	}

	// Step 1: Determine volume tier (O(1) lookup)
	tier, err := c.tierCompiler.DetermineTier(quantity)
	if err != nil {
		c.performance.RecordError()
		return nil, fmt.Errorf("failed to determine tier: %w", err)
	}

	result.TierID = tier.ID
	result.TierDiscount = tier.Discount

	// Step 2: Determine customer segment
	segment, err := c.contextEngine.DetermineSegment(context)
	if err != nil {
		c.performance.RecordError()
		return nil, fmt.Errorf("failed to determine segment: %w", err)
	}

	result.CustomerSegment = segment

	// Step 3: Calculate base discount from tier
	discountedPrice := basePrice * (1.0 - tier.Discount)

	// Step 4: Calculate customer segment bonus
	segmentBonus := c.contextEngine.CalculateSegmentBonus(segment, tier, quantity)
	result.SegmentBonus = segmentBonus

	// Step 5: Calculate additional bonuses
	volumeBonus := c.calculateVolumeBonus(segment, quantity, tier)
	result.VolumeBonus = volumeBonus

	seasonalBonus := c.calculateSeasonalBonus(segment, context)
	result.SeasonalBonus = seasonalBonus

	// Step 6: Apply all discounts and bonuses
	totalBonus := segmentBonus + volumeBonus + seasonalBonus
	bonusAmount := discountedPrice * totalBonus

	finalPrice := discountedPrice - bonusAmount
	if finalPrice < 0 {
		finalPrice = 0
	}

	// Apply rounding
	finalPrice = c.roundPrice(finalPrice)

	// Step 7: Calculate final values
	result.TotalDiscount = tier.Discount + totalBonus
	result.FinalPrice = finalPrice
	result.Savings = basePrice - finalPrice

	// Step 8: Add detailed breakdown
	if c.config.EnableDetailedResults {
		c.addDetailedBreakdown(result, basePrice, tier, segment, quantity, context)
	}

	// Step 9: Validate result
	if err := c.validateResult(result); err != nil {
		c.performance.RecordError()
		return nil, fmt.Errorf("result validation failed: %w", err)
	}

	// Record final calculation time
	calculationTime := time.Since(startTime)
	result.CalculationTime = calculationTime

	// Check if calculation exceeded target time
	if calculationTime > c.config.MaxCalculationTime {
		result.Metadata["performance_warning"] = fmt.Sprintf("Calculation took %v, exceeds target %v",
			calculationTime, c.config.MaxCalculationTime)
	}

	// Cache the result
	if c.config.EnableCaching {
		cacheKey := c.generateCacheKey(basePrice, quantity, context)
		c.cacheResult(cacheKey, result, context)
	}

	return result, nil
}

// CalculateBulkPrice calculates pricing for multiple items with volume aggregation
func (c *VolumePricingCalculator) CalculateBulkPrice(
	items []PricingItem,
	context *ConfigurationContext,
) (*BulkPricingResult, error) {

	if len(items) == 0 {
		return nil, fmt.Errorf("no items provided")
	}

	// Critical fix: Validate components are initialized
	if c.tierCompiler == nil {
		return nil, fmt.Errorf("tier compiler not initialized")
	}

	if c.contextEngine == nil {
		return nil, fmt.Errorf("context engine not initialized")
	}

	startTime := time.Now()

	// Calculate total quantity for tier determination
	totalQuantity := 0
	totalBasePrice := 0.0

	for _, item := range items {
		// Validate individual items
		if item.Quantity <= 0 {
			return nil, fmt.Errorf("item %s has invalid quantity: %d", item.ItemID, item.Quantity)
		}
		if item.BasePrice < 0 {
			return nil, fmt.Errorf("item %s has negative base price: %f", item.ItemID, item.BasePrice)
		}

		totalQuantity += item.Quantity
		totalBasePrice += item.BasePrice * float64(item.Quantity)
	}

	// Critical fix: Check for zero total price to prevent division by zero
	if totalBasePrice == 0 {
		return nil, fmt.Errorf("total base price cannot be zero")
	}

	// Calculate volume pricing using aggregated quantity
	volumeResult, err := c.CalculateVolumePrice(totalBasePrice, totalQuantity, context)
	if err != nil {
		return nil, fmt.Errorf("bulk volume calculation failed: %w", err)
	}

	// Create bulk result
	bulkResult := &BulkPricingResult{
		Items:           make([]ItemPricingResult, len(items)),
		TotalBasePrice:  totalBasePrice,
		TotalFinalPrice: volumeResult.FinalPrice,
		TotalSavings:    volumeResult.Savings,
		OverallDiscount: volumeResult.TotalDiscount,
		TierID:          volumeResult.TierID,
		CustomerSegment: volumeResult.CustomerSegment,
		CalculationTime: time.Since(startTime),
		VolumeBreakdown: volumeResult,
	}

	// Calculate individual item pricing (maintaining proportional discounts)
	for i, item := range items {
		itemBaseTotal := item.BasePrice * float64(item.Quantity)
		itemProportion := itemBaseTotal / totalBasePrice // Safe now due to zero check above
		itemFinalPrice := volumeResult.FinalPrice * itemProportion
		itemSavings := itemBaseTotal - itemFinalPrice

		bulkResult.Items[i] = ItemPricingResult{
			ItemID:     item.ItemID,
			Quantity:   item.Quantity,
			BasePrice:  item.BasePrice,
			FinalPrice: itemFinalPrice,
			Savings:    itemSavings,
			Proportion: itemProportion,
		}
	}

	return bulkResult, nil
}

// ===================================================================
// BONUS CALCULATIONS
// ===================================================================

// calculateVolumeBonus calculates additional volume-based bonuses
func (c *VolumePricingCalculator) calculateVolumeBonus(segment string, quantity int, tier *VolumeTier) float64 {
	if tier == nil {
		return 0.0
	}

	// Volume bonuses are typically handled by the context engine
	// This could be extended for additional volume incentives

	// Example: Additional bonus for quantities above tier midpoint
	if tier.MaxQuantity > tier.MinQuantity {
		midpoint := (tier.MinQuantity + tier.MaxQuantity) / 2
		if quantity > midpoint {
			switch segment {
			case "professional":
				return 0.005 // Additional 0.5% bonus
			case "enterprise":
				return 0.01 // Additional 1% bonus
			}
		}
	}

	return 0.0
}

// calculateSeasonalBonus calculates time-based bonuses
func (c *VolumePricingCalculator) calculateSeasonalBonus(segment string, context *ConfigurationContext) float64 {
	// Seasonal bonuses are handled by the context engine
	// This could be extended for calculation-specific seasonal logic
	return 0.0
}

// ===================================================================
// VALIDATION
// ===================================================================

// validateInputs validates calculation inputs
func (c *VolumePricingCalculator) validateInputs(basePrice float64, quantity int) error {
	if c.validator == nil {
		return fmt.Errorf("validator not initialized")
	}

	if basePrice < c.validator.minBasePrice {
		return fmt.Errorf("base price %f below minimum %f", basePrice, c.validator.minBasePrice)
	}
	if basePrice > c.validator.maxBasePrice {
		return fmt.Errorf("base price %f exceeds maximum %f", basePrice, c.validator.maxBasePrice)
	}
	if quantity < c.validator.minQuantity {
		return fmt.Errorf("quantity %d below minimum %d", quantity, c.validator.minQuantity)
	}
	if quantity > c.validator.maxQuantity {
		return fmt.Errorf("quantity %d exceeds maximum %d", quantity, c.validator.maxQuantity)
	}
	return nil
}

// validateResult validates calculation results
func (c *VolumePricingCalculator) validateResult(result *VolumePricingResult) error {
	if result == nil {
		return fmt.Errorf("result cannot be nil")
	}

	if result.FinalPrice < 0 {
		return fmt.Errorf("negative final price: %f", result.FinalPrice)
	}
	if c.validator != nil && result.TotalDiscount > c.validator.maxDiscount {
		return fmt.Errorf("total discount %f exceeds maximum %f", result.TotalDiscount, c.validator.maxDiscount)
	}
	if result.FinalPrice > result.BasePrice {
		return fmt.Errorf("final price %f exceeds base price %f", result.FinalPrice, result.BasePrice)
	}
	return nil
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

// addDetailedBreakdown adds comprehensive calculation details
func (c *VolumePricingCalculator) addDetailedBreakdown(
	result *VolumePricingResult,
	basePrice float64,
	tier *VolumeTier,
	segment string,
	quantity int,
	context *ConfigurationContext,
) {
	if result.Details == nil {
		result.Details = make(map[string]interface{})
	}
	if result.Metadata == nil {
		result.Metadata = make(map[string]interface{})
	}

	result.Details["base_price"] = basePrice
	result.Details["quantity"] = quantity

	if tier != nil {
		result.Details["tier_info"] = map[string]interface{}{
			"id":           tier.ID,
			"name":         tier.Name,
			"min_quantity": tier.MinQuantity,
			"max_quantity": tier.MaxQuantity,
			"discount":     tier.Discount,
		}
	}

	result.Details["segment_info"] = map[string]interface{}{
		"segment":       segment,
		"segment_bonus": result.SegmentBonus,
	}

	if tier != nil {
		result.Details["calculation_steps"] = []string{
			fmt.Sprintf("Base price: $%.2f", basePrice),
			fmt.Sprintf("Tier discount (%s): %.1f%% = $%.2f", tier.ID, tier.Discount*100, basePrice*tier.Discount),
			fmt.Sprintf("Segment bonus (%s): %.1f%% = $%.2f", segment, result.SegmentBonus*100, basePrice*(1-tier.Discount)*result.SegmentBonus),
			fmt.Sprintf("Final price: $%.2f", result.FinalPrice),
			fmt.Sprintf("Total savings: $%.2f", result.Savings),
		}
	}

	// Add customer context if available
	if context != nil && context.Customer != nil {
		result.Details["customer_id"] = context.Customer.ID
		if attrs := context.Customer.Attributes; attrs != nil {
			result.Details["customer_attributes"] = attrs
		}
	}

	// Add metadata
	result.Metadata["calculation_timestamp"] = time.Now()
	result.Metadata["calculator_version"] = "1.0.0"
	result.Metadata["pricing_model"] = "smb_volume_tiered"
}

// roundPrice rounds price to configured precision
func (c *VolumePricingCalculator) roundPrice(price float64) float64 {
	if c.config.RoundPrecision <= 0 {
		return price
	}

	multiplier := 1.0
	for i := 0; i < c.config.RoundPrecision; i++ {
		multiplier *= 10
	}

	return float64(int(price*multiplier+0.5)) / multiplier
}

// ===================================================================
// CACHE MANAGEMENT
// ===================================================================

// generateCacheKey creates a cache key for pricing calculations
func (c *VolumePricingCalculator) generateCacheKey(basePrice float64, quantity int, context *ConfigurationContext) string {
	customerID := ""
	segmentInfo := ""

	if context != nil && context.Customer != nil {
		customerID = context.Customer.ID
		if attrs := context.Customer.Attributes; attrs != nil {
			if segment, exists := attrs["type"]; exists {
				segmentInfo = fmt.Sprintf("_%v", segment)
			}
		}
	}

	return fmt.Sprintf("price_%.2f_qty_%d_cust_%s%s", basePrice, quantity, customerID, segmentInfo)
}

// getCachedResult retrieves a cached pricing result
func (c *VolumePricingCalculator) getCachedResult(cacheKey string) *VolumePricingResult {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	entry, exists := c.cache[cacheKey]
	if !exists {
		return nil
	}

	// Check expiration
	if time.Now().After(entry.ExpiresAt) {
		delete(c.cache, cacheKey)
		return nil
	}

	// Update access statistics
	entry.AccessCount++
	entry.LastAccessed = time.Now()

	return entry.Result
}

// cacheResult stores a pricing result in cache
func (c *VolumePricingCalculator) cacheResult(cacheKey string, result *VolumePricingResult, context *ConfigurationContext) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	if c.cache == nil {
		c.cache = make(map[string]*PricingCacheEntry)
	}

	// Check cache size limit
	if len(c.cache) >= c.config.MaxCacheSize {
		c.evictOldestCacheEntry()
	}

	customerID := ""
	if context != nil && context.Customer != nil {
		customerID = context.Customer.ID
	}

	entry := &PricingCacheEntry{
		CacheKey:     cacheKey,
		Result:       result,
		CreatedAt:    time.Now(),
		LastAccessed: time.Now(),
		AccessCount:  1,
		CustomerID:   customerID,
		ExpiresAt:    time.Now().Add(c.config.CacheTTL),
	}

	c.cache[cacheKey] = entry
}

// evictOldestCacheEntry removes the least recently used cache entry
func (c *VolumePricingCalculator) evictOldestCacheEntry() {
	if len(c.cache) == 0 {
		return
	}

	var oldestKey string
	var oldestTime time.Time = time.Now()

	for key, entry := range c.cache {
		if entry.LastAccessed.Before(oldestTime) {
			oldestTime = entry.LastAccessed
			oldestKey = key
		}
	}

	if oldestKey != "" {
		delete(c.cache, oldestKey)
	}
}

// ===================================================================
// PERFORMANCE TRACKING
// ===================================================================

// RecordCalculation records a pricing calculation
func (ppt *PricingPerformanceTracker) RecordCalculation(duration time.Duration, cached bool) {
	if ppt == nil {
		return // Safely ignore if tracker is nil
	}

	ppt.mutex.Lock()
	defer ppt.mutex.Unlock()

	ppt.calculations++
	ppt.totalTime += duration
	ppt.lastCalculation = time.Now()

	if ppt.calculations > 0 {
		ppt.averageTime = time.Duration(int64(ppt.totalTime) / ppt.calculations)
	}
}

// RecordCacheHit records a cache hit
func (ppt *PricingPerformanceTracker) RecordCacheHit() {
	if ppt == nil {
		return // Safely ignore if tracker is nil
	}
	ppt.mutex.Lock()
	defer ppt.mutex.Unlock()
	ppt.cacheHits++
}

// RecordCacheMiss records a cache miss
func (ppt *PricingPerformanceTracker) RecordCacheMiss() {
	if ppt == nil {
		return // Safely ignore if tracker is nil
	}
	ppt.mutex.Lock()
	defer ppt.mutex.Unlock()
	ppt.cacheMisses++
}

// RecordError records a calculation error
func (ppt *PricingPerformanceTracker) RecordError() {
	if ppt == nil {
		return // Safely ignore if tracker is nil
	}
	ppt.mutex.Lock()
	defer ppt.mutex.Unlock()
	ppt.errors++
}

// GetPerformanceStats returns performance statistics
func (ppt *PricingPerformanceTracker) GetPerformanceStats() map[string]interface{} {
	ppt.mutex.Lock()
	defer ppt.mutex.Unlock()

	cacheHitRate := 0.0
	totalCacheOps := ppt.cacheHits + ppt.cacheMisses
	if totalCacheOps > 0 {
		cacheHitRate = float64(ppt.cacheHits) / float64(totalCacheOps)
	}

	return map[string]interface{}{
		"calculations":     ppt.calculations,
		"cache_hits":       ppt.cacheHits,
		"cache_misses":     ppt.cacheMisses,
		"cache_hit_rate":   cacheHitRate,
		"average_time_ms":  float64(ppt.averageTime.Nanoseconds()) / 1e6,
		"total_time_ms":    float64(ppt.totalTime.Nanoseconds()) / 1e6,
		"last_calculation": ppt.lastCalculation,
		"errors":           ppt.errors,
	}
}

// ===================================================================
// SUPPORTING TYPES
// ===================================================================

// PricingItem represents an item for bulk pricing calculation
type PricingItem struct {
	ItemID    string  `json:"item_id"`
	BasePrice float64 `json:"base_price"`
	Quantity  int     `json:"quantity"`
}

// BulkPricingResult represents the result of bulk pricing calculation
type BulkPricingResult struct {
	Items           []ItemPricingResult  `json:"items"`
	TotalBasePrice  float64              `json:"total_base_price"`
	TotalFinalPrice float64              `json:"total_final_price"`
	TotalSavings    float64              `json:"total_savings"`
	OverallDiscount float64              `json:"overall_discount"`
	TierID          string               `json:"tier_id"`
	CustomerSegment string               `json:"customer_segment"`
	CalculationTime time.Duration        `json:"calculation_time"`
	VolumeBreakdown *VolumePricingResult `json:"volume_breakdown"`
}

// ItemPricingResult represents pricing result for individual item
type ItemPricingResult struct {
	ItemID     string  `json:"item_id"`
	Quantity   int     `json:"quantity"`
	BasePrice  float64 `json:"base_price"`
	FinalPrice float64 `json:"final_price"`
	Savings    float64 `json:"savings"`
	Proportion float64 `json:"proportion"`
}

// ===================================================================
// PUBLIC INTERFACE
// ===================================================================

// GetStats returns comprehensive calculator statistics
func (c *VolumePricingCalculator) GetStats() map[string]interface{} {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	var stats map[string]interface{}
	if c.performance != nil {
		stats = c.performance.GetPerformanceStats()
	} else {
		stats = make(map[string]interface{})
	}

	if c.cache != nil {
		stats["cache_size"] = len(c.cache)
	} else {
		stats["cache_size"] = 0
	}

	stats["max_cache_size"] = c.config.MaxCacheSize
	stats["cache_ttl_minutes"] = c.config.CacheTTL.Minutes()

	return stats
}

// ClearCache removes all cached pricing results
func (c *VolumePricingCalculator) ClearCache() {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.cache = make(map[string]*PricingCacheEntry)
}

// SetConfig updates calculator configuration
func (c *VolumePricingCalculator) SetConfig(config CalculatorConfig) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.config = config
}

// GetConfig returns current calculator configuration
func (c *VolumePricingCalculator) GetConfig() CalculatorConfig {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.config
}
