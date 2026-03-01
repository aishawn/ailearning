import React from 'react';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';

// Custom link component with nofollow for external links and target="_blank" for all links
const CustomLink = ({
  href,
  children,
  target,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  // Check if the link is external
  const isExternal = href?.startsWith('http') || href?.startsWith('//');
  
  // Default to _blank for all links unless explicitly specified
  const linkTarget = target || '_blank';
  const linkRel = isExternal 
    ? 'nofollow noopener noreferrer' 
    : 'noopener noreferrer';

  return (
    <a
      href={href}
      target={linkTarget}
      rel={linkRel}
      className={isExternal ? 'text-primary' : undefined}
      {...props}
    >
      {children}
    </a>
  );
};

// Higher-order component to wrap any link component with target="_blank" and nofollow logic
export function withNoFollow(
  LinkComponent: React.ComponentType<
    React.AnchorHTMLAttributes<HTMLAnchorElement>
  >
) {
  return ({
    href,
    children,
    target,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    // Check if the link is external
    const isExternal = href?.startsWith('http') || href?.startsWith('//');
    
    // Default to _blank for all links unless explicitly specified
    const linkTarget = target || '_blank';
    const linkRel = isExternal 
      ? 'nofollow noopener noreferrer' 
      : 'noopener noreferrer';

    // For all links, add target="_blank" and appropriate rel
    return (
      <LinkComponent
        href={href}
        target={linkTarget}
        rel={linkRel}
        className={isExternal ? 'text-primary' : undefined}
        {...props}
      >
        {children}
      </LinkComponent>
    );
  };
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  const mergedComponents = {
    ...defaultMdxComponents,
    a: CustomLink,
    img: (props: React.ComponentProps<'img'>) => {
      const { src } = props;
      // If src is an object (imported image), use its src property
      const imageSrc =
        typeof src === 'object' && src !== null && 'src' in src
          ? (src as any).src
          : src;

      return (
        <img
          {...props}
          src={imageSrc}
          className={cn('rounded-lg border', props.className)}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      );
    },
    Video: ({ className, ...props }: React.ComponentProps<'video'>) => (
      <video
        className={cn('rounded-md border', className)}
        controls
        loop
        {...props}
      />
    ),
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    ...components,
  };

  // If a custom 'a' component is provided, wrap it with target="_blank" and nofollow logic
  if (components?.a) {
    if (components.a !== CustomLink) {
      mergedComponents.a = withNoFollow(
        components.a as React.ComponentType<
          React.AnchorHTMLAttributes<HTMLAnchorElement>
        >
      );
    }
  } else {
    // Use CustomLink as default if no custom component is provided
    mergedComponents.a = CustomLink;
  }

  return mergedComponents;
}

export const useMDXComponents = getMDXComponents;
