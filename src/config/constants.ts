/* ═══════════════════════════════════════════════════════════════
   CONSTANTS — Re-exports from SSOT Config Files
   ═══════════════════════════════════════════════════════════════
   
   DEPRECATED: Import directly from "@/config" instead.
   This file exists for backward compatibility only.
   
   All domain configs are now in:
   - @/config/domain-config (enums, labels, variants)
   - @/config/design-tokens (breakpoints, layout)
   ═══════════════════════════════════════════════════════════════ */

// Re-export from SSOT sources for backward compatibility
export {
    DEAL_STAGE_MAP as DEAL_STAGE_CONFIG,
    PROJECT_PHASE_ORDER,
    PROJECT_PHASE_MAP as PROJECT_PHASE_CONFIG,
    PROJECT_STATUS_MAP as PROJECT_STATUS_CONFIG,
    TASK_STATUS_MAP as TASK_STATUS_CONFIG,
    TASK_PRIORITY_MAP as TASK_PRIORITY_CONFIG,
    FABRICATION_STATUS_MAP as FABRICATION_STATUS_CONFIG,
    ASSET_CONDITION_MAP as ASSET_CONDITION_CONFIG,
} from "./domain-config";

export { BREAKPOINTS, LAYOUT } from "./design-tokens";

// Backward compatibility alias
export const SIDEBAR_WIDTH = {
    expanded: 260,
    collapsed: 68,
} as const;
