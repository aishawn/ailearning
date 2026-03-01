import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getMetadata } from '@/shared/lib/seo';
import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.affiliate.metadata',
  canonicalUrl: '/affiliate',
});

export default async function AffiliatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'pages.affiliate' });
  const page = t.raw('page') as any;
  const hero = page.sections?.hero;
  const stats = page.sections?.stats;
  const usage = page.sections?.usage;
  const faq = page.sections?.faq;
  const cta = page.sections?.cta;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {hero?.title?.split(hero.highlight_text || 'earn cash').map((part: string, idx: number) => (
                <span key={idx}>
                  {part}
                  {idx === 0 && hero.highlight_text && (
                    <span className="text-primary">{hero.highlight_text}</span>
                  )}
                </span>
              ))}
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

      {/* Stats/Payout Section - Reference Atria's design */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center space-y-8">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  {stats?.title || 'Your Payout'}
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-6xl md:text-7xl font-bold text-muted-foreground/30">/</span>
                  <div className="text-6xl md:text-7xl font-bold">15,000</div>
                </div>
                <p className="text-lg text-muted-foreground">100 referrals</p>
              </div>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {stats?.description}
              </p>
              {stats?.items && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  {stats.items.map((item: any, idx: number) => (
                    <div key={idx} className="text-center">
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        {item.title}
                      </div>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How does it work Section */}
      {usage && (
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center space-y-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {usage.title}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {usage.description}
                </p>
              </div>
              {usage.items && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  {usage.items.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-bold mx-auto">
                        {idx + 1}
                      </div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faq && faq.items && faq.items.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {faq.title}
                </h2>
                {faq.description && (
                  <p className="text-lg text-muted-foreground">
                    {faq.description}
                  </p>
                )}
              </div>
              <Accordion type="single" collapsible className="space-y-4">
                {faq.items.map((item: any, idx: number) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${idx}`}
                    className="bg-background rounded-lg border px-6"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pt-2">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {cta && (
        <section className={cn('py-16 md:py-24', cta.className)}>
          <div className="container">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                {cta.title}
              </h2>
              {cta.description && (
                <p className="text-lg text-muted-foreground">
                  {cta.description}
                </p>
              )}
              {cta.buttons && cta.buttons.length > 0 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  {cta.buttons.map((button: any, idx: number) => (
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
      )}
    </div>
  );
}

