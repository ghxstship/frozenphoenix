import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { getStripe } from "@/lib/stripe/client";

/**
 * POST /api/invoices/payment-link
 *
 * Generates a payment link for a client invoice.
 *
 * Strategy:
 *  - If STRIPE_SECRET_KEY is set → creates a Stripe Payment Link / Checkout
 *    session for the invoice amount and returns the Stripe-hosted URL.
 *  - Otherwise → generates a token-based internal payment page URL.
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
            .select("id, total, status, company_id, invoice_number, payment_instructions, currency")
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

        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ??
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://atlvs.one");

        // Strategy 1: Stripe Checkout session
        const stripe = getStripe();
        if (stripe && inv.total) {
            const totalCents = Math.round(Number(inv.total) * 100);
            const currency = (inv.currency as string | undefined)?.toLowerCase() ?? "usd";

            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency,
                            unit_amount: totalCents,
                            product_data: {
                                name: `Invoice #${inv.invoice_number as string}`,
                            },
                        },
                        quantity: 1,
                    },
                ],
                metadata: { invoice_id, organization_id: orgId },
                success_url: `${appUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${appUrl}/pay/canceled`,
            });

            const paymentUrl = session.url ?? `${appUrl}/pay/session/${session.id}`;

            await serverFromTable(supabase, "client_invoices")
                .update({ payment_instructions: paymentUrl })
                .eq("id", invoice_id);

            return NextResponse.json({
                data: {
                    payment_url: paymentUrl,
                    session_id: session.id,
                    invoice_id,
                    amount: inv.total,
                    invoice_number: inv.invoice_number,
                },
            });
        }

        // Strategy 2: Token-based internal payment page
        const paymentToken = `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
        const paymentUrl = `${appUrl}/pay/${paymentToken}`;

        await serverFromTable(supabase, "client_invoices")
            .update({ payment_instructions: paymentUrl })
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
