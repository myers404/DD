// cache/factory.go
// Factory for creating cache repositories based on configuration

package cache

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// NewCacheRepository creates a cache repository based on configuration
func NewCacheRepository(config CacheConfig) (CacheRepository, error) {
	switch config.Type {
	case "memory", "":
		return NewMemoryCache("cpq", config.MaxSize), nil
		
	case "redis":
		// TODO: Implement Redis cache
		// return NewRedisCache(config.RedisAddr, config.RedisPassword, config.RedisDB), nil
		return nil, fmt.Errorf("redis cache not yet implemented")
		
	case "memcached":
		// TODO: Implement Memcached cache
		// return NewMemcachedCache(config.MemcachedServers...), nil
		return nil, fmt.Errorf("memcached cache not yet implemented")
		
	case "multi":
		// TODO: Implement multi-level cache
		// l1 := NewMemoryCache("cpq", config.MaxSize)
		// l2 := NewRedisCache(config.RedisAddr, config.RedisPassword, config.RedisDB)
		// return NewMultiLevelCache(l1, l2), nil
		return nil, fmt.Errorf("multi-level cache not yet implemented")
		
	default:
		return nil, fmt.Errorf("unknown cache type: %s", config.Type)
	}
}

// NewCacheConfig creates cache configuration from environment variables
func NewCacheConfig() CacheConfig {
	config := CacheConfig{
		Type:       getEnv("CACHE_TYPE", "memory"),
		DefaultTTL: getDurationEnv("CACHE_TTL", 1*time.Hour),
		MaxSize:    getInt64Env("CACHE_MAX_SIZE", 100*1024*1024), // 100MB default
		
		// Redis config
		RedisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getIntEnv("REDIS_DB", 0),
		RedisPoolSize: getIntEnv("REDIS_POOL_SIZE", 10),
		
		// Memcached config
		// MemcachedServers: strings.Split(getEnv("MEMCACHED_SERVERS", "localhost:11211"), ","),
	}
	
	return config
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getInt64Env(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intVal
		}
	}
	return defaultValue
}