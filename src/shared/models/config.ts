import { envConfigs } from '@/config';
import { config } from '@/config/db/schema';
import {
  getAllSettingNames,
  publicSettingNames,
} from '@/shared/services/settings';

export type Config = typeof config.$inferSelect;
export type NewConfig = typeof config.$inferInsert;
export type UpdateConfig = Partial<Omit<NewConfig, 'name'>>;

export type Configs = Record<string, string>;

export const CACHE_TAG_CONFIGS = 'configs';

// Lazy load server-side cache functions to avoid bundling in client components
let getConfigsCache: (() => Promise<Configs>) | null = null;

async function getConfigsImpl(): Promise<Configs> {
  const configs: Record<string, string> = {};

  if (!envConfigs.database_url) {
    return configs;
  }

  // Dynamic import to avoid bundling database code in client components
  const { db } = await import('@/core/db');
  const result = await db().select().from(config);
  if (!result) {
    return configs;
  }

  for (const config of result) {
    configs[config.name] = config.value ?? '';
  }

  return configs;
}

export async function getConfigs(): Promise<Configs> {
  // Only use cache on server side
  if (typeof window === 'undefined') {
    if (!getConfigsCache) {
      const { unstable_cache } = await import('next/cache');
      getConfigsCache = unstable_cache(
        getConfigsImpl,
        ['configs'],
        {
          revalidate: 3600,
          tags: [CACHE_TAG_CONFIGS],
        }
      );
    }
    return getConfigsCache();
  }
  // On client side, just return empty configs (shouldn't be called anyway)
  return {};
}

export async function saveConfigs(configs: Record<string, string>) {
  // Dynamic import to avoid bundling database code in client components
  const { db } = await import('@/core/db');
  const result = await db().transaction(async (tx: any) => {
    const configEntries = Object.entries(configs);
    const results: any[] = [];

    for (const [name, configValue] of configEntries) {
      const [upsertResult] = await tx
        .insert(config)
        .values({ name, value: configValue })
        .onConflictDoUpdate({
          target: config.name,
          set: { value: configValue },
        })
        .returning();

      results.push(upsertResult);
    }

    return results;
  });

  // Only revalidate on server side
  if (typeof window === 'undefined') {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(CACHE_TAG_CONFIGS, 'max');
  }

  return result;
}

export async function addConfig(newConfig: NewConfig) {
  // Dynamic import to avoid bundling database code in client components
  const { db } = await import('@/core/db');
  const [result] = await db().insert(config).values(newConfig).returning();
  
  // Only revalidate on server side
  if (typeof window === 'undefined') {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(CACHE_TAG_CONFIGS, 'max');
  }

  return result;
}

export async function getAllConfigs(): Promise<Configs> {
  let dbConfigs: Configs = {};

  // only get configs from db in server side
  if (typeof window === 'undefined' && envConfigs.database_url) {
    try {
      dbConfigs = await getConfigs();
    } catch (e) {
      console.log(`get configs from db failed:`, e);
      dbConfigs = {};
    }
  }

  const settingNames = await getAllSettingNames();
  settingNames.forEach((key) => {
    const upperKey = key.toUpperCase();
    // use env configs if available
    if (process.env[upperKey]) {
      dbConfigs[key] = process.env[upperKey] ?? '';
    } else if (process.env[key]) {
      dbConfigs[key] = process.env[key] ?? '';
    }
  });

  // Environment variable mappings for R2 (support common naming conventions)
  // Map R2_ACCESS_KEY_ID -> r2_access_key
  if (!dbConfigs.r2_access_key && process.env.R2_ACCESS_KEY_ID) {
    dbConfigs.r2_access_key = process.env.R2_ACCESS_KEY_ID;
  }
  // Map R2_SECRET_ACCESS_KEY -> r2_secret_key
  if (!dbConfigs.r2_secret_key && process.env.R2_SECRET_ACCESS_KEY) {
    dbConfigs.r2_secret_key = process.env.R2_SECRET_ACCESS_KEY;
  }
  // Map R2_BUCKET -> r2_bucket_name
  if (!dbConfigs.r2_bucket_name && process.env.R2_BUCKET) {
    dbConfigs.r2_bucket_name = process.env.R2_BUCKET;
  }
  // Map R2_ACCOUNT_ID -> r2_account_id
  if (!dbConfigs.r2_account_id && process.env.R2_ACCOUNT_ID) {
    dbConfigs.r2_account_id = process.env.R2_ACCOUNT_ID;
  }
  // Map STORAGE_DOMAIN -> r2_domain
  if (!dbConfigs.r2_domain && process.env.STORAGE_DOMAIN) {
    dbConfigs.r2_domain = process.env.STORAGE_DOMAIN;
  }

  const configs = {
    ...envConfigs,
    ...dbConfigs,
  };

  return configs;
}

export async function getPublicConfigs(): Promise<Configs> {
  let allConfigs = await getAllConfigs();

  const publicConfigs: Record<string, string> = {};

  // get public configs
  for (const key in allConfigs) {
    if (publicSettingNames.includes(key)) {
      publicConfigs[key] = String(allConfigs[key]);
    }
  }

  const configs = {
    ...publicConfigs,
  };

  return configs;
}
