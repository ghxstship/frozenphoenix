import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

function generateRecoveryCode(): string {
    return randomBytes(4).toString("hex").toUpperCase().match(/.{4}/g)!.join("-");
}

function hashCode(code: string): string {
    return createHash("sha256").update(code.toLowerCase()).digest("hex");
}

/**
 * POST — Generate a fresh set of 10 recovery codes.
 * Deletes any existing unused codes and creates new ones.
 * Returns the plaintext codes (shown once, never stored in plaintext).
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/auth/mfa-recovery-codes",
        mutation: true,
    },
    async (_request, { supabase, user }) => {
        // Delete existing unused recovery codes for this user
        await serverFromTable(supabase, "mfa_recovery_codes")
            .delete()
            .eq("user_id", user.id)
            .is("used_at", null);

        // Generate 10 new codes
        const codes: string[] = [];
        const rows: { user_id: string; code_hash: string }[] = [];

        for (let i = 0; i < 10; i++) {
            const code = generateRecoveryCode();
            codes.push(code);
            rows.push({ user_id: user.id, code_hash: hashCode(code) });
        }

        const { error } = await serverFromTable(supabase, "mfa_recovery_codes").insert(rows);

        if (error) {
            return NextResponse.json(
                { error: "Failed to generate recovery codes" },
                { status: 500 }
            );
        }

        return NextResponse.json({ codes });
    }
);

/**
 * GET — Check how many unused recovery codes remain.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/auth/mfa-recovery-codes",
    },
    async (_request, { supabase, user }) => {
        const { count, error } = await serverFromTable(supabase, "mfa_recovery_codes")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .is("used_at", null);

        if (error) {
            return NextResponse.json({ remaining: 0 });
        }

        return NextResponse.json({ remaining: count ?? 0 });
    }
);
