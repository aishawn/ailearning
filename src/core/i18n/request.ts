import { getRequestConfig } from 'next-intl/server';

import {
  defaultLocale,
  localeMessagesPaths,
  localeMessagesRootPath,
} from '@/config/locale';

import { routing } from './config';

export async function loadMessages(
  path: string,
  locale: string = defaultLocale
) {
  try {
    // try to load locale messages
    const messages = await import(
      `@/config/locale/messages/${locale}/${path}.json`
    );
    return messages.default || {};
  } catch (e) {
    try {
      // try to load default locale messages
      const messages = await import(
        `@/config/locale/messages/${defaultLocale}/${path}.json`
      );
      return messages.default || {};
    } catch (err: any) {
      // if default locale is not found, return empty object
      // Only log error if it's not a MODULE_NOT_FOUND error (which is expected for optional files)
      if (err?.code !== 'MODULE_NOT_FOUND') {
        console.error(`Failed to load messages for path: ${path}, locale: ${locale}, error:`, err);
      }
      return {};
    }
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as string)) {
    locale = routing.defaultLocale;
  }

  if (['zh-CN'].includes(locale)) {
    locale = 'zh';
  }

  try {
    // load all local messages
    const allMessages = await Promise.all(
      localeMessagesPaths.map((path) => loadMessages(path, locale))
    );

    // merge all local messages
    const messages: any = {};

    localeMessagesPaths.forEach((path, index) => {
      const localMessages = allMessages[index];

      // Ensure messages is always an object, even if loading failed
      const messagesToMerge = localMessages && typeof localMessages === 'object' && Object.keys(localMessages).length > 0
        ? localMessages
        : (() => {
            // Only log warning in development to reduce noise in production
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Failed to load messages for path: ${path}, locale: ${locale}. Using empty object as fallback.`);
            }
            return {};
          })();

      const keys = path.split('/');
      let current = messages;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = messagesToMerge;
    });

    return {
      locale,
      messages,
    };
  } catch (e) {
    console.error('Failed to load all messages, error:', e);
    // Return empty messages object as fallback
    return {
      locale: defaultLocale,
      messages: {},
    };
  }
});
