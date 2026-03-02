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
import { PartnerShowcases } from './PartnerShowcase';
import TestimonialsSection from './TestimonialsSection';
import { KnowledgeGraph } from './knowledge-graph';

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
        `pt-24 pb-8 md:pt-36 md:pb-16`,
        section.className,
        className
      )}
    >
      {section.announcement && (
        <Link
          href={section.announcement.url || ''}
          target={section.announcement.target || '_self'}
          className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto mb-8 flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
        >
          <span className="text-foreground text-sm">
            {section.announcement.title}
          </span>
          <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

          <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
              <span className="flex size-6">
                <ArrowRight className="m-auto size-3" />
              </span>
              <span className="flex size-6">
                <ArrowRight className="m-auto size-3" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Hero Content - Left/Right Layout */}
      <div className="container mx-auto px-4 mb-16 md:mb-24 max-w-none">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-12">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left py-8 md:py-12">
            {texts && texts.length > 0 ? (
              <h1 className="text-foreground text-4xl font-semibold text-balance sm:text-5xl lg:text-6xl">
                {texts[0]}
                <Highlighter action="underline" color="#6366F1">
                  {highlightText}
                </Highlighter>
                {texts[1]}
              </h1>
            ) : (
              <h1 className="text-foreground text-4xl font-semibold text-balance sm:text-5xl lg:text-6xl">
                {section.title}
              </h1>
            )}

            <p
              className="text-muted-foreground mt-6 mb-8 text-lg text-balance"
              dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
            />

            {section.buttons && (
              <div className="flex items-center justify-center gap-4 lg:justify-start">
                {section.buttons.map((button, idx) => (
                  <Button
                    asChild
                    size={button.size || 'default'}
                    variant={button.variant || 'default'}
                    className={cn(
                      'px-4 text-sm rounded-full',
                      'bg-white text-black border-black hover:bg-gray-50 border shadow-sm'
                    )}
                    key={idx}
                  >
                    <Link href={button.url ?? ''} target={button.target ?? '_self'}>
                      {/* {button.icon && <SmartIcon name={button.icon as string} />} */}
                      <span className="flex items-center gap-2">
                        {button.title}
                        <span className="flex size-5 items-center justify-center rounded-full bg-black">
                          <SmartIcon name="ArrowUpRight" className="size-3 text-white" />
                        </span>
                      </span>
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            {/* Used by 150+ businesses section - hide on content site (knowledge graph) */}
            {!hasKnowledgeGraph && (
            <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
              <div className="relative h-12 w-12 flex-shrink-0 flex items-center">
                <Image
                  src="/imgs/avatars/Group-1597883677.avif"
                  alt="Clients"
                  width={48}
                  height={48}
                  className="object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex items-baseline gap-2 text-sm leading-none">
                <span className="text-muted-foreground">Used by</span>
                <span className="font-semibold text-foreground">150+</span>
                <span className="text-muted-foreground">businesses</span>
              </div>
            </div>
            )}

            {section.tip && (
              <p
                className="text-muted-foreground mt-6 block text-sm"
                dangerouslySetInnerHTML={{ __html: section.tip ?? '' }}
              />
            )}

            {section.show_avatars && (
              <div className="mt-8 flex justify-center lg:justify-start">
                <SocialAvatars tip={section.avatars_tip || ''} />
              </div>
            )}
          </div>

          {/* Right Side - Knowledge Graph, Video or Image */}
          <div className="relative flex items-center justify-center">
            {heroSection.knowledge_graph?.nodes?.length ? (
              <KnowledgeGraph
                section={heroSection.knowledge_graph}
                className="mx-auto"
              />
            ) : hasVideo ? (
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
        </div>
      </div>

      {/* Logos / Partner showcase: hide when hero shows knowledge graph (content site) */}
      {!hasKnowledgeGraph && (
        <div className="mt-16 md:mt-24">
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
