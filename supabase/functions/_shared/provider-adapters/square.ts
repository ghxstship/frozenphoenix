/**
 * Square POS provider adapter.
 * Normalizes Square webhook payloads into canonical POS transaction format.
 *
 * Square webhooks: https://developer.squareup.com/docs/webhooks
 * Signature: x-square-hmacsha256-signature header
 */

import type { NormalizedPosItem, NormalizedPosTransaction, PosProviderAdapter } from "./types.ts";
import { validateHmacSignature } from "../webhook-utils.ts";

export const squareAdapter: PosProviderAdapter = {
    providerName: "square",

    async validateSignature(
        payload: string,
        headers: Record<string, string>,
        secret: string,
    ): Promise<boolean> {
        const signature = headers["x-square-hmacsha256-signature"];
        if (!signature || !secret) return false;

        // Square uses the notification URL + body for HMAC
        const result = await validateHmacSignature(payload, signature, secret, "sha256");
        return result.valid;
    },

    extractEventType(payload: Record<string, unknown>): string {
        return (payload.type as string) ?? "unknown";
    },

    normalizeTransactions(payload: Record<string, unknown>): NormalizedPosTransaction[] {
        const eventType = payload.type as string;
        const data = (payload.data ?? {}) as Record<string, unknown>;
        const obj = (data.object ?? {}) as Record<string, unknown>;

        if (eventType === "payment.completed" || eventType === "payment.updated") {
            return normalizePayment(obj);
        }

        if (eventType === "order.fulfilled" || eventType === "order.updated") {
            return normalizeOrder(obj);
        }

        if (eventType === "refund.created" || eventType === "refund.updated") {
            return normalizeRefund(obj);
        }

        return [];
    },
};

function normalizePayment(obj: Record<string, unknown>): NormalizedPosTransaction[] {
    const payment = (obj.payment ?? obj) as Record<string, unknown>;
    const amountMoney = (payment.amount_money ?? {}) as Record<string, unknown>;
    const tipMoney = (payment.tip_money ?? {}) as Record<string, unknown>;

    const totalCents = Number(amountMoney.amount ?? 0);
    const tipCents = Number(tipMoney.amount ?? 0);

    return [{
        providerTransactionId: String(payment.id ?? ""),
        transactionType: "sale",
        totalAmount: totalCents / 100,
        taxAmount: 0, // Tax is on the order level in Square
        tipAmount: tipCents / 100,
        discountAmount: 0,
        currency: String(amountMoney.currency ?? "USD"),
        paymentMethod: mapSquarePaymentMethod(payment),
        category: "pos_sale",
        items: [],
        completedAt: (payment.created_at as string) ?? new Date().toISOString(),
        locationExternalId: (payment.location_id as string) ?? null,
        deviceId: (payment.device_id as string) ?? null,
        metadata: {
            square_payment_id: payment.id,
            square_order_id: payment.order_id,
            square_receipt_number: payment.receipt_number,
            source_type: payment.source_type,
        },
    }];
}

