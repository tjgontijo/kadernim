/**
 * Sistema de cache simples para otimizar requisições
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const cache = new SimpleCache();

/**
 * Fetch com cache automático
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & { cacheTime?: number }
): Promise<T> {
  const cacheKey = `fetch:${url}`;
  const cacheTime = options?.cacheTime ?? 5 * 60 * 1000; // 5 minutos padrão
  
  // Tentar cache primeiro
  const cached = cache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fazer requisição
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  // Salvar no cache
  cache.set(cacheKey, data, cacheTime);
  
  return data;
}
