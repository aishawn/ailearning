/**
 * Cache utilities for X Trending API
 */

import { createHash } from 'crypto';
import { readFile, writeFile, mkdir, stat, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { TrendingResponse } from './types';

const CACHE_DIR = process.env.X_TRENDING_CACHE_DIR || join(process.cwd(), '.cache', 'x-trending');
const ENABLE_CACHE = process.env.ENABLE_CACHE !== 'false';
const CACHE_TTL_HOURS = parseInt(process.env.CACHE_TTL_HOURS || '24', 10);

/**
 * Generate cache key from keywords, time_range, and sort_by
 */
export function generateCacheKey(
  keywords: string,
  time_range: string,
  sort_by: string
): string {
  // Normalize keywords: split by comma, trim, split by space, lowercase, deduplicate, sort
  const keywordParts: string[] = [];
  for (const part of keywords.split(',')) {
    const trimmed = part.trim();
    if (trimmed) {
      keywordParts.push(...trimmed.split(/\s+/).map(kw => kw.trim().toLowerCase()).filter(Boolean));
    }
  }
  
  const normalizedKeywords = Array.from(new Set(keywordParts)).sort().join(',');
  const normalizedTimeRange = time_range.toLowerCase().trim();
  const normalizedSortBy = sort_by.toLowerCase().trim();
  
  const cacheString = `${normalizedKeywords}|${normalizedTimeRange}|${normalizedSortBy}`;
  const cacheKey = createHash('md5').update(cacheString).digest('hex');
  
  return cacheKey;
}

/**
 * Get cache file path
 */
function getCacheFilePath(cacheKey: string): string {
  // Ensure cache directory exists
  if (!existsSync(CACHE_DIR)) {
    mkdir(CACHE_DIR, { recursive: true }).catch(() => {});
  }
  return join(CACHE_DIR, `${cacheKey}.json`);
}

/**
 * Check if cache file is valid (not expired)
 */
async function isCacheValid(cacheFile: string): Promise<boolean> {
  try {
    const stats = await stat(cacheFile);
    const age = Date.now() - stats.mtimeMs;
    const ttlMs = CACHE_TTL_HOURS * 60 * 60 * 1000;
    return age < ttlMs;
  } catch {
    return false;
  }
}

/**
 * Read cache data
 */
export async function readCache(cacheKey: string): Promise<TrendingResponse | null> {
  if (!ENABLE_CACHE) {
    return null;
  }
  
  const cacheFile = getCacheFilePath(cacheKey);
  
  if (!existsSync(cacheFile)) {
    return null;
  }
  
  if (!(await isCacheValid(cacheFile))) {
    // Delete expired cache
    try {
      await unlink(cacheFile);
    } catch {
      // Ignore errors
    }
    return null;
  }
  
  try {
    const content = await readFile(cacheFile, 'utf-8');
    const cacheData = JSON.parse(content) as { cached_at: string; data: TrendingResponse };
    
    if (!cacheData.data || !Array.isArray(cacheData.data.posts)) {
      // Invalid cache format, delete it
      await unlink(cacheFile).catch(() => {});
      return null;
    }
    
    return cacheData.data;
  } catch (error) {
    // Corrupted cache, delete it
    try {
      await unlink(cacheFile);
    } catch {
      // Ignore errors
    }
    return null;
  }
}

/**
 * Write cache data
 */
export async function writeCache(cacheKey: string, data: TrendingResponse): Promise<boolean> {
  if (!ENABLE_CACHE || !data || !data.posts || data.posts.length === 0) {
    return false;
  }
  
  try {
    const cacheFile = getCacheFilePath(cacheKey);
    const cacheData = {
      cached_at: new Date().toISOString(),
      data,
    };
    
    // Ensure directory exists
    await mkdir(CACHE_DIR, { recursive: true });
    
    // Write to temp file first, then rename (atomic operation)
    const tempFile = `${cacheFile}.tmp`;
    await writeFile(tempFile, JSON.stringify(cacheData, null, 2), 'utf-8');
    
    // Rename is atomic on most file systems
    const { rename } = await import('fs/promises');
    await rename(tempFile, cacheFile);
    
    return true;
  } catch (error) {
    console.error('Error writing cache:', error);
    return false;
  }
}

/**
 * Clean up expired cache files
 */
export async function cleanupExpiredCache(): Promise<number> {
  if (!ENABLE_CACHE || !existsSync(CACHE_DIR)) {
    return 0;
  }
  
  let cleanedCount = 0;
  
  try {
    const files = await readdir(CACHE_DIR);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = join(CACHE_DIR, file);
      if (!(await isCacheValid(filePath))) {
        try {
          await unlink(filePath);
          cleanedCount++;
        } catch {
          // Ignore errors
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
  
  return cleanedCount;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  cache_enabled: boolean;
  cache_dir?: string;
  total_files?: number;
  total_size_mb?: number;
  cache_ttl_hours?: number;
  error?: string;
}> {
  if (!ENABLE_CACHE) {
    return {
      cache_enabled: false,
      total_files: 0,
      total_size_mb: 0,
    };
  }
  
  try {
    if (!existsSync(CACHE_DIR)) {
      return {
        cache_enabled: true,
        cache_dir: CACHE_DIR,
        total_files: 0,
        total_size_mb: 0,
        cache_ttl_hours: CACHE_TTL_HOURS,
      };
    }
    
    const files = await readdir(CACHE_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    let totalSize = 0;
    for (const file of jsonFiles) {
      try {
        const stats = await stat(join(CACHE_DIR, file));
        totalSize += stats.size;
      } catch {
        // Ignore errors
      }
    }
    
    return {
      cache_enabled: true,
      cache_dir: CACHE_DIR,
      total_files: jsonFiles.length,
      total_size_mb: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
      cache_ttl_hours: CACHE_TTL_HOURS,
    };
  } catch (error) {
    return {
      cache_enabled: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


















