/**
 * Generate PWA icons from the SVG logo.
 * Usage: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgBuffer = readFileSync(join(root, 'public/logo-icon.svg'));

// Update the SVG viewBox to be larger for clean rendering
const svgStr = svgBuffer.toString()
  .replace('width="32"', 'width="512"')
  .replace('height="32"', 'height="512"');

const targets = [
  { path: 'public/apple-touch-icon.png', size: 180 },
  { path: 'public/icons/icon-192.png', size: 192 },
  { path: 'public/icons/icon-512.png', size: 512 },
  { path: 'public/icons/icon-maskable-512.png', size: 512 },
];

for (const target of targets) {
  const outPath = join(root, target.path);
  mkdirSync(dirname(outPath), { recursive: true });
  
  let pipeline = sharp(Buffer.from(svgStr))
    .resize(target.size, target.size)
    .png();

  // For maskable icons, add 10% padding (safe zone)
  if (target.path.includes('maskable')) {
    const padded = Math.round(target.size * 0.1);
    const inner = target.size - padded * 2;
    pipeline = sharp(Buffer.from(svgStr))
      .resize(inner, inner)
      .extend({
        top: padded,
        bottom: padded,
        left: padded,
        right: padded,
        background: { r: 99, g: 102, b: 241, alpha: 1 }, // #6366f1 primary
      })
      .png();
  }

  await pipeline.toFile(outPath);
  console.log(`✓ ${target.path} (${target.size}×${target.size})`);
}

console.log('\nAll icons generated.');
