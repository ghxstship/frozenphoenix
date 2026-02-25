# Configuration — SSOT/3NF Design System

This directory contains the **Single Source of Truth (SSOT)** configuration for the Frozen Phoenix UI, following **Third Normal Form (3NF)** principles to eliminate redundancy.

## Architecture

```
src/config/
├── index.ts           # Unified export (import from "@/config")
├── brand.ts           # Brand identity (white-label ready)
├── design-tokens.ts   # UI primitives (colors, spacing, typography)
├── ui-variants.ts     # Status/priority → badge variant mappings
├── domain-config.ts   # Business domain enums with labels & variants
├── navigation.ts      # Sidebar navigation structure
├── rbac.ts            # Role-based access control matrix
└── constants.ts       # DEPRECATED: Re-exports for backward compatibility
```

## Usage

### Import from `@/config`

```tsx
import {
    // Brand
    brandConfig,
    
    // Design Tokens
    SPACING,
    RADIUS,
    TYPOGRAPHY,
    ICON_SIZES,
    BREAKPOINTS,
    
    // UI Variants
    getStatusVariant,
    getStatusLabel,
    
    // Domain Config
    PROJECT_PHASES,
    PROJECT_PHASE_MAP,
    TASK_PRIORITIES,
} from "@/config";
```

### Status Badges (SSOT Pattern)

Instead of defining variant mappings in each page:

```tsx
// ❌ BAD: Duplicate definitions
const statusVariant = {
    active: "success",
    draft: "ghost",
    // ... repeated in every file
};

<Badge variant={statusVariant[project.status]}>{project.status}</Badge>
```

Use the SSOT components:

```tsx
// ✅ GOOD: Single source of truth
import { StatusBadge, PriorityBadge } from "@/components/ui";

<StatusBadge status={project.status} />
<PriorityBadge priority={task.priority} />
```

### Domain Enums

Access enum configurations with full metadata:

```tsx
import { PROJECT_PHASE_MAP, TASK_STATUS_MAP } from "@/config";

// Get label and variant for a phase
const phase = PROJECT_PHASE_MAP["fabrication"];
// { value: "fabrication", label: "Fabrication", variant: "info" }

// Use in components
<Badge variant={phase.variant}>{phase.label}</Badge>
```

### Design Tokens

Use tokens for consistent styling:

```tsx
import { ICON_SIZES, AVATAR_SIZES, TYPOGRAPHY } from "@/config";

// Icons
<Icon className={ICON_SIZES.md} />  // "h-5 w-5"

// Avatars
<div className={AVATAR_SIZES.lg.container}>
    <span className={AVATAR_SIZES.lg.text}>AR</span>
</div>

// Typography
<h2 className={`${TYPOGRAPHY.h2.size} ${TYPOGRAPHY.h2.weight}`}>
    Title
</h2>
```

## 3NF Compliance

### First Normal Form (1NF)
- All values are atomic (no arrays/objects as raw values)
- Each config has a unique key

### Second Normal Form (2NF)
- All non-key attributes depend on the full key
- No partial dependencies

### Third Normal Form (3NF)
- No transitive dependencies
- Labels derived from values, not stored redundantly
- Variants computed from status, not duplicated per-page

## Adding New Enums

1. Define the type in `@/types/index.ts`
2. Add config array in `domain-config.ts`
3. Create the map using `Object.fromEntries()`
4. Export from `index.ts`

```tsx
// 1. Type
export type MyStatus = "pending" | "active" | "done";

// 2. Config array
export const MY_STATUSES: EnumConfig<MyStatus>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "active", label: "Active", variant: "success" },
    { value: "done", label: "Done", variant: "info" },
];

// 3. Map
export const MY_STATUS_MAP = Object.fromEntries(
    MY_STATUSES.map((s) => [s.value, s])
) as Record<MyStatus, EnumConfig<MyStatus>>;
```

## White-Label Support

Brand configuration supports environment variable overrides:

```env
NEXT_PUBLIC_BRAND_NAME=Client Corp
NEXT_PUBLIC_BRAND_SHORT_NAME=CC
NEXT_PUBLIC_BRAND_TAGLINE=Production Platform
NEXT_PUBLIC_BRAND_LOGO_ICON=/client-logo.svg
```

CSS custom properties in `globals.css` can be overridden per-tenant:

```css
.tenant-acme {
    --primary: 200 80% 50%;
    --accent: 45 100% 50%;
}
```
