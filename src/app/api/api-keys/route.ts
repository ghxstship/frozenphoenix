import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import crypto from "crypto";

const createKeySchema = z.object({
    name: z.string().min(1).max(100),
    scopes: z.array(z.string()).optional(),
    rate_limit_rpm: z.number().min(1).max(10000).optional(),
    expires_at: z.string().datetime().optional(),
});

/**
 * GET /api/api-keys — list API keys for the user's org
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/api-keys",
        rbac: { resource: "settings", action: "read" },
    },
    async (_request, { supabase, orgId }) => {
        const { data, error } = await supabase
            .from("api_keys")
            .select(
                "id, name, key_prefix, scopes, rate_limit_rpm, is_active, last_used_at, expires_at, created_at, revoked_at"
            )
            .eq("organization_id", orgId)
            .order("created_at", { ascending: false });

        if (error) return ApiErrors.internalError("Failed to fetch API keys");
        return NextResponse.json({ data });
    }
);

/**
 * POST /api/api-keys — create a new API key
 *
 * Returns the full key ONCE — it is not stored in plaintext.
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/api-keys",
        mutation: true,
        rbac: { resource: "settings", action: "write" },
    },
    async (request, { supabase, user, orgId }) => {
        const parsed = await parseAndValidate(request, createKeySchema);
        if (!parsed.success) return parsed.response;

        const { name, scopes, rate_limit_rpm, expires_at } = parsed.data;

        // Generate a random API key with a recognizable prefix
        const rawKey = `fpx_${crypto.randomBytes(32).toString("hex")}`;
        const prefix = rawKey.slice(0, 12);
        const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

        const { data: apiKey, error } = await supabase
            .from("api_keys")
            .insert({
                organization_id: orgId,
                name,
                key_hash: keyHash,
                key_prefix: prefix,
                scopes: scopes ?? ["read"],
                rate_limit_rpm: rate_limit_rpm ?? 60,
                expires_at: expires_at ?? null,
                created_by: user.id,
            })
            .select("id, name, key_prefix, scopes, rate_limit_rpm, expires_at, created_at")
            .single();

        if (error) return ApiErrors.internalError("Failed to create API key");

        return NextResponse.json(
            {
                data: {
                    ...apiKey,
                    key: rawKey,
                },
                message: "API key created. Store this key securely — it will not be shown again.",
            },
            { status: 201 }
        );
    }
);

/**
 * DELETE /api/api-keys — revoke an API key
 */
export const DELETE = withApiHandler(
    {
        method: "DELETE",
        route: "/api/api-keys",
        mutation: true,
        rbac: { resource: "settings", action: "write" },
    },
    async (request, { supabase, orgId }) => {
        const url = new URL(request.url);
        const keyId = url.searchParams.get("id");

        if (!keyId) return ApiErrors.badRequest("id is required");

        const { error } = await supabase
            .from("api_keys")
            .update({ is_active: false, revoked_at: new Date().toISOString() })
            .eq("id", keyId)
            .eq("organization_id", orgId);

        if (error) return ApiErrors.internalError("Failed to revoke API key");
        return NextResponse.json({ message: "API key revoked" });
    }
);
