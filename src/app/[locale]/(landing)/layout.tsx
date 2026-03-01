import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { getThemeLayout } from '@/core/theme';
import { LocaleDetector, TopBanner } from '@/shared/blocks/common';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

export default async function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // load page data
  let header: HeaderType | null = null;
  let footer: FooterType | null = null;

  try {
    const t = await getTranslations('landing');
    header = t.raw('header') as HeaderType;
    footer = t.raw('footer') as FooterType;
  } catch (error) {
    console.error('Failed to load landing translations:', error);
    
    // Use minimal valid objects as fallback
    header = {
      id: 'header',
      nav: { items: [] },
      buttons: [],
      show_sign: true,
      show_theme: true,
      show_locale: true,
    } as HeaderType;
    footer = {
      id: 'footer',
      nav: { items: [] },
      show_theme: true,
      show_locale: true,
    } as FooterType;
  }

  // load layout component
  const Layout = await getThemeLayout('landing');

  return (
    <Layout header={header} footer={footer}>
      <LocaleDetector />
      {/* {header.topbanner && header.topbanner.text && (
        <TopBanner
          id="topbanner"
          text={header.topbanner?.text}
          buttonText={header.topbanner?.buttonText}
          href={header.topbanner?.href}
          target={header.topbanner?.target}
          closable
          rememberDismiss
          dismissedExpiryDays={header.topbanner?.dismissedExpiryDays ?? 1}
        />
      )} */}
      {children}
    </Layout>
  );
}
