/**
 * Stripe singleton helper — server-side only.
 * Returns a configured Stripe instance when STRIPE_SECRET_KEY is set,
 * or null when running without billing credentials (dev/test).
 *
 * Usage:
 *   const stripe = getStripe();
 *   if (!stripe) return ApiErrors.serviceUnavailable("Billing not configured");
 */

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;

    if (!_stripe) {
        _stripe = new Stripe(key, {
            apiVersion: "2026-03-25.dahlia",
            typescript: true,
        });
    }

    return _stripe;
}
