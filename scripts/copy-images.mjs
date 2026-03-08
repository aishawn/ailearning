/**
 * Copy images/ → public/docs-images/
 *
 * Run:  node scripts/copy-images.mjs
 * Auto: hooked into "build" and "dev" in package.json
 *
 * Source:      images/**
 * Destination: public/docs-images/**
 *
 * Supported: .png .jpg .jpeg .gif .webp .svg .avif
 */

import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SRC = join(ROOT, 'images');
const DEST = join(ROOT, 'public', 'docs-images');
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']);

let copied = 0;
let skipped = 0;

function copyDir(srcDir, destDir) {
  if (!existsSync(srcDir)) return;
  mkdirSync(destDir, { recursive: true });

  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile() && IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      const srcMtime = statSync(srcPath).mtimeMs;
      const destExists = existsSync(destPath);
      const destMtime = destExists ? statSync(destPath).mtimeMs : 0;

      if (!destExists || srcMtime > destMtime) {
        copyFileSync(srcPath, destPath);
        console.log(`  ✓ ${relative(ROOT, srcPath)} → ${relative(ROOT, destPath)}`);
        copied++;
      } else {
        skipped++;
      }
    }
  }
}

console.log('[copy-images] Copying images/ → public/docs-images/ ...');
copyDir(SRC, DEST);
console.log(`[copy-images] Done. copied=${copied}, skipped(up-to-date)=${skipped}`);
