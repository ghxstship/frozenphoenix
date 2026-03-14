import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { z } from "zod";

const transferSchema = z.object({
    organization_id: z.string().uuid("Invalid organization ID"),
    new_owner_user_id: z.string().uuid("Invalid user ID"),
});

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    // Parse & validate
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return ApiErrors.validationError({ body: ["Invalid JSON"] });
    }

    const parsed = transferSchema.safeParse(body);
    if (!parsed.success) {
        const details: Record<string, string[]> = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path.join(".");
            details[key] = [issue.message];
        }
        return ApiErrors.validationError(details);
    }

    const { organization_id, new_owner_user_id } = parsed.data;

    // Verify caller is the current owner
    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    const { data: callerMembership } = await serverFromTable(admin, "org_memberships")
        .select("id, is_owner, role")
        .eq("user_id", user.id)
        .eq("organization_id", organization_id)
        .eq("status", "active")
        .single();

    if (!callerMembership) {
        return ApiErrors.forbidden("You are not a member of this organization");
    }

    if (!(callerMembership as Record<string, unknown>).is_owner) {
        return ApiErrors.forbidden("Only the organization owner can transfer ownership");
    }

    if (user.id === new_owner_user_id) {
        return ApiErrors.validationError({
            new_owner_user_id: ["Cannot transfer ownership to yourself"],
        });
    }

    // Verify target is an active internal member
    const { data: targetMembership } = await serverFromTable(admin, "org_memberships")
        .select("id, role, status")
        .eq("user_id", new_owner_user_id)
        .eq("organization_id", organization_id)
        .single();

    if (!targetMembership) {
        return ApiErrors.notFound("Target user is not a member of this organization");
    }

    const targetRole = (targetMembership as Record<string, unknown>).role as string;
    const targetStatus = (targetMembership as Record<string, unknown>).status as string;

    if (targetStatus !== "active") {
        return ApiErrors.validationError({
            new_owner_user_id: ["Target user membership is not active"],
        });
    }

    if (!["exec", "director", "pm", "member"].includes(targetRole)) {
        return ApiErrors.validationError({
            new_owner_user_id: ["Ownership can only be transferred to an internal role member"],
        });
    }

    // Atomic swap: remove from current owner, grant to new owner
    const { error: removeError } = await serverFromTable(admin, "org_memberships")
        .update({ is_owner: false } as Record<string, unknown>)
        .eq("user_id", user.id)
        .eq("organization_id", organization_id);

    if (removeError) {
        logger.error("[POST /api/organizations/transfer-ownership] remove owner failed", {
            error: removeError,
        });
        return ApiErrors.internalError("Failed to transfer ownership");
    }

    const { error: grantError } = await serverFromTable(admin, "org_memberships")
        .update({ is_owner: true } as Record<string, unknown>)
        .eq("user_id", new_owner_user_id)
        .eq("organization_id", organization_id);

    if (grantError) {
        // Rollback: restore original owner
        await serverFromTable(admin, "org_memberships")
            .update({ is_owner: true } as Record<string, unknown>)
            .eq("user_id", user.id)
            .eq("organization_id", organization_id);

        logger.error("[POST /api/organizations/transfer-ownership] grant owner failed", {
            error: grantError,
        });
        return ApiErrors.internalError("Failed to transfer ownership");
    }

    logger.info("[POST /api/organizations/transfer-ownership] ownership transferred", {
        organization_id,
        from_user_id: user.id,
        to_user_id: new_owner_user_id,
    });

    return NextResponse.json({ message: "Ownership transferred successfully" }, { status: 200 });
}
