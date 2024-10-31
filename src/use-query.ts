import { useState, useEffect, useCallback } from "react";

// Types for query key structure
type QueryKey = readonly unknown[];

// Types for hook options
interface QueryOptions {
  refetchInterval?: number;
  staleTime?: number;
}

// Types for hook return value
interface QueryResult<TData> {
  data: TData | null;
  isLoading: boolean;
  isStale: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
  setData: (data: TData) => void;
}

// Cache entry structure
class CacheEntry<TData> {
  data: TData | null;
  timestamp: number;
  staleTime: number;
  subscribers: Set<() => void>;
  isLoading: boolean;
  error: Error | null;

  constructor(data: TData | null, timestamp: number, staleTime: number = 5 * 60 * 1000) {
    this.data = data;
    this.timestamp = timestamp;
    this.staleTime = staleTime;
    this.subscribers = new Set();
    this.isLoading = false;
    this.error = null;
  }

  isStale(): boolean {
    return Date.now() - this.timestamp > this.staleTime;
  }

  notify(): void {
    this.subscribers.forEach((subscriber) => subscriber());
  }
}

// Global cache store with type safety
const queryCache = new Map<string, CacheEntry<unknown>>();

// Helper to get typed cache entry
function getTypedCacheEntry<TData>(key: string): CacheEntry<TData> {
  return queryCache.get(key) as CacheEntry<TData>;
}

// Main hook with generic type parameter
export function useQuery<TData>(
  queryKey: QueryKey,
  fetchFn: () => Promise<TData>,
  options: QueryOptions = {}
): QueryResult<TData> {
  const [, forceRender] = useState({});
  const stringifiedKey = JSON.stringify(queryKey);

  // Get or create cache entry with proper typing
  const getCacheEntry = useCallback((): CacheEntry<TData> => {
    if (!queryCache.has(stringifiedKey)) {
      queryCache.set(
        stringifiedKey,
        new CacheEntry<TData>(null, 0, options.staleTime)
      );
    }
    return getTypedCacheEntry<TData>(stringifiedKey);
  }, [stringifiedKey, options.staleTime]);

  // Subscribe to cache updates
  useEffect(() => {
    const entry = getCacheEntry();
    const subscriber = () => forceRender({});
    entry.subscribers.add(subscriber);
    return () => {
      entry.subscribers.delete(subscriber);
    };
  }, [getCacheEntry]);

  // Fetch data with error handling
  const fetchData = useCallback(async (): Promise<void> => {
    const entry = getCacheEntry();
    entry.isLoading = true;
    entry.error = null;
    entry.notify();
    
    try {
      const data = await fetchFn();
      entry.data = data;
      entry.timestamp = Date.now();
    } catch (error) {
      entry.error = error instanceof Error ? error : new Error(String(error));
      console.error("Query error:", error);
    } finally {
      entry.isLoading = false;
      entry.notify();
    }
  }, [fetchFn, getCacheEntry]);

  // Initial fetch and background updates
  useEffect(() => {
    let isMounted = true;
    const entry = getCacheEntry();

    const performFetch = async () => {
      if (entry.isLoading || !isMounted) return;
      
      if (!entry.data || entry.isStale()) {
        await fetchData();
      }
    };

    performFetch();

    // Set up background refetch interval if specified
    let intervalId: NodeJS.Timeout | undefined;
    if (options.refetchInterval) {
      intervalId = setInterval(() => {
        if (entry.isStale() && !entry.isLoading) {
          performFetch();
        }
      }, options.refetchInterval);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [stringifiedKey, getCacheEntry, fetchData, options.refetchInterval]);

  const entry = getCacheEntry();

  return {
    data: entry.data,
    isLoading: entry.isLoading,
    isStale: entry.isStale(),
    error: entry.error,
    refetch: fetchData,
    invalidate: useCallback(() => {
      const entry = getCacheEntry();
      entry.timestamp = 0;
      fetchData();
    }, [getCacheEntry, fetchData]),
    setData: useCallback(
      (newData: TData) => {
        const entry = getCacheEntry();
        entry.data = newData;
        entry.timestamp = Date.now();
        entry.notify();
      },
      [getCacheEntry]
    ),
  };
}
