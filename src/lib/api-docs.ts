/* ═══════════════════════════════════════════════════════════════
   API DOCUMENTATION — OpenAPI 3.1 Spec (Auto-Generated)
   ═══════════════════════════════════════════════════════════════
   
   Re-exports the auto-generated OpenAPI 3.1 spec builder.
   The spec is derived at runtime from:
   - ENTITY_CONFIGS registry (CRUD endpoints + Zod schemas)
   - PERMISSION_MATRIX (RBAC security documentation)
   - Custom route registry (non-CRUD endpoints)
   
   Usage:
     import { buildOpenApiSpec } from "@/lib/api-docs";
     // Access spec at GET /api/docs
   ═══════════════════════════════════════════════════════════════ */

export { buildOpenApiSpec, invalidateSpecCache } from "@/lib/openapi";
export type { OpenApiSpec } from "@/lib/openapi";
