/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — Single Source of Truth for UI Primitives
   ═══════════════════════════════════════════════════════════════
   
   3NF Compliance:
   - Each token is defined exactly once
   - No derived values stored (computed at runtime)
   - All UI components reference these tokens
   
   White-Label Ready:
   - Override via CSS custom properties or tenant config
   ═══════════════════════════════════════════════════════════════ */

// ─── Semantic Color Variants ───
// Maps semantic intent to Tailwind color classes
export const SEMANTIC_COLORS = {
    primary: {
        bg: "bg-primary",
        text: "text-primary",
        border: "border-primary",
        foreground: "text-primary-foreground",
    },
    secondary: {
        bg: "bg-secondary",
        text: "text-secondary",
        border: "border-secondary",
        foreground: "text-secondary-foreground",
    },
    destructive: {
        bg: "bg-destructive",
        text: "text-destructive",
        border: "border-destructive",
        foreground: "text-destructive-foreground",
    },
    warning: {
        bg: "bg-warning",
        text: "text-warning",
        border: "border-warning",
        foreground: "text-warning-foreground",
    },
    success: {
        bg: "bg-success",
        text: "text-success",
        border: "border-success",
        foreground: "text-success-foreground",
    },
    info: {
        bg: "bg-info",
        text: "text-info",
        border: "border-info",
        foreground: "text-info-foreground",
    },
    muted: {
        bg: "bg-muted",
        text: "text-muted",
        border: "border-muted",
        foreground: "text-muted-foreground",
    },
} as const;

export type SemanticColor = keyof typeof SEMANTIC_COLORS;

// ─── Spacing Scale ───
// Consistent spacing tokens (in Tailwind units)
export const SPACING = {
    none: "0",
    xs: "1",      // 4px
    sm: "2",      // 8px
    md: "4",      // 16px
    lg: "6",      // 24px
    xl: "8",      // 32px
    "2xl": "12",  // 48px
    "3xl": "16",  // 64px
} as const;

export type SpacingToken = keyof typeof SPACING;

// ─── Border Radius ───
export const RADIUS = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
} as const;

export type RadiusToken = keyof typeof RADIUS;

// ─── Shadow Depth System ───
export const SHADOWS = {
    none: "shadow-none",
    xs: "shadow-xs",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
} as const;

export type ShadowToken = keyof typeof SHADOWS;

// ─── Typography Scale ───
export const TYPOGRAPHY = {
    display: {
        size: "text-4xl",
        weight: "font-bold",
        leading: "leading-tight",
    },
    h1: {
        size: "text-3xl",
        weight: "font-bold",
        leading: "leading-tight",
    },
    h2: {
        size: "text-2xl",
        weight: "font-semibold",
        leading: "leading-snug",
    },
    h3: {
        size: "text-xl",
        weight: "font-semibold",
        leading: "leading-snug",
    },
    h4: {
        size: "text-lg",
        weight: "font-medium",
        leading: "leading-normal",
    },
    body: {
        size: "text-base",
        weight: "font-normal",
        leading: "leading-relaxed",
    },
    bodySmall: {
        size: "text-sm",
        weight: "font-normal",
        leading: "leading-relaxed",
    },
    caption: {
        size: "text-xs",
        weight: "font-medium",
        leading: "leading-normal",
    },
    overline: {
        size: "text-[11px]",
        weight: "font-semibold",
        leading: "leading-normal",
        extra: "uppercase tracking-wider",
    },
    mono: {
        size: "text-sm",
        weight: "font-normal",
        leading: "leading-normal",
        extra: "font-mono",
    },
} as const;

export type TypographyToken = keyof typeof TYPOGRAPHY;

// ─── Z-Index Layers ───
export const Z_INDEX = {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    toast: 80,
    max: 9999,
} as const;

export type ZIndexToken = keyof typeof Z_INDEX;

// ─── Animation Tokens ───
export const ANIMATIONS = {
    duration: {
        instant: "duration-0",
        fast: "duration-150",
        normal: "duration-250",
        slow: "duration-400",
    },
    easing: {
        default: "ease-out",
        spring: "ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        expo: "ease-[cubic-bezier(0.16,1,0.3,1)]",
    },
    preset: {
        fadeIn: "animate-fade-in",
        slideUp: "animate-slide-up",
        slideDown: "animate-slide-down",
        scaleIn: "animate-scale-in",
        shimmer: "animate-shimmer",
        pulseGlow: "animate-pulse-glow",
    },
} as const;

// ─── Responsive Breakpoints ───
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
} as const;

export type BreakpointToken = keyof typeof BREAKPOINTS;

// ─── Layout Dimensions ───
export const LAYOUT = {
    sidebar: {
        expanded: 260,
        collapsed: 68,
    },
    topbar: {
        height: 64,
    },
    maxContentWidth: 1400,
    containerPadding: {
        mobile: 16,
        desktop: 24,
    },
} as const;

// ─── Icon Sizes ───
export const ICON_SIZES = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
    "2xl": "h-10 w-10",
} as const;

export type IconSizeToken = keyof typeof ICON_SIZES;

// ─── Avatar Sizes ───
export const AVATAR_SIZES = {
    xs: { container: "h-6 w-6", text: "text-[10px]" },
    sm: { container: "h-8 w-8", text: "text-xs" },
    md: { container: "h-10 w-10", text: "text-sm" },
    lg: { container: "h-12 w-12", text: "text-base" },
    xl: { container: "h-16 w-16", text: "text-lg" },
    "2xl": { container: "h-20 w-20", text: "text-xl" },
} as const;

export type AvatarSizeToken = keyof typeof AVATAR_SIZES;

// ─── Touch Targets ───
export const TOUCH_TARGETS = {
    minimum: 44, // WCAG 2.2 AA minimum
    comfortable: 48,
} as const;

// ─── Focus Ring ───
export const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" as const;

// ─── Transition Presets ───
export const TRANSITIONS = {
    colors: "transition-colors",
    all: "transition-all",
    transform: "transition-transform",
    opacity: "transition-opacity",
    shadow: "transition-shadow",
} as const;
