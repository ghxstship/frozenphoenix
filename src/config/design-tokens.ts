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
    accent: {
        bg: "bg-accent",
        text: "text-accent",
        border: "border-accent",
        foreground: "text-accent-foreground",
    },
} as const;

export type SemanticColor = keyof typeof SEMANTIC_COLORS;

// ─── Spacing Scale ───
// Consistent spacing tokens (in Tailwind units)
export const SPACING = {
    none: "0",
    xs: "1", // 4px
    sm: "2", // 8px
    md: "4", // 16px
    lg: "6", // 24px
    xl: "8", // 32px
    "2xl": "12", // 48px
    "3xl": "16", // 64px
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
        size: "text-2xl sm:text-3xl lg:text-4xl",
        weight: "font-bold",
        leading: "leading-tight",
    },
    h1: {
        size: "text-xl sm:text-2xl lg:text-3xl",
        weight: "font-bold",
        leading: "leading-tight",
    },
    h2: {
        size: "text-lg sm:text-xl lg:text-2xl",
        weight: "font-semibold",
        leading: "leading-snug",
    },
    h3: {
        size: "text-base sm:text-lg lg:text-xl",
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
        fadeIn: "motion-safe:animate-fade-in",
        slideUp: "motion-safe:animate-slide-up",
        slideDown: "motion-safe:animate-slide-down",
        scaleIn: "motion-safe:animate-scale-in",
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
        mobile: 280,
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
    xs: { container: "h-6 w-6", text: "density-caption" },
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
export const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" as const;

// ─── Transition Presets ───
export const TRANSITIONS = {
    colors: "transition-colors",
    all: "transition-all",
    transform: "transition-transform",
    opacity: "transition-opacity",
    shadow: "transition-shadow",
} as const;

// ─── Motion Scale ───
// Named motion durations for semantic animation control
export const MOTION_SCALE = {
    instant: 0,
    xs: 100,
    sm: 150,
    md: 250,
    lg: 400,
    xl: 600,
    decorative: 500,
} as const;

export type MotionScaleToken = keyof typeof MOTION_SCALE;

// ─── Surface Elevation Tokens ───
export const SURFACE = {
    elevated: "bg-surface-elevated",
    overlay: "bg-surface-overlay",
    sunken: "bg-surface-sunken",
    skeleton: "bg-skeleton",
} as const;

export type SurfaceToken = keyof typeof SURFACE;

// ─── Chart Color Tokens ───
export const CHART_COLORS = {
    1: "hsl(var(--chart-1))",
    2: "hsl(var(--chart-2))",
    3: "hsl(var(--chart-3))",
    4: "hsl(var(--chart-4))",
    5: "hsl(var(--chart-5))",
    6: "hsl(var(--chart-6))",
    7: "hsl(var(--chart-7))",
    8: "hsl(var(--chart-8))",
} as const;

export type ChartColorToken = keyof typeof CHART_COLORS;

// ─── Feedback Tokens ───
export const FEEDBACK = {
    starRating: {
        filled: "text-star-rating fill-star-rating",
        empty: "text-muted-foreground/30",
    },
} as const;

// ─── Stagger Scale ───
// Delay increments for staggered entrance animations (in ms)
export const STAGGER_SCALE = {
    tight: 30,
    normal: 50,
    relaxed: 80,
    loose: 120,
} as const;

export type StaggerScaleToken = keyof typeof STAGGER_SCALE;

// ─── Spring Presets (for motion library) ───
// Named spring configurations for JS-driven animations
export const SPRING_PRESETS = {
    snappy: { stiffness: 500, damping: 30, mass: 1 },
    gentle: { stiffness: 200, damping: 20, mass: 1 },
    bouncy: { stiffness: 300, damping: 15, mass: 1 },
    heavy: { stiffness: 150, damping: 25, mass: 2 },
} as const;

export type SpringPresetToken = keyof typeof SPRING_PRESETS;

// ─── Exit Duration Scale ───
// Exit animations should be faster than entrances (asymmetric timing)
export const EXIT_SCALE = {
    fast: 100,
    normal: 150,
    slow: 250,
} as const;

export type ExitScaleToken = keyof typeof EXIT_SCALE;

// ─── Scroll Reveal Config ───
// IntersectionObserver configuration for scroll-driven animations
export const SCROLL_REVEAL = {
    threshold: 0.15,
    rootMargin: "-40px",
    staggerInterval: 80,
} as const;

// ─── Interaction Timing ───
// Standard debounce/throttle values for user interactions
export const INTERACTION_TIMING = {
    debounceSearch: 300,
    debounceResize: 150,
    throttleScroll: 100,
    tooltipDelay: 400,
    toastDuration: 5000,
    longPress: 500,
} as const;

// ─── Grid Units ───
// Standardized grid configuration tokens
export const GRID = {
    columns: {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
        6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    },
    gap: {
        xs: "gap-1 sm:gap-2",
        sm: "gap-2 sm:gap-3",
        md: "gap-3 sm:gap-4 lg:gap-6",
        lg: "gap-4 sm:gap-6 lg:gap-8",
    },
} as const;

export type GridColumnsToken = keyof typeof GRID.columns;
export type GridGapToken = keyof typeof GRID.gap;

// ─── Component Size Scale ───
// Unified sizing tokens for interactive components
export const COMPONENT_SIZES = {
    xs: { height: "h-7", px: "px-2", text: "text-xs", icon: "h-3 w-3" },
    sm: { height: "h-8", px: "px-3", text: "text-xs", icon: "h-3.5 w-3.5" },
    md: { height: "h-9", px: "px-4", text: "text-sm", icon: "h-4 w-4" },
    lg: { height: "h-11", px: "px-6", text: "text-base", icon: "h-5 w-5" },
    xl: { height: "h-12", px: "px-8", text: "text-base", icon: "h-5 w-5" },
} as const;

export type ComponentSizeToken = keyof typeof COMPONENT_SIZES;

// ─── Text Variant Tokens ───
// Standardized text rendering variants for casing control
export const TEXT_VARIANTS = {
    overline: {
        fontSize: "density-caption",
        fontWeight: "font-semibold",
        letterSpacing: "tracking-wide",
        textTransform: "uppercase" as const,
        ariaStrategy: "original-case" as const,
    },
    label: {
        fontSize: "text-sm",
        fontWeight: "font-medium",
        letterSpacing: "tracking-normal",
        textTransform: "none" as const,
    },
    caption: {
        fontSize: "text-xs",
        fontWeight: "font-normal",
        letterSpacing: "tracking-normal",
        textTransform: "none" as const,
    },
    tableHeader: {
        fontSize: "text-xs",
        fontWeight: "font-semibold",
        letterSpacing: "tracking-normal",
        textTransform: "none" as const,
    },
} as const;

export type TextVariantToken = keyof typeof TEXT_VARIANTS;

// ─── Glass Morphism Tokens ───
// Organic glass surface system for modals, dialogs, panels, and overlays
export const GLASS = {
    /** Overlay behind modals — radial gradient fades toward edges */
    overlay: {
        base: "bg-black/40",
        blur: "backdrop-blur-sm",
    },
    /** Glass surface for dialog/modal/panel content */
    surface: {
        /** Light: translucent white. Dark: translucent near-black */
        background: "bg-[var(--glass-surface-bg)]",
        border: "border border-[var(--glass-surface-border)]",
        /** Multi-layer depth shadow: tight + diffused + faint color bleed */
        shadow: "shadow-[0_1px_2px_rgba(0,0,0,0.07),0_8px_24px_rgba(0,0,0,0.12),0_24px_48px_-12px_rgba(0,0,0,0.18)]",
        /** Noise overlay for physical materiality */
        noise: "glass-noise",
        /** Full composite class */
        classes:
            "bg-[var(--glass-surface-bg)] backdrop-blur-xl backdrop-saturate-150 border border-[var(--glass-surface-border)] shadow-[0_1px_2px_rgba(0,0,0,0.07),0_8px_24px_rgba(0,0,0,0.12),0_24px_48px_-12px_rgba(0,0,0,0.18)] glass-noise",
    },
    /** Spring animation config for glass entry (scale + blur settle) */
    entrySpring: { stiffness: 400, damping: 28, mass: 1 },
} as const;

// ─── Contrast Variants ───
export const CONTRAST_VARIANTS = {
    default: {
        border: "border-border",
        ring: "ring-ring",
        focus: "focus-visible:ring-ring",
    },
    high: {
        border: "border-foreground/50",
        ring: "ring-foreground",
        focus: "focus-visible:ring-foreground",
    },
} as const;
