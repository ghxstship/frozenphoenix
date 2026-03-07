/**
 * Shared types for provider adapters.
 * Each provider adapter normalizes external data into these canonical shapes.
 */

// ---------------------------------------------------------------------------
// Normalized Ticket / Credential
// ---------------------------------------------------------------------------

export interface NormalizedTicket {
    providerTicketId: string;
    providerOrderId: string | null;
    attendeeName: string;
    attendeeEmail: string | null;
    attendeePhone: string | null;
    ticketType: string;
    ticketCategory: string;
    barcodeValue: string | null;
    barcodeFormat: string;
    status: "active" | "refunded" | "cancelled" | "transferred" | "pending";
    purchasedAt: string | null;
    eventExternalId: string | null;
    eventName: string | null;
    zoneAccess: string[];
    tierLevel: number;
    metadata: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Normalized POS Transaction
// ---------------------------------------------------------------------------

export interface NormalizedPosTransaction {
    providerTransactionId: string;
    transactionType: "sale" | "refund" | "void" | "exchange";
    totalAmount: number;
    taxAmount: number;
    tipAmount: number;
    discountAmount: number;
    currency: string;
    paymentMethod: string;
    category: string;
    items: NormalizedPosItem[];
    completedAt: string;
    locationExternalId: string | null;
    deviceId: string | null;
    metadata: Record<string, unknown>;
}

export interface NormalizedPosItem {
    name: string;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string | null;
}

// ---------------------------------------------------------------------------
// Provider Adapter Interface
// ---------------------------------------------------------------------------

export interface TicketingProviderAdapter {
    providerName: string;

    /** Validate webhook signature */
    validateSignature(
        payload: string,
        headers: Record<string, string>,
        secret: string,
    ): Promise<boolean>;

    /** Extract event type from webhook payload */
    extractEventType(payload: Record<string, unknown>): string;

    /** Normalize a webhook payload into tickets */
    normalizeTickets(payload: Record<string, unknown>): NormalizedTicket[];
}

export interface PosProviderAdapter {
    providerName: string;

    /** Validate webhook signature */
    validateSignature(
        payload: string,
        headers: Record<string, string>,
        secret: string,
    ): Promise<boolean>;

    /** Extract event type from webhook payload */
    extractEventType(payload: Record<string, unknown>): string;

    /** Normalize a webhook payload into POS transactions */
    normalizeTransactions(payload: Record<string, unknown>): NormalizedPosTransaction[];
}
