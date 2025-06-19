// cache/memory.go
// In-memory cache implementation

package cache

import (
	"DD/cpq"
	"encoding/json"
	"sync"
	"time"
)

// MemoryCache implements CacheRepository using in-memory storage
type MemoryCache struct {
	data       map[string]cacheEntry
	mutex      sync.RWMutex
	stats      CacheStats
	maxSize    int64
	currentSize int64
	keyBuilder *CacheKeyBuilder
}

type cacheEntry struct {
	value      interface{}
	size       int64
	expiration time.Time
	accessTime time.Time
	accessCount int64
}

// NewMemoryCache creates a new in-memory cache
func NewMemoryCache(prefix string, maxSize int64) *MemoryCache {
	cache := &MemoryCache{
		data:       make(map[string]cacheEntry),
		maxSize:    maxSize,
		keyBuilder: NewCacheKeyBuilder(prefix),
		stats: CacheStats{
			LastReset: time.Now(),
		},
	}
	
	// Start cleanup goroutine
	go cache.cleanupRoutine()
	
	return cache
}

// Model operations
func (c *MemoryCache) GetModel(key string) (*cpq.Model, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	fullKey := c.keyBuilder.ModelKey(key)
	if entry, exists := c.data[fullKey]; exists {
		if time.Now().Before(entry.expiration) {
			c.stats.Hits++
			c.updateHitRate()
			
			// Update access time and count
			entry.accessTime = time.Now()
			entry.accessCount++
			c.data[fullKey] = entry
			
			if model, ok := entry.value.(*cpq.Model); ok {
				return model, true
			}
		}
	}
	
	c.stats.Misses++
	c.updateHitRate()
	return nil, false
}

func (c *MemoryCache) SetModel(key string, model *cpq.Model, ttl time.Duration) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	fullKey := c.keyBuilder.ModelKey(key)
	size := c.estimateSize(model)
	
	// Check if we need to evict entries
	if c.currentSize+size > c.maxSize {
		c.evictLRU()
	}
	
	c.data[fullKey] = cacheEntry{
		value:       model,
		size:        size,
		expiration:  time.Now().Add(ttl),
		accessTime:  time.Now(),
		accessCount: 0,
	}
	
	c.currentSize += size
	c.stats.Sets++
	c.stats.Keys = int64(len(c.data))
	
	return nil
}

func (c *MemoryCache) InvalidateModel(key string) error {
	return c.Delete(c.keyBuilder.ModelKey(key))
}

// Configuration operations
func (c *MemoryCache) GetConfiguration(key string) (*cpq.Configuration, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	fullKey := c.keyBuilder.ConfigurationKey(key)
	if entry, exists := c.data[fullKey]; exists {
		if time.Now().Before(entry.expiration) {
			c.stats.Hits++
			c.updateHitRate()
			
			if config, ok := entry.value.(*cpq.Configuration); ok {
				return config, true
			}
		}
	}
	
	c.stats.Misses++
	c.updateHitRate()
	return nil, false
}

func (c *MemoryCache) SetConfiguration(key string, config *cpq.Configuration, ttl time.Duration) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	fullKey := c.keyBuilder.ConfigurationKey(key)
	size := c.estimateSize(config)
	
	if c.currentSize+size > c.maxSize {
		c.evictLRU()
	}
	
	c.data[fullKey] = cacheEntry{
		value:       config,
		size:        size,
		expiration:  time.Now().Add(ttl),
		accessTime:  time.Now(),
		accessCount: 0,
	}
	
	c.currentSize += size
	c.stats.Sets++
	c.stats.Keys = int64(len(c.data))
	
	return nil
}

func (c *MemoryCache) InvalidateConfiguration(key string) error {
	return c.Delete(c.keyBuilder.ConfigurationKey(key))
}

// Available options operations
func (c *MemoryCache) GetAvailableOptions(key string) ([]cpq.AvailableOption, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	fullKey := c.keyBuilder.AvailableOptionsKey(key)
	if entry, exists := c.data[fullKey]; exists {
		if time.Now().Before(entry.expiration) {
			c.stats.Hits++
			c.updateHitRate()
			
			if options, ok := entry.value.([]cpq.AvailableOption); ok {
				return options, true
			}
		}
	}
	
	c.stats.Misses++
	c.updateHitRate()
	return nil, false
}

func (c *MemoryCache) SetAvailableOptions(key string, options []cpq.AvailableOption, ttl time.Duration) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	fullKey := c.keyBuilder.AvailableOptionsKey(key)
	size := c.estimateSize(options)
	
	if c.currentSize+size > c.maxSize {
		c.evictLRU()
	}
	
	c.data[fullKey] = cacheEntry{
		value:       options,
		size:        size,
		expiration:  time.Now().Add(ttl),
		accessTime:  time.Now(),
		accessCount: 0,
	}
	
	c.currentSize += size
	c.stats.Sets++
	c.stats.Keys = int64(len(c.data))
	
	return nil
}

func (c *MemoryCache) InvalidateAvailableOptions(key string) error {
	return c.Delete(c.keyBuilder.AvailableOptionsKey(key))
}

