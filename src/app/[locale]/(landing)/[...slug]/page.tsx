import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import { getLocalPage } from '@/shared/models/post';

export const revalidate = 3600;

// Helper function to check if a route should be excluded from translation
function shouldExcludeRoute(slug: string | string[]): boolean {
  const slugStr = typeof slug === 'string' ? slug : slug.join('/');
  
  // Exclude system routes
  if (
    slugStr.startsWith('_') || // Next.js internal routes (_api, _layouts, etc.)
    slugStr.startsWith('acme-challenge') || // ACME challenge routes
    slugStr.includes('_vti_bin') || // SharePoint routes
    slugStr.includes(':') || // Routes with port numbers (e.g., :27018)
    /^\d+$/.test(slugStr) || // Pure numeric routes
    slugStr.includes('..') || // Invalid paths
    slugStr.startsWith('debug/') || // Debug routes
    slugStr === 'debug' // Debug root route
  ) {
    return true;
  }
  
  return false;
}

// Helper function to check if a slug contains invalid characters for translation keys
function isValidSlugForTranslation(slug: string): boolean {
  // Check for URL-encoded characters (like %24 for $, %26 for &)
  if (/%[0-9A-Fa-f]{2}/.test(slug)) {
    return false;
  }
  
  // Check for other invalid characters that shouldn't be in translation keys
  // Allow alphanumeric, dots, hyphens, underscores, and slashes
  if (!/^[a-zA-Z0-9._/-]+$/.test(slug)) {
    return false;
  }
  
  return true;
}

// dynamic page metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // Exclude system routes and invalid routes
  if (shouldExcludeRoute(slug)) {
    return {
      title: '',
      description: '',
    };
  }

  // metadata values
  let title = '';
  let description = '';
  let canonicalUrl = '';

  // 1. try to get static page metadata from
  // content/pages/**/*.mdx

  // static page slug
  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  // filter invalid slug
  if (staticPageSlug.includes('.')) {
    return;
  }

  // build canonical url
  canonicalUrl =
    locale !== envConfigs.locale
      ? `${envConfigs.app_url}/${locale}/${staticPageSlug}`
      : `${envConfigs.app_url}/${staticPageSlug}`;

  // get static page content
  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  // return static page metadata
  if (staticPage) {
    title = staticPage.title || '';
    description = staticPage.description || '';

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  // 2. static page not found, try to get dynamic page metadata from
  // src/config/locale/messages/{locale}/pages/**/*.json

  // dynamic page slug
  const dynamicPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  // Validate slug before using it as a translation key
  if (!isValidSlugForTranslation(dynamicPageSlug)) {
    // Invalid slug, fall through to common metadata
  } else {
    const messageKey = `pages.${dynamicPageSlug}`;
    
    try {
      const t = await getTranslations({ locale, namespace: messageKey });

      // return dynamic page metadata
      if (t.has('metadata')) {
        title = t.raw('metadata.title');
        description = t.raw('metadata.description');

        return {
          title,
          description,
          alternates: {
            canonical: canonicalUrl,
          },
        };
      }
    } catch (error) {
      // Translation not found, fall through to common metadata
    }
  }

  // 3. return common metadata
  const tc = await getTranslations('common.metadata');

  title = tc('title');
  description = tc('description');

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Exclude system routes and invalid routes
  if (shouldExcludeRoute(slug)) {
    return notFound();
  }

  // 1. try to get static page from
  // content/pages/**/*.mdx

  // static page slug
  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  // filter invalid slug
  if (staticPageSlug.includes('.')) {
    return notFound();
  }

  // get static page content
  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  // return static page
  if (staticPage) {
    const Page = await getThemePage('static-page');

    return <Page locale={locale} post={staticPage} />;
  }

  // 2. static page not found
  // try to get dynamic page content from
  // src/config/locale/messages/{locale}/pages/**/*.json

  // dynamic page slug
  const dynamicPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  // Validate slug before using it as a translation key
  if (!isValidSlugForTranslation(dynamicPageSlug)) {
    // Invalid slug, return not found
    return notFound();
  }

  const messageKey = `pages.${dynamicPageSlug}`;

  try {
    const t = await getTranslations({ locale, namespace: messageKey });

    // return dynamic page
    if (t.has('page')) {
      const Page = await getThemePage('dynamic-page');
      return <Page locale={locale} page={t.raw('page')} />;
    }
  } catch (error) {
    // ignore error if translation not found
    return notFound();
  }

  // 3. page not found
  return notFound();
}