function normalizeOrder(obj: Record<string, unknown>): NormalizedPosTransaction[] {
    const order = (obj.order ?? obj) as Record<string, unknown>;
    const lineItems = (order.line_items ?? []) as Record<string, unknown>[];
    const totalMoney = (order.total_money ?? {}) as Record<string, unknown>;
    const totalTaxMoney = (order.total_tax_money ?? {}) as Record<string, unknown>;
    const totalDiscountMoney = (order.total_discount_money ?? {}) as Record<string, unknown>;
    const totalTipMoney = (order.total_tip_money ?? {}) as Record<string, unknown>;

    const items: NormalizedPosItem[] = lineItems.map((li) => {
        const basePriceMoney = (li.base_price_money ?? {}) as Record<string, unknown>;
        const totalItemMoney = (li.total_money ?? {}) as Record<string, unknown>;

        return {
            name: String(li.name ?? "Unknown Item"),
            sku: (li.catalog_object_id as string) ?? null,
            quantity: Number(li.quantity ?? 1),
            unitPrice: Number(basePriceMoney.amount ?? 0) / 100,
            totalPrice: Number(totalItemMoney.amount ?? 0) / 100,
            category: mapSquareItemCategory(li),
        };
    });

    // Determine primary category from items
    const primaryCategory = items.length > 0
        ? determinePrimaryCategory(items)
        : "pos_sale";

    return [{
        providerTransactionId: String(order.id ?? ""),
        transactionType: mapSquareOrderState(String(order.state ?? "")),
        totalAmount: Number(totalMoney.amount ?? 0) / 100,
        taxAmount: Number(totalTaxMoney.amount ?? 0) / 100,
        tipAmount: Number(totalTipMoney.amount ?? 0) / 100,
        discountAmount: Number(totalDiscountMoney.amount ?? 0) / 100,
        currency: String(totalMoney.currency ?? "USD"),
        paymentMethod: "unknown",
        category: primaryCategory,
        items,
        completedAt: (order.closed_at as string) ?? (order.created_at as string) ?? new Date().toISOString(),
        locationExternalId: (order.location_id as string) ?? null,
        deviceId: null,
        metadata: {
            square_order_id: order.id,
            square_reference_id: order.reference_id,
            square_source: (order.source ?? {}) as Record<string, unknown>,
        },
    }];
}

function normalizeRefund(obj: Record<string, unknown>): NormalizedPosTransaction[] {
    const refund = (obj.refund ?? obj) as Record<string, unknown>;
    const amountMoney = (refund.amount_money ?? {}) as Record<string, unknown>;

    return [{
        providerTransactionId: String(refund.id ?? ""),
        transactionType: "refund",
        totalAmount: -(Number(amountMoney.amount ?? 0) / 100),
        taxAmount: 0,
        tipAmount: 0,
        discountAmount: 0,
        currency: String(amountMoney.currency ?? "USD"),
        paymentMethod: "unknown",
        category: "refund",
        items: [],
        completedAt: (refund.created_at as string) ?? new Date().toISOString(),
        locationExternalId: (refund.location_id as string) ?? null,
        deviceId: null,
        metadata: {
            square_refund_id: refund.id,
            square_payment_id: refund.payment_id,
            reason: refund.reason,
        },
    }];
}

function mapSquarePaymentMethod(payment: Record<string, unknown>): string {
    const sourceType = String(payment.source_type ?? "").toLowerCase();
    if (sourceType.includes("card")) return "card";
    if (sourceType.includes("cash")) return "cash";
    if (sourceType.includes("wallet") || sourceType.includes("apple") || sourceType.includes("google"))
        return "digital_wallet";
    if (sourceType.includes("bank")) return "bank_transfer";
    return "other";
}

function mapSquareOrderState(state: string): NormalizedPosTransaction["transactionType"] {
    if (state === "COMPLETED") return "sale";
    if (state === "CANCELED") return "void";
    return "sale";
}

function mapSquareItemCategory(lineItem: Record<string, unknown>): string | null {
    const name = String(lineItem.name ?? "").toLowerCase();
    if (name.includes("beer") || name.includes("cocktail") || name.includes("wine") || name.includes("drink"))
        return "beverage";
    if (name.includes("food") || name.includes("meal") || name.includes("snack"))
        return "food";
    if (name.includes("merch") || name.includes("shirt") || name.includes("hat") || name.includes("poster"))
        return "merchandise";
    if (name.includes("ticket") || name.includes("pass"))
        return "ticket";
    return null;
}

function determinePrimaryCategory(items: NormalizedPosItem[]): string {
    const categories = items.map((i) => i.category).filter(Boolean) as string[];
    if (categories.length === 0) return "pos_sale";

    const counts: Record<string, number> = {};
    for (const cat of categories) {
        counts[cat] = (counts[cat] ?? 0) + 1;
    }

    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    return sorted.length > 0 ? sorted[0][0] : "pos_sale";
}
