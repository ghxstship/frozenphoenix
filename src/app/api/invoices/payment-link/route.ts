import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/invoices/payment-link
 *
 * Gap #7: Online payment collection
 * Generates a payment link for a client invoice. In production this would
 * create a Stripe Checkout session. For now it generates a shareable
 * token-based payment page URL and updates the invoice with the link.
 *
 * Body: { invoice_id: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/invoices/payment-link",
        mutation: true,
        rbac: { resource: "client_invoices", action: "write" },
    },
    async (request, { supabase, orgId }) => {
        const body = await request.json();
        const { invoice_id } = body;

        if (!invoice_id) {
            return ApiErrors.badRequest("invoice_id is required");
        }

        const { data: invoice, error: invErr } = await serverFromTable(supabase, "client_invoices")
            .select("id, total, status, company_id, invoice_number, payment_instructions")
            .eq("id", invoice_id)
            .eq("organization_id", orgId)
            .single();

        if (invErr || !invoice) {
            return ApiErrors.notFound("Invoice");
        }

        const inv = invoice as Record<string, unknown>;
        if (inv.status === "paid") {
            return ApiErrors.conflict("Invoice is already paid");
        }

        // Generate a unique payment token
        const paymentToken = `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ??
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://atlvs.one");
        const paymentUrl = `${appUrl}/pay/${paymentToken}`;

        // Store the payment link on the invoice
        await serverFromTable(supabase, "client_invoices")
            .update({
                payment_instructions: paymentUrl,
            })
            .eq("id", invoice_id);

        return NextResponse.json({
            data: {
                payment_url: paymentUrl,
                payment_token: paymentToken,
                invoice_id,
                amount: inv.total,
                invoice_number: inv.invoice_number,
            },
        });
    }
);
