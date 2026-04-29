/**
 * 简单数据缓存 Hook
 * 用于减少重复 API 请求
 */
import { useCallback, useRef } from 'react'

// 全局缓存实例
interface CacheEntry<T> {
  data: T
  timestamp: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private ttl: number // 缓存过期时间（毫秒）

  constructor(ttlMs: number = 5 * 60 * 1000) { // 默认 5 分钟
    this.ttl = ttlMs
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // 清除单个缓存
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  // 按前缀清除缓存
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  // 清除所有缓存
  clear(): void {
    this.cache.clear()
  }
}

// 全局缓存实例
export const dataCache = new DataCache(5 * 60 * 1000) // 5分钟

export function useDataCache() {
  const cacheRef = useRef(dataCache)

  const getCached = useCallback(<T,>(key: string): T | null => {
    return cacheRef.current.get<T>(key)
  }, [])

  const setCache = useCallback(<T,>(key: string, data: T): void => {
    cacheRef.current.set(key, data)
  }, [])

  const invalidate = useCallback((key: string): void => {
    cacheRef.current.invalidate(key)
  }, [])

  const invalidatePattern = useCallback((pattern: string): void => {
    cacheRef.current.invalidatePattern(pattern)
  }, [])

  const clearAll = useCallback((): void => {
    cacheRef.current.clear()
  }, [])

  return { getCached, setCache, invalidate, invalidatePattern, clearAll }
}

// 缓存键常量
export const CACHE_KEYS = {
  DASHBOARD: 'dashboard_data',
  GOALS: 'goals',
  WORKOUTS: 'workouts',
  BODY_MEASUREMENTS: 'body_measurements',
}
