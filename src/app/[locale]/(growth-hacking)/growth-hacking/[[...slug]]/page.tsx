import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';

import { growthHackingSource } from '@/core/docs/source';

export const dynamic = 'force-dynamic';

export default async function GrowthHackingContentPage(props: {
  params: Promise<{ slug?: string[]; locale?: string }>;
}) {
  const params = await props.params;

  const page = growthHackingSource.getPage(params.slug, params.locale);
  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{ style: 'clerk' }}
    >
      <div className="space-y-8">
        <header className="space-y-3 border-b border-border/40 pb-6 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:tracking-tight [&_p]:text-lg [&_p]:text-muted-foreground [&_p]:leading-relaxed">
          <DocsTitle>{page.data.title}</DocsTitle>
          {page.data.description && (
            <DocsDescription>{page.data.description}</DocsDescription>
          )}
        </header>
        <DocsBody>
          <div className="prose prose-neutral dark:prose-invert max-w-none break-words prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-7 prose-p:text-foreground/90 prose-a:text-primary prose-a:no-underline prose-a:break-all hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md prose-pre:bg-muted/50 prose-code:text-sm prose-strong:font-semibold prose-strong:text-foreground">
            <MDXContent
              components={getMDXComponents({
                a: createRelativeLink(growthHackingSource, page),
              })}
            />
          </div>
        </DocsBody>
      </div>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return growthHackingSource.generateParams('slug', 'locale');
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; locale?: string }>;
}) {
  const params = await props.params;

  const page = growthHackingSource.getPage(params.slug, params.locale);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
