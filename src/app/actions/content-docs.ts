'use server';

import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const CONTENT_DOCS = 'content/docs';

function resolveDocPath(relativePath: string): string {
  // Normalize to avoid path escape; support both / and \ for cross-platform
  const normalized = path
    .normalize(relativePath.replace(/\//g, path.sep))
    .replace(/^(\.\.(\/|\\|$))+/, '');
  const base = path.join(process.cwd(), CONTENT_DOCS);
  const resolved = path.join(base, normalized);
  if (!resolved.startsWith(base)) {
    throw new Error('Invalid path');
  }
  return resolved;
}

/** List all .md/.mdx files under content/docs (relative paths) */
export async function getContentDocList(): Promise<{ path: string; label: string }[]> {
  const base = path.join(process.cwd(), CONTENT_DOCS);
  const entries: { path: string; label: string }[] = [];

  async function walk(dir: string, prefix = '') {
    const items = await readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const rel = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.isDirectory()) {
        await walk(path.join(dir, item.name), rel);
      } else if (item.isFile() && /\.(md|mdx)$/i.test(item.name)) {
        entries.push({ path: rel, label: rel });
      }
    }
  }

  try {
    await walk(base);
  } catch (e) {
    console.error('[content-docs] list error', e);
    return [];
  }

  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

/** Read one doc file content */
export async function getContentDocContent(relativePath: string): Promise<{ content: string; error?: string }> {
  try {
    const filePath = resolveDocPath(relativePath);
    const content = await readFile(filePath, 'utf-8');
    return { content };
  } catch (e) {
    console.error('[content-docs] read error', e);
    return { content: '', error: e instanceof Error ? e.message : 'Read failed' };
  }
}

/** Write one doc file (creates parent dirs if needed) */
export async function setContentDocContent(
  relativePath: string,
  content: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const filePath = resolveDocPath(relativePath);
    const { mkdir } = await import('fs/promises');
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, 'utf-8');
    return { ok: true };
  } catch (e) {
    console.error('[content-docs] write error', e);
    return { ok: false, error: e instanceof Error ? e.message : 'Write failed' };
  }
}
