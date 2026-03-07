/**
 * Front Gate Tickets provider adapter.
 * Normalizes Front Gate Tickets webhook payloads into canonical ticket format.
 *
 * Front Gate Tickets is a major ticketing provider for music festivals.
 * Their API uses HMAC-SHA256 signature verification on webhooks.
 */

import type { NormalizedTicket, TicketingProviderAdapter } from "./types.ts";
import { validateHmacSignature } from "../webhook-utils.ts";

export const frontGateAdapter: TicketingProviderAdapter = {
    providerName: "front_gate",

    async validateSignature(
        payload: string,
        headers: Record<string, string>,
        secret: string,
    ): Promise<boolean> {
        const signature = headers["x-fgt-signature"] ?? headers["x-webhook-signature"];
        if (!signature || !secret) return false;

        const result = await validateHmacSignature(payload, signature, secret, "sha256");
        return result.valid;
    },

    extractEventType(payload: Record<string, unknown>): string {
        return (payload.event_type as string) ?? (payload.type as string) ?? "unknown";
    },

    normalizeTickets(payload: Record<string, unknown>): NormalizedTicket[] {
        const eventType = this.extractEventType(payload);
        const data = (payload.data ?? payload) as Record<string, unknown>;

        if (eventType.includes("order") || eventType.includes("purchase")) {
            return normalizeOrderPayload(data);
        }

        if (eventType.includes("ticket") || eventType.includes("attendee")) {
            return normalizeSingleTicket(data);
        }

        if (eventType.includes("checkin") || eventType.includes("scan")) {
            return normalizeCheckin(data);
        }

        return [];
    },
};

function normalizeOrderPayload(data: Record<string, unknown>): NormalizedTicket[] {
    const tickets = (data.tickets ?? data.line_items ?? []) as Record<string, unknown>[];
    const order = (data.order ?? data) as Record<string, unknown>;

    return tickets.map((ticket) => ({
        providerTicketId: String(ticket.ticket_id ?? ticket.id ?? ""),
        providerOrderId: String(order.order_id ?? order.id ?? ""),
        attendeeName: buildName(ticket),
        attendeeEmail: (ticket.email as string) ?? (order.email as string) ?? null,
        attendeePhone: (ticket.phone as string) ?? (order.phone as string) ?? null,
        ticketType: String(ticket.ticket_type ?? ticket.type_name ?? "General Admission"),
        ticketCategory: mapFrontGateCategory(ticket),
        barcodeValue: (ticket.barcode as string) ?? (ticket.scan_code as string) ?? null,
        barcodeFormat: "qr_code",
        status: mapFrontGateStatus(String(ticket.status ?? "active")),
        purchasedAt: (order.purchased_at as string) ?? (order.created_at as string) ?? null,
        eventExternalId: String(order.event_id ?? ticket.event_id ?? ""),
        eventName: (order.event_name as string) ?? null,
        zoneAccess: extractZoneAccess(ticket),
        tierLevel: determineTier(ticket),
        metadata: {
            fgt_order_id: order.order_id ?? order.id,
            fgt_ticket_id: ticket.ticket_id ?? ticket.id,
            fgt_ticket_type_id: ticket.ticket_type_id,
            will_call: ticket.will_call ?? false,
            is_addon: ticket.is_addon ?? false,
        },
    }));
}

function normalizeSingleTicket(data: Record<string, unknown>): NormalizedTicket[] {
    return [{
        providerTicketId: String(data.ticket_id ?? data.id ?? ""),
        providerOrderId: String(data.order_id ?? ""),
        attendeeName: buildName(data),
        attendeeEmail: (data.email as string) ?? null,
        attendeePhone: (data.phone as string) ?? null,
        ticketType: String(data.ticket_type ?? data.type_name ?? "General Admission"),
        ticketCategory: mapFrontGateCategory(data),
        barcodeValue: (data.barcode as string) ?? (data.scan_code as string) ?? null,
        barcodeFormat: "qr_code",
        status: mapFrontGateStatus(String(data.status ?? "active")),
        purchasedAt: (data.purchased_at as string) ?? null,
        eventExternalId: String(data.event_id ?? ""),
        eventName: (data.event_name as string) ?? null,
        zoneAccess: extractZoneAccess(data),
        tierLevel: determineTier(data),
        metadata: {
            fgt_ticket_id: data.ticket_id ?? data.id,
            fgt_order_id: data.order_id,
        },
    }];
}

