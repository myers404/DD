// smb_volume_compiler.go
// SMB-optimized volume tier compiler with 4-tier structure and precompiled patterns
// Handles tier determination, pattern caching, and MTBDD compilation for volume pricing

package cpq

import (
	"fmt"
	"sync"
	"time"

	"DD/mtbdd"
)

// SMBVolumeTierCompiler handles SMB-specific volume tier compilation and caching
type SMBVolumeTierCompiler struct {
	registry       *VariableRegistry
	ruleCompiler   *RuleCompiler
	tiers          []VolumeTier
	tierPatterns   map[string]*PricingPattern
	commonPatterns map[string]*PricingPattern
	cache          map[string]*TierCacheEntry
	mutex          sync.RWMutex
	performance    *TierPerformanceTracker
	config         TierCompilerConfig
}

// VolumeTier defines a volume pricing tier for SMB market
type VolumeTier struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	MinQuantity int                    `json:"min_quantity"`
	MaxQuantity int                    `json:"max_quantity"`
	Discount    float64                `json:"discount"`   // Discount percentage (0.0-1.0)
	BasePrice   float64                `json:"base_price"` // Base price for calculations
	IsActive    bool                   `json:"is_active"`
	Priority    int                    `json:"priority"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// PricingPattern represents a compiled pricing pattern with caching metadata
type PricingPattern struct {
	ID              string                   `json:"id"`
	Name            string                   `json:"name"`
	CompiledMTBDD   mtbdd.NodeRef            `json:"compiled_mtbdd"`
	CacheKey        string                   `json:"cache_key"`
	TierConstraints map[string]mtbdd.NodeRef `json:"tier_constraints"`
	Variables       []string                 `json:"variables"`
	CompileTime     time.Duration            `json:"compile_time"`
	LastUsed        time.Time                `json:"last_used"`
	UseCount        int64                    `json:"use_count"`
	Metadata        map[string]interface{}   `json:"metadata"`
}

// TierCacheEntry represents a cached tier determination result
type TierCacheEntry struct {
	Quantity    int         `json:"quantity"`
	TierID      string      `json:"tier_id"`
	Tier        *VolumeTier `json:"tier"`
	CachedAt    time.Time   `json:"cached_at"`
	AccessCount int64       `json:"access_count"`
	LastAccess  time.Time   `json:"last_access"`
}

// TierPerformanceTracker tracks compiler performance metrics
type TierPerformanceTracker struct {
	TierDeterminations int64         `json:"tier_determinations"`
	CacheHits          int64         `json:"cache_hits"`
	CacheMisses        int64         `json:"cache_misses"`
	CompilationTime    time.Duration `json:"compilation_time"`
	AverageTime        time.Duration `json:"average_time"`
	TotalTime          time.Duration `json:"total_time"`
	LastCalculation    time.Time     `json:"last_calculation"`
	mutex              sync.Mutex
}

// TierCompilerConfig configures tier compiler behavior
type TierCompilerConfig struct {
	EnableCaching      bool          `json:"enable_caching"`
	CacheTTL           time.Duration `json:"cache_ttl"`
	MaxCacheSize       int           `json:"max_cache_size"`
	PrecompilePatterns bool          `json:"precompile_patterns"`
	EnableMetrics      bool          `json:"enable_metrics"`
	OptimizeMTBDD      bool          `json:"optimize_mtbdd"`
}

// ===================================================================
// CONSTRUCTOR AND INITIALIZATION
// ===================================================================

// NewSMBVolumeTierCompiler creates a new SMB volume tier compiler
func NewSMBVolumeTierCompiler(registry *VariableRegistry, ruleCompiler *RuleCompiler) *SMBVolumeTierCompiler {
	compiler := &SMBVolumeTierCompiler{
		registry:       registry,
		ruleCompiler:   ruleCompiler,
		tiers:          make([]VolumeTier, 0, 4),
		tierPatterns:   make(map[string]*PricingPattern),
		commonPatterns: make(map[string]*PricingPattern),
		cache:          make(map[string]*TierCacheEntry),
		performance:    NewTierPerformanceTracker(),
		config: TierCompilerConfig{
			EnableCaching:      true,
			CacheTTL:           30 * time.Minute,
			MaxCacheSize:       1000,
			PrecompilePatterns: true,
			EnableMetrics:      true,
			OptimizeMTBDD:      true,
		},
	}

	// Initialize standard SMB tiers
	if err := compiler.InitializeStandardTiers(); err != nil {
		// Log error but continue
	}

	return compiler
}

// NewTierPerformanceTracker creates a new performance tracker
func NewTierPerformanceTracker() *TierPerformanceTracker {
	return &TierPerformanceTracker{}
}

// InitializeStandardTiers sets up the 4-tier SMB volume structure
func (c *SMBVolumeTierCompiler) InitializeStandardTiers() error {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	// Tier 1: 1-10 units (0% discount)
	tier1 := VolumeTier{
		ID:          "tier_1",
		Name:        "Small Volume",
		Description: "1-10 units - Standard pricing",
		MinQuantity: 1,
		MaxQuantity: 10,
		Discount:    0.0, // No discount
		BasePrice:   1.0, // Base multiplier
		IsActive:    true,
		Priority:    1,
		Metadata: map[string]interface{}{
			"target_segment": "small_business",
			"incentive":      "entry_level",
		},
	}

	// Tier 2: 11-50 units (5% discount)
	tier2 := VolumeTier{
		ID:          "tier_2",
		Name:        "Medium Volume",
		Description: "11-50 units - 5% volume discount",
		MinQuantity: 11,
		MaxQuantity: 50,
		Discount:    0.05, // 5% discount
		BasePrice:   0.95,
		IsActive:    true,
		Priority:    2,
		Metadata: map[string]interface{}{
			"target_segment": "growing_business",
			"incentive":      "volume_starter",
		},
	}

	// Tier 3: 51-100 units (10% discount)
	tier3 := VolumeTier{
		ID:          "tier_3",
		Name:        "Large Volume",
		Description: "51-100 units - 10% volume discount",
		MinQuantity: 51,
		MaxQuantity: 100,
		Discount:    0.10, // 10% discount
		BasePrice:   0.90,
		IsActive:    true,
		Priority:    3,
		Metadata: map[string]interface{}{
			"target_segment": "established_business",
			"incentive":      "volume_preferred",
		},
	}

	// Tier 4: 101+ units (15% discount)
	tier4 := VolumeTier{
		ID:          "tier_4",
		Name:        "Bulk Volume",
		Description: "101+ units - 15% bulk discount",
		MinQuantity: 101,
		MaxQuantity: 99999, // Effectively unlimited
		Discount:    0.15,  // 15% discount
		BasePrice:   0.85,
		IsActive:    true,
		Priority:    4,
		Metadata: map[string]interface{}{
			"target_segment": "enterprise_smb",
			"incentive":      "bulk_preferred",
		},
	}

	// Store tiers
	c.tiers = []VolumeTier{tier1, tier2, tier3, tier4}

	return nil
}

// PrecompileCommonPatterns compiles frequently used tier patterns
func (c *SMBVolumeTierCompiler) PrecompileCommonPatterns() error {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	if !c.config.PrecompilePatterns {
		return nil
	}

	// Compile patterns for each tier
	for _, tier := range c.tiers {
		pattern, err := c.compileTierPattern(tier)
		if err != nil {
			return fmt.Errorf("failed to compile pattern for tier %s: %w", tier.ID, err)
		}
		c.tierPatterns[tier.ID] = pattern
	}

	// Compile common quantity combinations for cache optimization
	if err := c.compileCommonCombinations(); err != nil {
		return fmt.Errorf("failed to compile common combinations: %w", err)
	}

	return nil
}

// ===================================================================
// TIER DETERMINATION
// ===================================================================

// DetermineTier determines the appropriate volume tier for a given quantity
func (c *SMBVolumeTierCompiler) DetermineTier(quantity int) (*VolumeTier, error) {
	startTime := time.Now()
	defer func() {
		c.performance.RecordDetermination(time.Since(startTime))
	}()

	// Input validation
	if quantity <= 0 {
		return nil, fmt.Errorf("quantity must be positive: %d", quantity)
	}

	// Check cache first
	if c.config.EnableCaching {
		cacheKey := fmt.Sprintf("tier_%d", quantity)
		if cached := c.getCachedTier(cacheKey); cached != nil {
			c.performance.RecordCacheHit()
			return cached.Tier, nil
		}
		c.performance.RecordCacheMiss()
	}

	// Find matching tier with read lock
	c.mutex.RLock()
	var matchedTier *VolumeTier
	for i := range c.tiers {
		tier := &c.tiers[i]
		if !tier.IsActive {
			continue
		}

		if quantity >= tier.MinQuantity && quantity <= tier.MaxQuantity {
			matchedTier = tier
			break
		}
	}
	c.mutex.RUnlock() // Release read lock BEFORE caching

	if matchedTier == nil {
		return nil, fmt.Errorf("no tier found for quantity: %d", quantity)
	}

	// Cache the result AFTER releasing the read lock
	if c.config.EnableCaching {
		cacheKey := fmt.Sprintf("tier_%d", quantity)
		c.cacheTierResult(cacheKey, quantity, matchedTier)
	}

	return matchedTier, nil
}

// GetTierByID retrieves a tier by its ID
func (c *SMBVolumeTierCompiler) GetTierByID(tierID string) (*VolumeTier, error) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	for i := range c.tiers {
		if c.tiers[i].ID == tierID {
			return &c.tiers[i], nil
		}
	}

	return nil, fmt.Errorf("tier not found: %s", tierID)
}

// GetAllTiers returns all available tiers
func (c *SMBVolumeTierCompiler) GetAllTiers() []VolumeTier {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	result := make([]VolumeTier, len(c.tiers))
	copy(result, c.tiers)
	return result
}

// GetTierForRange returns the tier that would apply to a quantity range
func (c *SMBVolumeTierCompiler) GetTierForRange(minQuantity, maxQuantity int) ([]*VolumeTier, error) {
	if minQuantity <= 0 || maxQuantity <= 0 || minQuantity > maxQuantity {
		return nil, fmt.Errorf("invalid quantity range: %d-%d", minQuantity, maxQuantity)
	}

	c.mutex.RLock()
	defer c.mutex.RUnlock()

	var matchingTiers []*VolumeTier
	for i := range c.tiers {
		tier := &c.tiers[i]
		if !tier.IsActive {
			continue
		}

		// Check if tier overlaps with the range
		if tier.MaxQuantity >= minQuantity && tier.MinQuantity <= maxQuantity {
			matchingTiers = append(matchingTiers, tier)
		}
	}

	return matchingTiers, nil
}

// ===================================================================
// PATTERN COMPILATION
// ===================================================================

// compileTierPattern compiles a tier definition into an MTBDD pattern
func (c *SMBVolumeTierCompiler) compileTierPattern(tier VolumeTier) (*PricingPattern, error) {
	startTime := time.Now()

	// Create tier constraint expression
	expression := fmt.Sprintf(
		"IMPLIES((meta_total_quantity >= %d && meta_total_quantity <= %d), tier_%s_active)",
		tier.MinQuantity, tier.MaxQuantity, tier.ID,
	)

	// Register meta variables if needed
	if _, exists := c.registry.GetVariable("meta_total_quantity"); !exists {
		_, err := c.registry.RegisterVariable("meta_total_quantity", VarTypeInteger, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to register meta_total_quantity: %w", err)
		}
	}

	tierVarName := fmt.Sprintf("tier_%s_active", tier.ID)
	if _, exists := c.registry.GetVariable(tierVarName); !exists {
		_, err := c.registry.RegisterVariable(tierVarName, VarTypeBoolean, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to register tier variable %s: %w", tierVarName, err)
		}
	}

	// Compile to MTBDD
	compiled, err := c.ruleCompiler.CompileExpression(expression)
	if err != nil {
		return nil, fmt.Errorf("failed to compile tier expression: %w", err)
	}

	// Create pattern with metadata
	pattern := &PricingPattern{
		ID:              tier.ID,
		Name:            tier.Name,
		CompiledMTBDD:   compiled.CompiledMTBDD,
		CacheKey:        fmt.Sprintf("tier_%s_%d_%d", tier.ID, tier.MinQuantity, tier.MaxQuantity),
		TierConstraints: make(map[string]mtbdd.NodeRef),
		Variables:       compiled.Variables,
		CompileTime:     time.Since(startTime),
		LastUsed:        time.Now(),
		UseCount:        0,
		Metadata: map[string]interface{}{
			"tier_id":      tier.ID,
			"min_quantity": tier.MinQuantity,
			"max_quantity": tier.MaxQuantity,
			"discount":     tier.Discount,
			"compiled_at":  time.Now(),
		},
	}

	return pattern, nil
}

// compileCommonCombinations compiles common SMB tier combinations for cache optimization
func (c *SMBVolumeTierCompiler) compileCommonCombinations() error {
	// Common volume ranges for pre-compilation
	commonRanges := []struct {
		name     string
		quantity int
		expected string
	}{
		{"small_order", 5, "tier_1"},
		{"medium_order", 25, "tier_2"},
		{"large_order", 75, "tier_3"},
		{"bulk_order", 150, "tier_4"},
	}

	for _, combo := range commonRanges {
		expression := fmt.Sprintf("meta_total_quantity == %d", combo.quantity)
		compiled, err := c.ruleCompiler.CompileExpression(expression)
		if err != nil {
			return fmt.Errorf("failed to compile combo %s: %w", combo.name, err)
		}

		pattern := &PricingPattern{
			ID:            fmt.Sprintf("combo_%s", combo.name),
			Name:          fmt.Sprintf("Common %s pattern", combo.name),
			CompiledMTBDD: compiled.CompiledMTBDD,
			CacheKey:      fmt.Sprintf("combo_%s_%d", combo.name, combo.quantity),
			Variables:     compiled.Variables,
			CompileTime:   compiled.CompileTime,
			LastUsed:      time.Now(),
			UseCount:      0,
			Metadata: map[string]interface{}{
				"type":          "common_pattern",
				"quantity":      combo.quantity,
				"expected_tier": combo.expected,
				"precompiled":   true,
			},
		}

		c.commonPatterns[combo.name] = pattern
	}

	return nil
}

// GetCompiledPattern retrieves a compiled pattern for a tier
func (c *SMBVolumeTierCompiler) GetCompiledPattern(tierID string) (*PricingPattern, error) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	pattern, exists := c.tierPatterns[tierID]
	if !exists {
		return nil, fmt.Errorf("no compiled pattern for tier: %s", tierID)
	}

	// Update usage statistics
	pattern.LastUsed = time.Now()
	pattern.UseCount++

	return pattern, nil
}

// ===================================================================
// CACHE MANAGEMENT
// ===================================================================

// getCachedTier retrieves a cached tier determination
func (c *SMBVolumeTierCompiler) getCachedTier(cacheKey string) *TierCacheEntry {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	entry, exists := c.cache[cacheKey]
	if !exists {
		return nil
	}

	// Check TTL
	if c.config.EnableCaching && time.Since(entry.CachedAt) > c.config.CacheTTL {
		// Remove expired entry
		delete(c.cache, cacheKey)
		return nil
	}

	// Update access statistics
	entry.AccessCount++
	entry.LastAccess = time.Now()

	return entry
}

// cacheTierResult stores a tier determination result in cache
func (c *SMBVolumeTierCompiler) cacheTierResult(cacheKey string, quantity int, tier *VolumeTier) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	// Check cache size limit
	if len(c.cache) >= c.config.MaxCacheSize {
		c.evictOldestCacheEntry()
	}

	entry := &TierCacheEntry{
		Quantity:    quantity,
		TierID:      tier.ID,
		Tier:        tier,
		CachedAt:    time.Now(),
		AccessCount: 1,
		LastAccess:  time.Now(),
	}

	c.cache[cacheKey] = entry
}

// evictOldestCacheEntry removes the least recently used cache entry
func (c *SMBVolumeTierCompiler) evictOldestCacheEntry() {
	if len(c.cache) == 0 {
		return
	}

	var oldestKey string
	var oldestTime time.Time = time.Now()

	for key, entry := range c.cache {
		if entry.LastAccess.Before(oldestTime) {
			oldestTime = entry.LastAccess
			oldestKey = key
		}
	}

	if oldestKey != "" {
		delete(c.cache, oldestKey)
	}
}

// ClearCache removes all cached entries
func (c *SMBVolumeTierCompiler) ClearCache() {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.cache = make(map[string]*TierCacheEntry)
}

// ===================================================================
// PERFORMANCE TRACKING
// ===================================================================

// RecordDetermination records a tier determination operation
func (ppt *TierPerformanceTracker) RecordDetermination(duration time.Duration) {
	ppt.mutex.Lock()
	defer ppt.mutex.Unlock()

	ppt.TierDeterminations++
	ppt.TotalTime += duration
	ppt.LastCalculation = time.Now()

	if ppt.TierDeterminations > 0 {
		ppt.AverageTime = time.Duration(int64(ppt.TotalTime) / ppt.TierDeterminations)
	}
}

// RecordCacheHit records a cache hit
func (ppt *TierPerformanceTracker) RecordCacheHit() {
	ppt.mutex.Lock()
	defer ppt.mutex.Unlock()
	ppt.CacheHits++
}

// RecordCacheMiss records a cache miss
func (ppt *TierPerformanceTracker) RecordCacheMiss() {
	ppt.mutex.Lock()
	defer ppt.mutex.Unlock()
	ppt.CacheMisses++
}

// GetPerformanceStats returns current performance statistics
func (ppt *TierPerformanceTracker) GetPerformanceStats() map[string]interface{} {
	ppt.mutex.Lock()
	defer ppt.mutex.Unlock()

	cacheHitRate := 0.0
	totalCacheOps := ppt.CacheHits + ppt.CacheMisses
	if totalCacheOps > 0 {
		cacheHitRate = float64(ppt.CacheHits) / float64(totalCacheOps)
	}

	return map[string]interface{}{
		"tier_determinations": ppt.TierDeterminations,
		"cache_hits":          ppt.CacheHits,
		"cache_misses":        ppt.CacheMisses,
		"cache_hit_rate":      cacheHitRate,
		"average_time_ms":     float64(ppt.AverageTime.Nanoseconds()) / 1e6,
		"total_time_ms":       float64(ppt.TotalTime.Nanoseconds()) / 1e6,
		"last_calculation":    ppt.LastCalculation,
	}
}

// ===================================================================
// VALIDATION AND TESTING
// ===================================================================

// ValidateTierStructure validates the tier configuration
func (c *SMBVolumeTierCompiler) ValidateTierStructure() []error {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	var errors []error

	if len(c.tiers) == 0 {
		errors = append(errors, fmt.Errorf("no tiers defined"))
		return errors
	}

	// Check for gaps and overlaps
	for i, tier := range c.tiers {
		// Validate individual tier
		if tier.MinQuantity <= 0 {
			errors = append(errors, fmt.Errorf("tier %s has invalid min quantity: %d", tier.ID, tier.MinQuantity))
		}
		if tier.MaxQuantity <= 0 {
			errors = append(errors, fmt.Errorf("tier %s has invalid max quantity: %d", tier.ID, tier.MaxQuantity))
		}
		if tier.MinQuantity > tier.MaxQuantity {
			errors = append(errors, fmt.Errorf("tier %s has min > max: %d > %d", tier.ID, tier.MinQuantity, tier.MaxQuantity))
		}
		if tier.Discount < 0 || tier.Discount > 1 {
			errors = append(errors, fmt.Errorf("tier %s has invalid discount: %f", tier.ID, tier.Discount))
		}

		// Check for overlaps with other tiers
		for j, otherTier := range c.tiers {
			if i != j && tier.IsActive && otherTier.IsActive {
				if tier.MinQuantity <= otherTier.MaxQuantity && tier.MaxQuantity >= otherTier.MinQuantity {
					errors = append(errors, fmt.Errorf("tiers %s and %s overlap", tier.ID, otherTier.ID))
				}
			}
		}
	}

	return errors
}

// TestTierDetermination tests tier determination for a range of quantities
func (c *SMBVolumeTierCompiler) TestTierDetermination(testCases []int) map[int]string {
	results := make(map[int]string)

	for _, quantity := range testCases {
		tier, err := c.DetermineTier(quantity)
		if err != nil {
			results[quantity] = fmt.Sprintf("ERROR: %s", err.Error())
		} else {
			results[quantity] = tier.ID
		}
	}

	return results
}

// ===================================================================
// PUBLIC INTERFACE
// ===================================================================

// GetStats returns comprehensive compiler statistics
func (c *SMBVolumeTierCompiler) GetStats() map[string]interface{} {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	stats := c.performance.GetPerformanceStats()

	stats["total_tiers"] = len(c.tiers)
	stats["active_tiers"] = c.countActiveTiers()
	stats["compiled_patterns"] = len(c.tierPatterns)
	stats["common_patterns"] = len(c.commonPatterns)
	stats["cache_size"] = len(c.cache)
	stats["max_cache_size"] = c.config.MaxCacheSize

	return stats
}

// countActiveTiers counts the number of active tiers
func (c *SMBVolumeTierCompiler) countActiveTiers() int {
	count := 0
	for _, tier := range c.tiers {
		if tier.IsActive {
			count++
		}
	}
	return count
}

// SetConfig updates compiler configuration
func (c *SMBVolumeTierCompiler) SetConfig(config TierCompilerConfig) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.config = config
}

// GetConfig returns current compiler configuration
func (c *SMBVolumeTierCompiler) GetConfig() TierCompilerConfig {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.config
}

// Shutdown performs cleanup when the compiler is no longer needed
func (c *SMBVolumeTierCompiler) Shutdown() {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	// Clear caches
	c.cache = make(map[string]*TierCacheEntry)
	c.tierPatterns = make(map[string]*PricingPattern)
	c.commonPatterns = make(map[string]*PricingPattern)
}
