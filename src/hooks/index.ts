// ═══════════════════════════════════════════════════════════════
// UI & Utility Hooks — Barrel Export
// ═══════════════════════════════════════════════════════════════
// Usage: import { useMediaQuery, useSidebar } from "@/hooks";

export {
    useAnnounce,
    useArrowNavigation,
    useEscapeKey,
    useFocusReturn,
    useFocusTrap,
    useId,
    useKeyboardNavigation,
} from "./use-accessibility";

export { useAdvanceCart } from "./use-advance-cart";

export { useColumnPreferences } from "./use-column-preferences";

export { useCopilotContext } from "./use-copilot-context";

export { useCopilot } from "./use-copilot";

export { useDetailCrud } from "./use-detail-crud";

export {
    useBreakpoint,
    useHighContrast,
    useIsTouchDevice,
    useMediaQuery,
    useOrientation,
    usePrefersColorScheme,
    useReducedMotion,
    useViewportSize,
} from "./use-media-query";

export { useMessagingEnabled } from "./use-messaging-enabled";

export { useMessagingStrings } from "./use-messaging-strings";

export { useMessaging } from "./use-messaging";

export { useMotion } from "./use-motion";

export { useOfflineSync } from "./use-offline-sync";

export { useQueryTabState } from "./use-query-tab-state";

export { useScanDevice } from "./use-scan-device";

export { useSidebar } from "./use-sidebar";

export { useTierEntitlements, useTierGate } from "./use-tier-gate";

export { useWedgeScanner } from "./use-wedge-scanner";

export { useWorkspaceContext } from "./use-workspace-context";
