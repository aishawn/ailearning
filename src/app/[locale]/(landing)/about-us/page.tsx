import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getMetadata } from '@/shared/lib/seo';
import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.about-us.metadata',
  canonicalUrl: '/about-us',
});

export default async function AboutUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'pages.about-us' });
  const page = t.raw('page') as any;
  const hero = page.sections?.hero;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {hero?.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {hero?.description}
            </p>
            {hero?.buttons && hero.buttons.length > 0 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                {hero.buttons.map((button: any, idx: number) => (
                  <Button
                    key={idx}
                    asChild
                    size="lg"
                    className="text-lg px-8 py-6 rounded-full"
                  >
                    <Link href={button.url || '#'} target={button.target || '_self'}>
                      {button.icon && (
                        <SmartIcon name={button.icon} className="mr-2 h-5 w-5" />
                      )}
                      {button.title}
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

