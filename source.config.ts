import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { visit } from 'unist-util-visit';

export const docs = defineDocs({
  dir: 'content/docs',
});

export const pages = defineDocs({
  dir: 'content/pages',
});

export const posts = defineDocs({
  dir: 'content/posts',
});

export const logs = defineDocs({
  dir: 'content/logs',
});

export const vlm = defineDocs({
  dir: 'content/vlm',
});

/**
 * Rewrite local image paths written by Obsidian (relative to content/docs)
 * into Next.js public-folder absolute paths.
 *
 * Obsidian writes:  ../../images/docs/vla/arch.png
 * Next.js serves:  /docs-images/docs/vla/arch.png
 *
 * Rule: any URL segment matching  (../)*images/<rest>
 *       becomes                   /docs-images/<rest>
 */
function remarkRewriteImagePaths() {
  return (tree: any) => {
    visit(tree, 'image', (node: any) => {
      const match = node.url.match(/(?:\.\.\/)*images\/(.+)$/);
      if (match) {
        node.url = `/docs-images/${match[1]}`;
      }
    });
  };
}

export default defineConfig({
  mdxOptions: {
    // Disable fetching external image sizes at build time (avoids failures when
    // remote URLs return HTML, e.g. R2 403/404 or redirects in Docker/CI).
    remarkImageOptions: {
      external: false,
    },
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      // Use defaultLanguage for unknown language codes
      defaultLanguage: 'plaintext',
    },
    remarkPlugins: [remarkRewriteImagePaths],
  },
});
