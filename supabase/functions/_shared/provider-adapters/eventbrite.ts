/**
 * Eventbrite provider adapter.
 * Normalizes Eventbrite webhook payloads into canonical ticket format.
 *
 * Eventbrite webhooks: https://www.eventbrite.com/platform/docs/webhooks
 * Signature: X-Eventbrite-Delivery header (no HMAC, uses webhook verification endpoint)
 * For production, use the Actions API verification or a shared secret approach.
 */

import type { NormalizedTicket, TicketingProviderAdapter } from "./types.ts";
import { validateHmacSignature } from "../webhook-utils.ts";

export const eventbriteAdapter: TicketingProviderAdapter = {
    providerName: "eventbrite",

    async validateSignature(
        payload: string,
        headers: Record<string, string>,
        secret: string,
    ): Promise<boolean> {
        // Eventbrite Actions API uses a webhook secret for HMAC verification
        const signature = headers["x-eventbrite-signature"] ?? headers["x-hub-signature"];
        if (!signature || !secret) return false;

        const result = await validateHmacSignature(payload, signature, secret, "sha256");
        return result.valid;
    },

    extractEventType(payload: Record<string, unknown>): string {
        // Eventbrite webhook format: { api_url, config, action }
        return (payload.action as string) ?? "unknown";
    },

    normalizeTickets(payload: Record<string, unknown>): NormalizedTicket[] {
        const action = payload.action as string;

        // Handle order-related webhooks
        if (action?.startsWith("order.")) {
            return normalizeOrderPayload(payload);
        }

        // Handle attendee-related webhooks
        if (action?.startsWith("attendee.")) {
            return normalizeAttendeePayload(payload);
        }

        return [];
    },
};

function normalizeOrderPayload(payload: Record<string, unknown>): NormalizedTicket[] {
    const attendees = ((payload as Record<string, unknown>).attendees ?? []) as Record<string, unknown>[];

    return attendees.map((attendee) => {
        const profile = (attendee.profile ?? {}) as Record<string, unknown>;
        const ticketClass = (attendee.ticket_class ?? {}) as Record<string, unknown>;
        const barcodes = (attendee.barcodes ?? []) as Record<string, unknown>[];

        return {
            providerTicketId: String(attendee.id ?? ""),
            providerOrderId: String(attendee.order_id ?? payload.id ?? ""),
            attendeeName: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Unknown",
            attendeeEmail: (profile.email as string) ?? null,
            attendeePhone: (profile.cell_phone as string) ?? null,
            ticketType: String(ticketClass.name ?? "General Admission"),
            ticketCategory: mapEventbriteCategory(ticketClass),
            barcodeValue: barcodes.length > 0 ? String(barcodes[0].barcode ?? "") : null,
            barcodeFormat: "qr_code",
            status: mapEventbriteStatus(String(attendee.status ?? "Attending")),
            purchasedAt: (attendee.created as string) ?? null,
            eventExternalId: String(attendee.event_id ?? ""),
            eventName: null,
            zoneAccess: [],
            tierLevel: determineTier(ticketClass),
            metadata: {
                eventbrite_order_id: attendee.order_id,
                eventbrite_attendee_id: attendee.id,
                ticket_class_id: ticketClass.id,
                checked_in: attendee.checked_in ?? false,
            },
        };
    });
}

function normalizeAttendeePayload(payload: Record<string, unknown>): NormalizedTicket[] {
    // Single attendee webhook
    const profile = ((payload as Record<string, unknown>).profile ?? {}) as Record<string, unknown>;
    const ticketClass = ((payload as Record<string, unknown>).ticket_class ?? {}) as Record<string, unknown>;
    const barcodes = ((payload as Record<string, unknown>).barcodes ?? []) as Record<string, unknown>[];

    return [{
        providerTicketId: String(payload.id ?? ""),
        providerOrderId: String(payload.order_id ?? ""),
        attendeeName: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Unknown",
        attendeeEmail: (profile.email as string) ?? null,
        attendeePhone: (profile.cell_phone as string) ?? null,
        ticketType: String(ticketClass.name ?? "General Admission"),
        ticketCategory: mapEventbriteCategory(ticketClass),
        barcodeValue: barcodes.length > 0 ? String(barcodes[0].barcode ?? "") : null,
        barcodeFormat: "qr_code",
        status: mapEventbriteStatus(String(payload.status ?? "Attending")),
        purchasedAt: (payload.created as string) ?? null,
        eventExternalId: String(payload.event_id ?? ""),
        eventName: null,
        zoneAccess: [],
        tierLevel: determineTier(ticketClass),
        metadata: {
            eventbrite_order_id: payload.order_id,
            eventbrite_attendee_id: payload.id,
            checked_in: payload.checked_in ?? false,
        },
    }];
}

function mapEventbriteStatus(status: string): NormalizedTicket["status"] {
    const map: Record<string, NormalizedTicket["status"]> = {
        "Attending": "active",
        "Not Attending": "cancelled",
        "Refunded": "refunded",
        "Transferred": "transferred",
        "Checked In": "active",
    };
    return map[status] ?? "pending";
}

function mapEventbriteCategory(ticketClass: Record<string, unknown>): string {
    const name = String(ticketClass.name ?? "").toLowerCase();
    if (name.includes("vip") || name.includes("premium")) return "vip";
    if (name.includes("backstage") || name.includes("all access")) return "all_access";
    if (name.includes("media") || name.includes("press")) return "media";
    if (name.includes("crew") || name.includes("staff")) return "crew";
    return "general_admission";
}

function determineTier(ticketClass: Record<string, unknown>): number {
    const cost = Number(ticketClass.cost?.display ?? ticketClass.cost?.value ?? 0) / 100;
    if (cost >= 500) return 4;
    if (cost >= 200) return 3;
    if (cost >= 50) return 2;
    return 1;
}
