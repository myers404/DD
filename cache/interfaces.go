// cache/interfaces.go
// Cache repository interface for abstracted caching

package cache

import (
	"DD/cpq"
	"time"
)

// CacheRepository defines the interface for cache operations
type CacheRepository interface {
	// Model caching
	GetModel(key string) (*cpq.Model, bool)
	SetModel(key string, model *cpq.Model, ttl time.Duration) error
	InvalidateModel(key string) error
	
	// Configuration caching
	GetConfiguration(key string) (*cpq.Configuration, bool)
	SetConfiguration(key string, config *cpq.Configuration, ttl time.Duration) error
	InvalidateConfiguration(key string) error
	
	// Available options caching (for constraint checking)
	GetAvailableOptions(key string) ([]cpq.AvailableOption, bool)
	SetAvailableOptions(key string, options []cpq.AvailableOption, ttl time.Duration) error
	InvalidateAvailableOptions(key string) error
	
	// Validation results caching
	GetValidationResult(key string) (*cpq.ValidationResult, bool)
	SetValidationResult(key string, result *cpq.ValidationResult, ttl time.Duration) error
	InvalidateValidationResult(key string) error
	
	// Generic methods
	Get(key string) (interface{}, bool)
	Set(key string, value interface{}, ttl time.Duration) error
	Delete(key string) error
	Exists(key string) bool
	Flush() error
	
	// Pattern-based invalidation
	InvalidatePattern(pattern string) error
	
	// Cache stats
	Stats() CacheStats
}

// CacheStats provides cache performance metrics
type CacheStats struct {
	Hits       int64     `json:"hits"`
	Misses     int64     `json:"misses"`
	Sets       int64     `json:"sets"`
	Deletes    int64     `json:"deletes"`
	Size       int64     `json:"size"`
	Keys       int64     `json:"keys"`
	HitRate    float64   `json:"hit_rate"`
	LastReset  time.Time `json:"last_reset"`
}

// CacheConfig holds cache configuration
type CacheConfig struct {
	Type             string        `json:"type"` // memory, redis, memcached
	DefaultTTL       time.Duration `json:"default_ttl"`
	MaxSize          int64         `json:"max_size"` // For memory cache
	EvictionPolicy   string        `json:"eviction_policy"` // LRU, LFU, FIFO
	
	// Redis config
	RedisAddr        string        `json:"redis_addr"`
	RedisPassword    string        `json:"redis_password"`
	RedisDB          int           `json:"redis_db"`
	RedisPoolSize    int           `json:"redis_pool_size"`
	
	// Memcached config
	MemcachedServers []string      `json:"memcached_servers"`
}

// CacheKeyBuilder helps build consistent cache keys
type CacheKeyBuilder struct {
	prefix string
}

func NewCacheKeyBuilder(prefix string) *CacheKeyBuilder {
	return &CacheKeyBuilder{prefix: prefix}
}

func (b *CacheKeyBuilder) ModelKey(modelID string) string {
	return b.prefix + ":model:" + modelID
}

func (b *CacheKeyBuilder) ConfigurationKey(configID string) string {
	return b.prefix + ":config:" + configID
}

func (b *CacheKeyBuilder) AvailableOptionsKey(configID string) string {
	return b.prefix + ":available:" + configID
}

func (b *CacheKeyBuilder) ValidationKey(configID string) string {
	return b.prefix + ":validation:" + configID
}

func (b *CacheKeyBuilder) UserConfigurationsKey(userID string) string {
	return b.prefix + ":user:configs:" + userID
}

func (b *CacheKeyBuilder) ModelListKey() string {
	return b.prefix + ":models:list"
}