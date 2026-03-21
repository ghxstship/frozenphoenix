/* ═══════════════════════════════════════════════════════════════
   DATA HOOKS — Domain-specific Supabase query/mutation hooks

   Extracted from lib/supabase/ for separation of concerns.
   Infrastructure (client, server, config, middleware) stays in
   lib/supabase/. Data-access hooks live here.
   ═══════════════════════════════════════════════════════════════ */

// Infrastructure
export * from "./hook-factories";
export type * from "./hook-types";
export * from "./mutation-utils";
export * from "./use-mutation-with-toast";

// Domain hooks
export * from "./hooks-admin";
export * from "./hooks-advancing";
export * from "./hooks-approval-engine";
export * from "./hooks-assets-inventory";
export * from "./hooks-automation";
export * from "./hooks-collaborators";
export * from "./hooks-core";
export * from "./hooks-credentialing";
export * from "./hooks-crm";
export * from "./hooks-documents";
export * from "./hooks-external-sync";
export * from "./hooks-feature-gaps";
export * from "./hooks-finance";
export * from "./hooks-legal";
export * from "./hooks-live-ops";
export * from "./hooks-messaging-realtime";
export * from "./hooks-messaging";
export * from "./hooks-production";
export * from "./hooks-scanning";
export * from "./hooks-sow";
export * from "./hooks-switcher";
export * from "./hooks-workflows";
export * from "./hooks-workforce";
