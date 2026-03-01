'use client';

import { LazyImage } from '@/shared/blocks/common';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Logos({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const showTitle = section.title && !section.hide_title;
  const isScrolling = section.scrolling !== false; // Default to true for hero logos

  return (
    <section
      id={section.id}
      className={cn('py-8 md:py-12', section.className, className)}
    >
      <div className={`mx-auto max-w-7xl px-6`}>
        {showTitle && (
          <ScrollAnimation>
            <p className="text-md text-center font-medium">{section.title}</p>
          </ScrollAnimation>
        )}
        <ScrollAnimation delay={0.2}>
          {isScrolling ? (
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll gap-12 md:gap-16" style={{ width: 'max-content' }}>
                {/* First set */}
                <div className="flex shrink-0 items-center gap-12 md:gap-16">
                  {section.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex shrink-0 items-center justify-center"
                    >
                      <LazyImage
                        className="h-8 w-auto opacity-60 grayscale transition-opacity hover:opacity-100 hover:grayscale-0 dark:invert"
                        src={item.image?.src ?? ''}
                        alt={item.image?.alt ?? ''}
                      />
                    </div>
                  ))}
                </div>
                {/* Duplicate set for seamless loop */}
                <div className="flex shrink-0 items-center gap-12 md:gap-16">
                  {section.items?.map((item, idx) => (
                    <div
                      key={`duplicate-${idx}`}
                      className="flex shrink-0 items-center justify-center"
                    >
                      <LazyImage
                        className="h-8 w-auto opacity-60 grayscale transition-opacity hover:opacity-100 hover:grayscale-0 dark:invert"
                        src={item.image?.src ?? ''}
                        alt={item.image?.alt ?? ''}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
              {section.items?.map((item, idx) => (
                <LazyImage
                  key={idx}
                  className="h-8 w-fit dark:invert"
                  src={item.image?.src ?? ''}
                  alt={item.image?.alt ?? ''}
                />
              ))}
            </div>
          )}
        </ScrollAnimation>
      </div>
    </section>
  );
}