// Validation result operations
func (c *MemoryCache) GetValidationResult(key string) (*cpq.ValidationResult, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	fullKey := c.keyBuilder.ValidationKey(key)
	if entry, exists := c.data[fullKey]; exists {
		if time.Now().Before(entry.expiration) {
			c.stats.Hits++
			c.updateHitRate()
			
			if result, ok := entry.value.(*cpq.ValidationResult); ok {
				return result, true
			}
		}
	}
	
	c.stats.Misses++
	c.updateHitRate()
	return nil, false
}

func (c *MemoryCache) SetValidationResult(key string, result *cpq.ValidationResult, ttl time.Duration) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	fullKey := c.keyBuilder.ValidationKey(key)
	size := c.estimateSize(result)
	
	if c.currentSize+size > c.maxSize {
		c.evictLRU()
	}
	
	c.data[fullKey] = cacheEntry{
		value:       result,
		size:        size,
		expiration:  time.Now().Add(ttl),
		accessTime:  time.Now(),
		accessCount: 0,
	}
	
	c.currentSize += size
	c.stats.Sets++
	c.stats.Keys = int64(len(c.data))
	
	return nil
}

func (c *MemoryCache) InvalidateValidationResult(key string) error {
	return c.Delete(c.keyBuilder.ValidationKey(key))
}

// Generic operations
func (c *MemoryCache) Get(key string) (interface{}, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	if entry, exists := c.data[key]; exists {
		if time.Now().Before(entry.expiration) {
			c.stats.Hits++
			c.updateHitRate()
			return entry.value, true
		}
	}
	
	c.stats.Misses++
	c.updateHitRate()
	return nil, false
}

func (c *MemoryCache) Set(key string, value interface{}, ttl time.Duration) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	size := c.estimateSize(value)
	
	if c.currentSize+size > c.maxSize {
		c.evictLRU()
	}
	
	c.data[key] = cacheEntry{
		value:       value,
		size:        size,
		expiration:  time.Now().Add(ttl),
		accessTime:  time.Now(),
		accessCount: 0,
	}
	
	c.currentSize += size
	c.stats.Sets++
	c.stats.Keys = int64(len(c.data))
	
	return nil
}

func (c *MemoryCache) Delete(key string) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	if entry, exists := c.data[key]; exists {
		delete(c.data, key)
		c.currentSize -= entry.size
		c.stats.Deletes++
		c.stats.Keys = int64(len(c.data))
	}
	
	return nil
}

func (c *MemoryCache) Exists(key string) bool {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	entry, exists := c.data[key]
	return exists && time.Now().Before(entry.expiration)
}

func (c *MemoryCache) Flush() error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	c.data = make(map[string]cacheEntry)
	c.currentSize = 0
	c.stats.Keys = 0
	
	return nil
}

func (c *MemoryCache) InvalidatePattern(pattern string) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	// Simple prefix matching for now
	keysToDelete := []string{}
	for key := range c.data {
		if len(key) >= len(pattern) && key[:len(pattern)] == pattern {
			keysToDelete = append(keysToDelete, key)
		}
	}
	
	for _, key := range keysToDelete {
		if entry, exists := c.data[key]; exists {
			delete(c.data, key)
			c.currentSize -= entry.size
			c.stats.Deletes++
		}
	}
	
	c.stats.Keys = int64(len(c.data))
	return nil
}

func (c *MemoryCache) Stats() CacheStats {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	stats := c.stats
	stats.Size = c.currentSize
	stats.Keys = int64(len(c.data))
	
	return stats
}

// Helper methods

func (c *MemoryCache) cleanupRoutine() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	
	for range ticker.C {
		c.cleanup()
	}
}

func (c *MemoryCache) cleanup() {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	now := time.Now()
	keysToDelete := []string{}
	
	for key, entry := range c.data {
		if now.After(entry.expiration) {
			keysToDelete = append(keysToDelete, key)
		}
	}
	
	for _, key := range keysToDelete {
		if entry, exists := c.data[key]; exists {
			delete(c.data, key)
			c.currentSize -= entry.size
		}
	}
	
	c.stats.Keys = int64(len(c.data))
}

func (c *MemoryCache) evictLRU() {
	// Find least recently used entry
	var lruKey string
	var lruTime time.Time
	
	for key, entry := range c.data {
		if lruKey == "" || entry.accessTime.Before(lruTime) {
			lruKey = key
			lruTime = entry.accessTime
		}
	}
	
	if lruKey != "" {
		if entry, exists := c.data[lruKey]; exists {
			delete(c.data, lruKey)
			c.currentSize -= entry.size
		}
	}
}

func (c *MemoryCache) estimateSize(value interface{}) int64 {
	// Simple size estimation using JSON encoding
	data, err := json.Marshal(value)
	if err != nil {
		return 1024 // Default 1KB
	}
	return int64(len(data))
}

func (c *MemoryCache) updateHitRate() {
	total := c.stats.Hits + c.stats.Misses
	if total > 0 {
		c.stats.HitRate = float64(c.stats.Hits) / float64(total)
	}
}