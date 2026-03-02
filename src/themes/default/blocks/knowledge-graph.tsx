'use client';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import type {
  KnowledgeGraph as KnowledgeGraphType,
  KnowledgeGraphNode,
} from '@/shared/types/blocks/landing';

const RADIUS = 120;
const CENTER = 160;
const BOX = 320;
const NODE_W = 96;
const NODE_H = 40;

function getOrbitPosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  };
}

/**
 * Knowledge graph: center node + orbit nodes, clickable to doc/category pages.
 */
export function KnowledgeGraph({
  section,
  className,
}: {
  section: KnowledgeGraphType;
  className?: string;
}) {
  const { title, nodes } = section;
  if (!nodes?.length) return null;

  const centerLabel = title ?? 'AI';
  const orbitNodes = nodes;

  return (
    <nav
      className={cn('knowledge-graph', className)}
      aria-label={title ?? 'Knowledge graph'}
    >
      <div className="relative mx-auto w-[320px] h-[320px] sm:w-[360px] sm:h-[360px]">
        {/* SVG connector lines from center to each orbit node */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none text-border/50"
          aria-hidden
          viewBox={`0 0 ${BOX} ${BOX}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {orbitNodes.map((_, i) => {
            const pos = getOrbitPosition(i, orbitNodes.length);
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={pos.x}
                y2={pos.y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 2"
                className="opacity-60"
              />
            );
          })}
        </svg>

        {/* Center node - decorative */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
            flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full
            bg-primary text-primary-foreground font-semibold text-xs sm:text-sm shadow-lg select-none"
          aria-hidden
        >
          {centerLabel}
        </div>

        {/* Orbit nodes - clickable */}
        {orbitNodes.map((node, i) => {
          const pos = getOrbitPosition(i, orbitNodes.length);
          const left = pos.x - NODE_W / 2;
          const top = pos.y - NODE_H / 2;
          return (
            <Link
              key={node.id ?? node.url ?? i}
              href={node.url}
              className={cn(
                'absolute z-10 inline-flex items-center justify-center text-center',
                'min-w-[80px] sm:min-w-[96px] max-w-[120px] rounded-full px-3 py-2 text-xs sm:text-sm font-medium',
                'bg-background border-2 border-primary/40 text-foreground',
                'hover:bg-primary hover:text-primary-foreground hover:border-primary',
                'shadow-md hover:shadow-lg transition-all duration-200 no-underline'
              )}
              style={{
                left: `${Math.max(0, Math.min(BOX - NODE_W, left))}px`,
                top: `${Math.max(0, Math.min(BOX - NODE_H, top))}px`,
              }}
              aria-label={node.description ? `${node.title}: ${node.description}` : node.title}
            >
              {node.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Compact inline variant for use inside Hero (no center, just orbit-style or grid).
 */
export function KnowledgeGraphInline({
  nodes,
  className,
}: {
  nodes: KnowledgeGraphNode[];
  className?: string;
}) {
  if (!nodes?.length) return null;
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-2 sm:gap-3',
        className
      )}
    >
      {nodes.map((node, i) => (
        <Link
          key={node.id ?? node.url ?? i}
          href={node.url}
          className={cn(
            'inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium',
            'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
            'dark:bg-primary/20 dark:hover:bg-primary dark:hover:text-primary-foreground',
            'border border-primary/20 hover:border-primary/40',
            'transition-colors duration-200 no-underline'
          )}
        >
          {node.title}
        </Link>
      ))}
    </div>
  );
}
