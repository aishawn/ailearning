'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/shared/components/ui/dialog';
import { Highlighter } from '@/shared/components/ui/highlighter';
import { cn } from '@/shared/lib/utils';
import type { Hero as HeroType, Section } from '@/shared/types/blocks/landing';

import { SocialAvatars } from './social-avatars';
import { Logos } from './logos';
import SimplePartnerShowcase from './SimplePartnerShowcase';
import TestimonialsSection from './TestimonialsSection';

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Animated Counter Component
function AnimatedCounter({ targetNumber = 150 }: { targetNumber?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  // Numbers to cycle through based on the HTML (in reverse order for animation)
  const numbers = [0, 10, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < numbers.length - 1) {
        index++;
        setCurrentIndex(index);
      } else {
        clearInterval(interval);
      }
    }, 100); // Adjust speed as needed

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div ref={counterRef} className="relative h-5 overflow-hidden">
      <div
        className="transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(-${currentIndex * 100}%)`,
        }}
      >
        {numbers.map((num, idx) => (
          <div key={idx} className="h-5 flex items-center justify-center font-semibold text-foreground leading-none">
            {num === 150 ? '150+' : num}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const locale = useLocale();
  const indexTextT = useTranslations('pages.index');
  
  // Get raw translation data for TestimonialsSection
  const pageData = indexTextT.raw('page') as any;
  const testimonialsItems = pageData?.sections?.testimonials?.items || [];
  const indexText = {
    testimonials: testimonialsItems,
    testimonialsTitle: pageData?.sections?.testimonials?.title,
    testimonialsDescription: pageData?.sections?.testimonials?.description,
  };
  
  const highlightText = section.highlight_text ?? '';
  let texts = null;
  if (highlightText) {
    texts = section.title?.split(highlightText, 2);
  }

  // When knowledge_graph is set (content site), show graph instead of video
  const heroSection = section as HeroType;
  const hasKnowledgeGraph = !!heroSection.knowledge_graph?.nodes?.length;
  const localVideoPath = '/video/AdsGency2.mp4';
  const hasVideo = !hasKnowledgeGraph && true; // Temporarily always show video when no graph
  const hasImage = !!(section.image?.src || section.image_invert?.src);

  return (
    <section
      id={section.id}
      className={cn(
        'relative flex flex-col',
        // fill viewport minus navbar (~64px), center content vertically
        'min-h-[calc(100vh-64px)]',
        section.className,
        className
      )}
    >
      {/* ── Background: radial glow + subtle grid ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* primary glow — right side, aligned with cards */}
        <div className="absolute right-[-10%] top-[-5%] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        {/* secondary glow — bottom left */}
        <div className="absolute left-[-5%] bottom-[10%] h-[400px] w-[400px] rounded-full bg-sky-600/8 blur-[100px]" />
        {/* subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Announcement banner ── */}
      {section.announcement && (
        <div className="relative z-10 flex justify-center pt-6">
          <Link
            href={section.announcement.url || ''}
            target={section.announcement.target || '_self'}
            className="hover:bg-background dark:hover:border-t-border bg-muted group flex w-fit items-center gap-3 rounded-full border p-1 pl-4 shadow-sm transition-colors duration-300"
          >
            <span className="text-foreground text-sm">{section.announcement.title}</span>
            <span className="block h-4 w-px bg-border" />
            <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
              <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                <span className="flex size-6"><ArrowRight className="m-auto size-3" /></span>
                <span className="flex size-6"><ArrowRight className="m-auto size-3" /></span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Hero body — vertically centered ── */}
      <div className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-0">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20">

            {/* ── LEFT ── */}
            <div className="flex-1 min-w-0 text-center lg:text-left">
              {/* overline label */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <span className="size-1.5 rounded-full bg-violet-400" />
                {(heroSection as any).label || 'Research Hub'}
              </div>

              {/* headline */}
              {texts && texts.length > 0 ? (
                <h1 className="text-foreground text-[2.75rem] font-bold tracking-tight leading-[1.12] text-balance sm:text-[3.25rem] lg:text-[3.5rem]">
                  {texts[0]}
                  <Highlighter action="underline" color="#6366F1">
                    {highlightText}
                  </Highlighter>
                  {texts[1]}
                </h1>
              ) : (
                <h1 className="text-foreground text-[2.75rem] font-bold tracking-tight leading-[1.12] text-balance sm:text-[3.25rem] lg:text-[3.5rem]">
                  {section.title}
                </h1>
              )}

              {/* description */}
              <p
                className="text-muted-foreground mt-5 mb-8 text-base leading-relaxed max-w-sm mx-auto lg:mx-0"
                dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
              />

              {/* CTA */}
              {section.buttons && section.buttons.length > 0 && (
                <div className="flex items-center justify-center gap-3 lg:justify-start">
                  {section.buttons.slice(0, 1).map((button, idx) => (
                    <Button
                      asChild
                      size="default"
                      key={idx}
                      className="h-10 rounded-lg px-5 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
                    >
                      <Link href={button.url ?? ''} target={button.target ?? '_self'} className="inline-flex items-center gap-2">
                        {button.title}
                        <SmartIcon name="ArrowRight" className="size-3.5" />
                      </Link>
                    </Button>
                  ))}
                </div>
              )}

              {section.tip && (
                <p
                  className="text-muted-foreground mt-5 block text-xs"
                  dangerouslySetInnerHTML={{ __html: section.tip ?? '' }}
                />
              )}

              {section.show_avatars && (
                <div className="mt-6 flex justify-center lg:justify-start">
                  <SocialAvatars tip={section.avatars_tip || ''} />
                </div>
              )}
            </div>

            {/* ── RIGHT: topic cards ── */}
            <div className="w-full lg:w-[360px] shrink-0">
              {heroSection.knowledge_graph?.nodes?.length ? (() => {
                const palette = [
                  {
                    badge: 'bg-violet-500/12 text-violet-300 border-violet-500/20',
                    glow:  'before:bg-violet-500/5',
                    hover: 'hover:border-violet-500/25 hover:bg-violet-500/5',
                  },
                  {
                    badge: 'bg-sky-500/12 text-sky-300 border-sky-500/20',
                    glow:  'before:bg-sky-500/5',
                    hover: 'hover:border-sky-500/25 hover:bg-sky-500/5',
                  },
                  {
                    badge: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/20',
                    glow:  'before:bg-emerald-500/5',
                    hover: 'hover:border-emerald-500/25 hover:bg-emerald-500/5',
                  },
                ];
                return (
                  <nav className="flex flex-col gap-3" aria-label={heroSection.knowledge_graph!.title ?? 'Topics'}>
                    {heroSection.knowledge_graph!.nodes.slice(0, 3).map((node, i) => {
                      const p = palette[i % palette.length];
                      return (
                        <Link
                          key={node.id ?? node.url}
                          href={node.url}
                          className={cn(
                            'group relative flex items-start gap-4 rounded-2xl border border-border/40 bg-card/30 px-5 py-5',
                            'transition-all duration-200 no-underline backdrop-blur-sm',
                            p.hover
                          )}
                        >
                          {/* badge */}
                          <span className={cn(
                            'mt-0.5 inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase',
                            p.badge
                          )}>
                            {node.title}
                          </span>

                          {/* text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {node.description}
                            </p>
                          </div>

                          {/* arrow */}
                          <SmartIcon
                            name="ArrowRight"
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground/25 group-hover:text-foreground/60 group-hover:translate-x-0.5 transition-all duration-200"
                          />
                        </Link>
                      );
                    })}
                  </nav>
                );
              })() : hasVideo ? (
              <>
                <div 
                  className="relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] overflow-hidden rounded-lg border border-border/50 shadow-lg cursor-pointer group flex items-center justify-center bg-muted/50"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <video
                    src={localVideoPath}
                    poster="/Frame-2085665171_1.avif"
                    className="w-full h-auto max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors pointer-events-none">
                    <div className="flex items-center justify-center size-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="size-10 text-black ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                {/* Video Dialog */}
                <Dialog open={isVideoOpen} onOpenChange={(open) => {
                  setIsVideoOpen(open);
                  if (!open && videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.currentTime = 0;
                  }
                }}>
                  <DialogContent className="!max-w-[98vw] sm:!max-w-[98vw] md:!max-w-[95vw] lg:!max-w-[90vw] xl:!max-w-7xl w-[98vw] h-auto p-0 bg-black border-0">
                    <div className="relative aspect-video w-full">
                      <video
                        ref={videoRef}
                        src={localVideoPath}
                        className="h-full w-full rounded-lg"
                        controls
                        autoPlay
                        playsInline
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : hasImage ? (
              <div className="border-foreground/10 relative border-y">
                <div className="relative z-10 mx-auto max-w-6xl border-x px-3">
                  <div className="border-x">
                    <div
                      aria-hidden
                      className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
                    />
                    {section.image_invert?.src && (
                      <Image
                        className="border-border/25 relative z-2 hidden w-full border dark:block"
                        src={section.image_invert.src}
                        alt={section.image_invert.alt || section.image?.alt || ''}
                        width={
                          section.image_invert.width || section.image?.width || 1200
                        }
                        height={
                          section.image_invert.height || section.image?.height || 630
                        }
                        sizes="(max-width: 768px) 100vw, 1200px"
                        loading="lazy"
                        fetchPriority="high"
                        quality={75}
                        unoptimized={section.image_invert.src.startsWith('http')}
                      />
                    )}
                    {section.image?.src && (
                      <Image
                        className="border-border/25 relative z-2 block w-full border dark:hidden"
                        src={section.image.src}
                        alt={section.image.alt || section.image_invert?.alt || ''}
                        width={
                          section.image.width || section.image_invert?.width || 1200
                        }
                        height={
                          section.image.height || section.image_invert?.height || 630
                        }
                        sizes="(max-width: 768px) 100vw, 1200px"
                        loading="lazy"
                        fetchPriority="high"
                        quality={75}
                        unoptimized={section.image.src.startsWith('http')}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            </div>

          </div>{/* flex row end */}
        </div>{/* max-w container end */}
      </div>{/* flex-1 center wrapper end */}

      {/* Logos / Partner showcase: hide when hero shows knowledge graph (content site) */}
      {!hasKnowledgeGraph && (
        <div className="relative z-10 mt-auto pb-8">
          <SimplePartnerShowcase locale={locale} />
        </div>
      )}
      {/* {section.background_image?.src && (
        <div className="absolute inset-0 -z-10 hidden h-full w-full overflow-hidden md:block">
          <div className="from-background/80 via-background/80 to-background absolute inset-0 z-10 bg-gradient-to-b" />
          <Image
            src={section.background_image.src}
            alt={section.background_image.alt || ''}
            className="object-cover opacity-60 blur-[0px]"
            fill
            loading="lazy"
            sizes="(max-width: 768px) 0vw, 100vw"
            quality={70}
            unoptimized={section.background_image.src.startsWith('http')}
          />
        </div>
      )} */}
      
      {/* Testimonials Section - Only show if show_testimonials is true */}
      {section.show_testimonials && (
        <div className="mt-20 md:mt-32">
          <TestimonialsSection 
            locale={locale} 
            indexText={indexText}
          />
        </div>
      )}
    </section>
  );
}
