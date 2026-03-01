import { envConfigs } from '..';

export const localeNames: any = {
  en: 'English',
  zh: '中文',
};

export const locales = ['en', 'zh'];

export const defaultLocale = envConfigs.locale;

export const localePrefix = 'as-needed';

export const localeDetection = false;

export const localeMessagesRootPath = '@/config/locale/messages';

export const localeMessagesPaths = [
  'common',
  'landing',
  'settings/sidebar',
  'settings/profile',
  'settings/security',
  'settings/billing',
  'settings/payments',
  'settings/credits',
  'settings/apikeys',
  'admin/sidebar',
  'admin/users',
  'admin/roles',
  'admin/permissions',
  'admin/categories',
  'admin/posts',
  'admin/payments',
  'admin/subscriptions',
  'admin/credits',
  'admin/settings',
  'admin/apikeys',
  'admin/ai-tasks',
  'admin/chats',
  'admin/docs',
  'ai/music',
  'ai/chat',
  'ai/image',
  'ai/video',
  'activity/sidebar',
  'activity/ai-tasks',
  'activity/chats',
  'pages/index',
  'pages/pricing',
  'pages/showcases',
  'pages/blog',
  'pages/updates',
  'pages/affiliate',
  'pages/careers',
  'pages/request-demo',
  'pages/feedback',
  'pages/about-us',
  'pages/style-guide',
  'pages/use-cases/seo',
  'pages/use-cases/social-media',
  'pages/use-cases/email-marketing',
  'pages/use-cases/infographics',
  'pages/alternatives/motion',
  'pages/alternatives/facebook-ads-manager',
  'pages/alternatives/tiktok-creative-center',
  'pages/alternatives/adcreative',
  'pages/alternatives/adplexity',
  'pages/alternatives/dropispy',
  'pages/alternatives/foreplay',
  'pages/alternatives/bigspy',
  'pages/alternatives/pipiads',
  'pages/alternatives/powerad-spy',
  'pages/wp-admin',
  'pages/login',
  'pages/ai/notify/fal',
  'pages/v2/api-docs',
  'pages/v3/api-docs',
  'pages/actuator/env',
  'pages/server',
  'pages/about',
  'pages/debug/default/view',
  'pages/v2/_catalog',
  'pages/server-status',
  'pages/config',
  'pages/telescope/requests',
];
