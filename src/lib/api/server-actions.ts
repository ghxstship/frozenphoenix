"use server";

/* ═══════════════════════════════════════════════════════════════
   SERVER ACTIONS — RSC Foundation (F-13)

   Server Actions for mutations called from client components.
   These replace client-side apiCreate/apiUpdate/apiDelete calls
   for RSC pages that need mutation capability.

   Each action validates auth via Supabase server client (inherits
   session from cookies), checks RBAC, and returns typed results.

   Usage (in a client component):
     import { createEntity, deleteEntity } from "@/lib/api/server-actions";

     const result = await createEntity("lead", { name: "Acme" });
     if (result.error) { ... }
   ═══════════════════════════════════════════════════════════════ */

import { revalidatePath } from "next/cache";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { getEntityConfig } from "@/lib/api/entity-config";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";

type ActionResult<T = Record<string, unknown>> =
    | { data: T; error: null }
    | { data: null; error: string };

async function resolveAuth(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>) {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: membership } = await supabase
        .from("org_memberships")
        .select("role, organization_id")
        .eq("user_id", user.id)
        .eq("is_default_org", true)
        .single();

    return {
        userId: user.id,
        role: (membership?.role as PermissionLevel) ?? "member",
        orgId: membership?.organization_id ?? "",
    };
}

export async function createEntity(
    entityKey: string,
    payload: Record<string, unknown>
): Promise<ActionResult> {
    const config = getEntityConfig(entityKey);
    if (!config) return { data: null, error: `Unknown entity: ${entityKey}` };

    const supabase = await createClient();
    if (!supabase) return { data: null, error: "Service unavailable" };

    const auth = await resolveAuth(supabase);
    if (!auth) return { data: null, error: "Unauthorized" };

    if (!hasPermission(auth.role, config.resource, "write")) {
        return { data: null, error: `Insufficient permissions to create ${config.displayName}` };
    }

    if (config.trackAuthor) {
        payload.created_by = auth.userId;
    }

    if (config.stateMachine && !payload[config.statusColumn]) {
        payload[config.statusColumn] = config.stateMachine.initialState;
    }

    const { data, error } = await serverFromTable(supabase, config.table)
        .insert(payload)
        .select(config.selectDetail)
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    revalidatePath(`/${config.slug}`);
    return { data: data as Record<string, unknown>, error: null };
}

export async function updateEntity(
    entityKey: string,
    id: string,
    payload: Record<string, unknown>
): Promise<ActionResult> {
    const config = getEntityConfig(entityKey);
    if (!config) return { data: null, error: `Unknown entity: ${entityKey}` };

    const supabase = await createClient();
    if (!supabase) return { data: null, error: "Service unavailable" };

    const auth = await resolveAuth(supabase);
    if (!auth) return { data: null, error: "Unauthorized" };

    if (!hasPermission(auth.role, config.resource, "write")) {
        return { data: null, error: `Insufficient permissions to update ${config.displayName}` };
    }

    if (config.trackAuthor) {
        payload.updated_by = auth.userId;
        payload.updated_at = new Date().toISOString();
    }

    const { data, error } = await serverFromTable(supabase, config.table)
        .update(payload)
        .eq("id", id)
        .select(config.selectDetail)
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    revalidatePath(`/${config.slug}`);
    revalidatePath(`/${config.slug}/${id}`);
    return { data: data as Record<string, unknown>, error: null };
}

export async function deleteEntity(
    entityKey: string,
    id: string
): Promise<ActionResult<{ success: boolean }>> {
    const config = getEntityConfig(entityKey);
    if (!config) return { data: null, error: `Unknown entity: ${entityKey}` };

    const supabase = await createClient();
    if (!supabase) return { data: null, error: "Service unavailable" };

    const auth = await resolveAuth(supabase);
    if (!auth) return { data: null, error: "Unauthorized" };

    if (!hasPermission(auth.role, config.resource, "delete")) {
        return { data: null, error: `Insufficient permissions to delete ${config.displayName}` };
    }

    if (config.softDelete) {
        const updatePayload: Record<string, unknown> = {
            deleted_at: new Date().toISOString(),
        };
        if (config.trackAuthor) {
            updatePayload.deleted_by = auth.userId;
        }
        const { error } = await serverFromTable(supabase, config.table)
            .update(updatePayload)
            .eq("id", id);

        if (error) return { data: null, error: error.message };
    } else {
        const { error } = await serverFromTable(supabase, config.table).delete().eq("id", id);

        if (error) return { data: null, error: error.message };
    }

    revalidatePath(`/${config.slug}`);
    return { data: { success: true }, error: null };
}
