/**
 * Sistema de cache para navegação otimizada
 * Mantém dados em memória para navegação mais rápida
 */

interface NavigationCacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class NavigationCache {
  private cache = new Map<string, NavigationCacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    const now = Date.now();
    
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Instância global do cache
export const navigationCache = new NavigationCache();

// Limpar cache expirado a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    navigationCache.cleanup();
  }, 5 * 60 * 1000);
}

// Chaves de cache padronizadas
export const CACHE_KEYS = {
  RESOURCES_LIST: (params: string) => `resources:list:${params}`,
  RESOURCE_DETAIL: (id: string) => `resource:detail:${id}`,
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  SUBJECTS: 'subjects:list',
  EDUCATION_LEVELS: 'education-levels:list',
} as const;