function normalizeCheckin(data: Record<string, unknown>): NormalizedTicket[] {
    // Check-in webhooks update status only
    return [{
        providerTicketId: String(data.ticket_id ?? data.id ?? ""),
        providerOrderId: String(data.order_id ?? ""),
        attendeeName: buildName(data),
        attendeeEmail: (data.email as string) ?? null,
        attendeePhone: null,
        ticketType: String(data.ticket_type ?? "General Admission"),
        ticketCategory: mapFrontGateCategory(data),
        barcodeValue: (data.barcode as string) ?? (data.scan_code as string) ?? null,
        barcodeFormat: "qr_code",
        status: "active",
        purchasedAt: null,
        eventExternalId: String(data.event_id ?? ""),
        eventName: null,
        zoneAccess: extractZoneAccess(data),
        tierLevel: 1,
        metadata: {
            fgt_ticket_id: data.ticket_id ?? data.id,
            checked_in_at: data.checked_in_at ?? new Date().toISOString(),
            gate: data.gate,
            lane: data.lane,
        },
    }];
}

function buildName(data: Record<string, unknown>): string {
    const first = String(data.first_name ?? data.firstName ?? "");
    const last = String(data.last_name ?? data.lastName ?? "");
    const full = `${first} ${last}`.trim();
    return full || String(data.name ?? data.attendee_name ?? "Unknown");
}

function mapFrontGateStatus(status: string): NormalizedTicket["status"] {
    const s = status.toLowerCase();
    if (s === "active" || s === "valid" || s === "checked_in") return "active";
    if (s === "refunded") return "refunded";
    if (s === "cancelled" || s === "voided") return "cancelled";
    if (s === "transferred") return "transferred";
    return "pending";
}

function mapFrontGateCategory(ticket: Record<string, unknown>): string {
    const type = String(ticket.ticket_type ?? ticket.type_name ?? "").toLowerCase();
    if (type.includes("vip") || type.includes("platinum") || type.includes("premium")) return "vip";
    if (type.includes("all access") || type.includes("all-access")) return "all_access";
    if (type.includes("backstage")) return "backstage";
    if (type.includes("media") || type.includes("press")) return "media";
    if (type.includes("artist") || type.includes("performer")) return "artist";
    if (type.includes("crew") || type.includes("staff") || type.includes("production")) return "crew";
    if (type.includes("vendor") || type.includes("concessionaire")) return "vendor";
    if (type.includes("parking")) return "parking";
    if (type.includes("camping")) return "camping";
    return "general_admission";
}

function extractZoneAccess(ticket: Record<string, unknown>): string[] {
    const zones = ticket.zone_access ?? ticket.zones ?? ticket.access_areas;
    if (Array.isArray(zones)) return zones.map(String);
    if (typeof zones === "string") return zones.split(",").map((z: string) => z.trim());
    return [];
}

function determineTier(ticket: Record<string, unknown>): number {
    const tier = Number(ticket.tier ?? ticket.tier_level ?? 0);
    if (tier > 0) return tier;

    const category = mapFrontGateCategory(ticket);
    const tierMap: Record<string, number> = {
        all_access: 5,
        backstage: 4,
        artist: 4,
        vip: 3,
        media: 2,
        crew: 2,
        general_admission: 1,
        parking: 1,
        camping: 1,
        vendor: 1,
    };
    return tierMap[category] ?? 1;
}
