/* ═══════════════════════════════════════════════════════════════
   External Sync & POS Integration — Type Definitions
   Maps to migration 052 (external sync infrastructure)
   ═══════════════════════════════════════════════════════════════ */

// ─── Provider Enums ───

export type ProviderType =
    | "eventbrite"
    | "square"
    | "front_gate"
    | "intellitix"
    | "custom";

export type SyncDirection = "inbound" | "outbound" | "bidirectional";

export type WebhookEventStatus =
    | "received"
    | "processing"
    | "processed"
    | "failed"
    | "skipped";

export type SyncEventStatus =
    | "pending"
    | "in_progress"
    | "completed"
    | "failed"
    | "conflict";

export type ConflictStrategy =
    | "provider_wins"
    | "compvss_wins"
    | "last_write_wins"
    | "manual";

export type PosPaymentMethod =
    | "cash"
    | "credit_card"
    | "debit_card"
    | "mobile"
    | "rfid"
    | "comp"
    | "other";

export type PosCategory =
    | "ticket"
    | "food_beverage"
    | "merchandise"
    | "parking"
    | "vip_upgrade"
    | "other";

// ─── Provider Connection ───

export interface ProviderConnection {
    id: string;
    organization_id: string;
    provider_type: ProviderType;
    display_name: string;
    event_id: string | null;
    api_key: string | null;
    api_secret: string | null;
    webhook_secret: string | null;
    webhook_url: string | null;
    sync_direction: SyncDirection;
    is_active: boolean;
    rate_limit_config: RateLimitConfig;
    last_sync_at: string | null;
    last_error: string | null;
    error_count: number;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface RateLimitConfig {
    requests_per_second: number;
}

// ─── Provider Ticket Map ───

export interface ProviderTicketMap {
    id: string;
    organization_id: string;
    connection_id: string;
    provider_ticket_id: string;
    provider_order_id: string | null;
    provider_event_id: string | null;
    assignment_id: string | null;
    attendee_name: string | null;
    attendee_email: string | null;
    ticket_type: string | null;
    raw_payload: Record<string, unknown>;
    last_synced_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── POS Transactions ───

export interface PosTransaction {
    id: string;
    organization_id: string;
    connection_id: string;
    event_id: string | null;
    live_event_id: string | null;
    foh_zone_id: string | null;
    provider_transaction_id: string;
    subtotal: number;
    tax_amount: number;
    tip_amount: number;
    discount_amount: number;
    total_amount: number;
    currency: string;
    payment_method: PosPaymentMethod | null;
    category: PosCategory | null;
    vendor_id: string | null;
    terminal_id: string | null;
    operator_name: string | null;
    transaction_at: string;
    is_refund: boolean;
    original_transaction_id: string | null;
    refund_reason: string | null;
    raw_payload: Record<string, unknown>;
    created_at: string;
}

export interface PosTransactionItem {
    id: string;
    transaction_id: string;
    item_name: string;
    item_sku: string | null;
    category: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    discount_amount: number;
    modifiers: PosItemModifier[];
    created_at: string;
}

export interface PosItemModifier {
    name: string;
    value: string;
    price_adjustment?: number;
}

// ─── Webhook Events ───

export interface WebhookEvent {
    id: string;
    organization_id: string;
    connection_id: string;
    provider_event_type: string;
    payload_hash: string;
    raw_payload: Record<string, unknown>;
    status: WebhookEventStatus;
    processing_error: string | null;
    retry_count: number;
    max_retries: number;
    next_retry_at: string | null;
    received_at: string;
    processed_at: string | null;
    created_at: string;
}

// ─── Sync Events ───

export interface SyncEvent {
    id: string;
    organization_id: string;
    connection_id: string;
    direction: "inbound" | "outbound";
    entity_type: string;
    entity_id: string | null;
    provider_entity_id: string | null;
    status: SyncEventStatus;
    error_message: string | null;
    records_processed: number;
    records_failed: number;
    duration_ms: number | null;
    conflict_field: string | null;
    conflict_local: string | null;
    conflict_remote: string | null;
    resolution: string | null;
    created_at: string;
}

// ─── Sync Conflict Policies ───

export interface SyncConflictPolicy {
    id: string;
    organization_id: string;
    connection_id: string;
    entity_type: string;
    field_name: string;
    strategy: ConflictStrategy;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// ─── View / Computed Types ───

export interface ProviderConnectionWithStats extends ProviderConnection {
    total_syncs: number;
    failed_syncs: number;
    last_successful_sync_at: string | null;
    ticket_count: number;
    transaction_count: number;
}

export interface PosAggregate {
    event_id: string;
    foh_zone_id: string | null;
    category: PosCategory | null;
    total_revenue: number;
    total_transactions: number;
    total_refunds: number;
    net_revenue: number;
    avg_transaction_value: number;
    period_start: string;
    period_end: string;
}

// ─── Filter / Request Types ───

export interface ProviderConnectionFilters {
    provider_type?: ProviderType;
    event_id?: string;
    is_active?: boolean;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

export interface SyncLogFilters {
    connection_id?: string;
    direction?: "inbound" | "outbound";
    status?: SyncEventStatus;
    entity_type?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    page?: number;
    per_page?: number;
}

export interface PosTransactionFilters {
    connection_id?: string;
    event_id?: string;
    foh_zone_id?: string;
    category?: PosCategory;
    payment_method?: PosPaymentMethod;
    date_from?: string;
    date_to?: string;
    is_refund?: boolean;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    page?: number;
    per_page?: number;
}

export interface CreateProviderConnectionRequest {
    provider_type: ProviderType;
    display_name: string;
    event_id?: string;
    api_key?: string;
    api_secret?: string;
    webhook_secret?: string;
    sync_direction?: SyncDirection;
}

export interface UpdateProviderConnectionRequest {
    display_name?: string;
    api_key?: string;
    api_secret?: string;
    webhook_secret?: string;
    sync_direction?: SyncDirection;
    is_active?: boolean;
    rate_limit_config?: RateLimitConfig;
}

export interface CreateSyncConflictPolicyRequest {
    connection_id: string;
    entity_type: string;
    field_name: string;
    strategy: ConflictStrategy;
}
