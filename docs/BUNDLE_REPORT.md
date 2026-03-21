# BUNDLE_REPORT.md — Bundle Analysis & Size-Reduction Actions

**Generated:** 2026-03-21 | **Protocol:** ANTIGRAVITY FP-INFRA-001

---

## Configuration Assessment

### `next.config.ts` Optimizations

| Setting | Status | Details |
|---------|:------:|---------|
| `output: "standalone"` | ✅ | Docker-ready build with tree-shaken node_modules |
| `reactCompiler: true` | ✅ | React Compiler enabled for automatic memoization |
| `compress: true` | ✅ | Gzip/Brotli compression enabled |
| `serverExternalPackages` | ✅ | 9 heavy packages excluded from client bundle |
| `images.formats` | ✅ | AVIF preferred, WebP fallback |
| `images.minimumCacheTTL` | ✅ | 86400s (24h) cache |

### Server-External Packages (Excluded from Client Bundle)

| Package | Approx Size | Reason |
|---------|:-----------:|--------|
| `@anthropic-ai/sdk` | ~50KB | AI SDK — server-only |
| `openai` | ~60KB | AI SDK — server-only |
| `@google/generative-ai` | ~40KB | AI SDK — server-only |
| `@mistralai/mistralai` | ~25KB | AI SDK — server-only |
| `groq-sdk` | ~20KB | AI SDK — server-only |
| `ollama` | ~15KB | AI SDK — server-only |
| `tiktoken` | ~1.2MB | WASM tokenizer — server-only |
| `pdf-parse` | ~50KB | Document parser — server-only |
| `mammoth` | ~40KB | DOCX parser — server-only |
| **Total saved** | **~1.5MB** | Correctly excluded from client |

---

## Dependency Analysis

### Heavy Client Dependencies

| Package | Approx Gzipped | Tree-Shakeable | Used In | Status |
|---------|:--------------:|:--------------:|---------|:------:|
| `react` + `react-dom` | ~42KB | N/A (required) | Global | ✅ |
| `recharts` | ~45KB | Partial | Dashboard/chart pages | ⚠️ Should be dynamic |
| `motion` (Framer Motion) | ~30KB | ✅ | Animations | ✅ |
| `@tanstack/react-query` | ~15KB | ✅ | Data fetching | ✅ |
| `@tanstack/react-table` | ~12KB | ✅ | Table views | ✅ |
| `@tanstack/react-virtual` | ~5KB | ✅ | Virtual scrolling | ✅ |
| `@radix-ui/*` (13 packages) | ~25KB total | ✅ | UI primitives | ✅ |
| `date-fns` | ~8KB (tree-shaken) | ✅ | Date formatting | ✅ |
| `zod` | ~10KB | ✅ | Validation | ✅ |
| `zustand` | ~3KB | ✅ | State management | ✅ |
| `react-hook-form` | ~9KB | ✅ | Form handling | ✅ |
| `lucide-react` | ~3KB per icon | ✅ (individual icons) | Icons | ✅ |
| `xlsx` | ~90KB | ❌ | Data export | ⚠️ Should be dynamic |
| `html5-qrcode` | ~50KB | ❌ | Scanning | ✅ (already in scan-only pages) |
| `qrcode` + `qrcode.react` | ~20KB | Partial | QR generation | ✅ |
| `react-easy-crop` | ~15KB | ❌ | Image cropping | ⚠️ Should be dynamic |
| `papaparse` | ~12KB | ❌ | CSV parsing | ⚠️ Should be dynamic |
| `cmdk` | ~8KB | ✅ | Command palette | ✅ |

---

## Dynamic Import Audit

### Currently Dynamic ✅

| Component | Location | `ssr` | Loading State |
|-----------|----------|:-----:|:------------:|
| `MessagingPanel` | Dashboard layout | `false` | None (panel) |
| `CopilotPanel` | Dashboard layout | `false` | None (panel) |

### Should Be Dynamic ⚠️

| Component / Library | Used In | Estimated Save | Priority |
|--------------------|---------|:--------------:|:--------:|
| `recharts` | Chart/dashboard pages only | ~45KB | P1 |
| `xlsx` | Data export only | ~90KB | P1 |
| `react-easy-crop` | Image upload modals only | ~15KB | P2 |
| `papaparse` | CSV import dialogs only | ~12KB | P2 |
| `html5-qrcode` | Scan pages only | ~50KB | P3 (already scoped) |

**Total potential savings: ~210KB gzipped** from initial bundle if all interaction-gated libraries are dynamically imported.

---

## Barrel File Impact

| Barrel File | Exports | Risk |
|-------------|:-------:|:----:|
| `lib/data-hooks/index.ts` | 22+ modules | Low (Next.js handles) |
| `lib/supabase/index.ts` | ~40 items | Low |
| `hooks/index.ts` | 20 hooks | Low |
| `components/auth/index.ts` | Auth components | Low |
| `components/ui/*` | UI primitive barrels | Low |

**Assessment:** Next.js 16 with Turbopack and React Compiler optimizes barrel imports effectively. No immediate action needed.

---

## Image Optimization

| Criterion | Status | Details |
|-----------|:------:|---------|
| `next/image` usage | ✅ | Configuration optimized (AVIF + WebP) |
| Device sizes | ✅ | 6 breakpoints: 640, 750, 828, 1080, 1200, 1920 |
| Cache TTL | ✅ | 24h minimum cache |
| SVG handling | ✅ | Inline SVGs via lucide-react (icon set) |

---

## Recommendations

| Priority | Action | Impact | Effort |
|:--------:|--------|:------:|:------:|
| P1 | Dynamic import `recharts` on chart pages | ~45KB saved | Low |
| P1 | Dynamic import `xlsx` on export pages | ~90KB saved | Low |
| P2 | Dynamic import `react-easy-crop` | ~15KB saved | Low |
| P2 | Dynamic import `papaparse` | ~12KB saved | Low |
| P3 | Add loading skeletons to existing dynamic imports | Better UX | Low |
| P3 | Run production build + analyze for actual chunk sizes | Baseline data | Low |

**Overall bundle health: Good.** The main optimization is dynamically importing heavy libraries that are only used on specific pages or behind user interactions.
