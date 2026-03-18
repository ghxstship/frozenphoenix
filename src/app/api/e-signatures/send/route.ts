import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/e-signatures/send
 *
 * Gap #31: E-signature execution flow
 * Initiates a signature request: generates a signing token, creates an
 * e_signatures record, and returns the signing URL.
 *
 * Body: { entity_type: string, entity_id: string, signer_email: string, signer_name: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/e-signatures/send",
        mutation: true,
        rbac: { resource: "contracts", action: "write" },
    },
    async (request, { supabase, user, orgId }) => {
        const body = await request.json();
        const { entity_type, entity_id, signer_email, signer_name } = body;

        if (!entity_type || !entity_id || !signer_email || !signer_name) {
            return NextResponse.json(
                {
                    error: {
                        message:
                            "entity_type, entity_id, signer_email, and signer_name are required",
                    },
                },
                { status: 400 }
            );
        }

        const signingToken = `sig_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ??
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://atlvs.one");
        const signingUrl = `${appUrl}/sign/${signingToken}`;

        const { data: sig, error: sigErr } = await serverFromTable(supabase, "e_signatures")
            .insert({
                entity_type,
                entity_id,
                signer_email: signer_email,
                signer_name: signer_name,
                status: "pending",
                signing_token: signingToken,
                expires_at: expiresAt,
                requested_by: user.id,
                organization_id: orgId,
            })
            .select("id")
            .single();

        if (sigErr || !sig) {
            return NextResponse.json(
                {
                    error: {
                        message: "Failed to create signature request",
                        details: sigErr?.message,
                    },
                },
                { status: 500 }
            );
        }

        // Update the parent entity to reflect signature is pending
        if (entity_type === "proposal" || entity_type === "proposals") {
            await serverFromTable(supabase, "proposals")
                .update({ signature_required: true })
                .eq("id", entity_id);
        } else if (entity_type === "contract" || entity_type === "contracts") {
            await serverFromTable(supabase, "contracts")
                .update({ status: "pending_signature" })
                .eq("id", entity_id);
        }

        return NextResponse.json(
            {
                data: {
                    signature_id: (sig as Record<string, unknown>).id,
                    signing_url: signingUrl,
                    signing_token: signingToken,
                    expires_at: expiresAt,
                    signer_email,
                },
            },
            { status: 201 }
        );
    }
);
