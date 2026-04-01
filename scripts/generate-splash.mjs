#!/usr/bin/env node

/* ═══════════════════════════════════════════════════════════════
   GENERATE SPLASH SCREENS — iOS PWA Launch Images
   
   Generates splash screen PNGs for all common iOS device sizes.
   Uses the existing 512px app icon centered on the theme background.
   
   Usage: node scripts/generate-splash.mjs
   Requires: sharp (npm install -D sharp)
   ═══════════════════════════════════════════════════════════════ */

import sharp from "sharp";
import { mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICON_PATH = join(ROOT, "public/icons/icon-512.png");
const OUTPUT_DIR = join(ROOT, "public/splash");

// Theme background color (matches --color-background in dark mode)
const BG_COLOR = "#0a0a0f";

// iOS device splash screen sizes (width x height in CSS pixels × device pixel ratio)
const SPLASH_SIZES = [
    // iPhone SE / 8
    { name: "iphone-se", width: 640, height: 1136 },
    // iPhone 8 Plus
    { name: "iphone-8-plus", width: 1242, height: 2208 },
    // iPhone X / XS / 11 Pro / 12 mini / 13 mini
    { name: "iphone-x", width: 1125, height: 2436 },
    // iPhone XR / 11
    { name: "iphone-xr", width: 828, height: 1792 },
    // iPhone XS Max / 11 Pro Max
    { name: "iphone-xs-max", width: 1242, height: 2688 },
    // iPhone 12 / 12 Pro / 13 / 13 Pro / 14
    { name: "iphone-12", width: 1170, height: 2532 },
    // iPhone 12 Pro Max / 13 Pro Max / 14 Plus
    { name: "iphone-12-max", width: 1284, height: 2778 },
    // iPhone 14 Pro
    { name: "iphone-14-pro", width: 1179, height: 2556 },
    // iPhone 14 Pro Max / 15 Pro Max / 16 Pro Max
    { name: "iphone-14-max", width: 1290, height: 2796 },
    // iPhone 15 / 15 Pro / 16 / 16 Pro
    { name: "iphone-15", width: 1179, height: 2556 },
    // iPad (10th gen) / iPad Air
    { name: "ipad", width: 1640, height: 2360 },
    // iPad Pro 11"
    { name: "ipad-pro-11", width: 1668, height: 2388 },
    // iPad Pro 12.9"
    { name: "ipad-pro-13", width: 2048, height: 2732 },
];

async function generateSplash() {
    if (!existsSync(ICON_PATH)) {
        console.error("❌ Icon not found:", ICON_PATH);
        console.error("   Run `node scripts/generate-icons.mjs` first.");
        process.exit(1);
    }

    mkdirSync(OUTPUT_DIR, { recursive: true });

    const icon = await sharp(ICON_PATH).resize(256, 256).png().toBuffer();

    for (const size of SPLASH_SIZES) {
        const { name, width, height } = size;
        const iconX = Math.round((width - 256) / 2);
        const iconY = Math.round((height - 256) / 2) - 40; // slightly above center

        await sharp({
            create: {
                width,
                height,
                channels: 4,
                background: BG_COLOR,
            },
        })
            .composite([{ input: icon, left: iconX, top: iconY }])
            .png({ quality: 90 })
            .toFile(join(OUTPUT_DIR, `${name}.png`));

        console.log(`  ✓ ${name}.png (${width}×${height})`);
    }

    console.log(`\n✅ Generated ${SPLASH_SIZES.length} splash screens in public/splash/`);
}

generateSplash().catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
});
