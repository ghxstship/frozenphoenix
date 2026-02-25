// ═══════════════════════════════════════════════════════════════
// Types for Migration 022: Audit Remediation
// ═══════════════════════════════════════════════════════════════

// ─── F1: Goods Receipt Lines ───
export interface GoodsReceiptLine {
    id: string;
    goods_receipt_id: string;
    po_item_id: string | null;
    description: string;
    quantity_ordered: number;
    quantity_received: number;
    quantity_rejected: number;
    unit_price: number | null;
    line_total: number;
    condition: GoodsReceiptLineCondition;
    notes: string | null;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export type GoodsReceiptLineCondition = "good" | "damaged" | "partial";

// ─── F2: Currency & Exchange Rates ───
export type CurrencyCode =
    | "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "CHF" | "CNY"
    | "INR" | "BRL" | "MXN" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK"
    | "NOK" | "DKK" | "ZAR" | "AED";

export interface ExchangeRate {
    id: string;
    base_currency: CurrencyCode;
    target_currency: CurrencyCode;
    rate: number;
    effective_date: string;
    source: string;
    organization_id: string;
    created_at: string;
}

// ─── F4: Financial Periods ───
export type FinancialPeriodStatus = "open" | "soft_close" | "hard_close";

export interface FinancialPeriod {
    id: string;
    period_name: string;
    start_date: string;
    end_date: string;
    status: FinancialPeriodStatus;
    closed_by: string | null;
    closed_at: string | null;
    notes: string | null;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── X1: Incident Insurance Links ───
export type InsuranceClaimStatus = "pending" | "filed" | "under_review" | "approved" | "denied" | "settled";

export interface IncidentInsuranceLink {
    id: string;
    incident_id: string;
    insurance_policy_id: string;
    claim_number: string | null;
    claim_status: InsuranceClaimStatus;
    claim_amount: number | null;
    settlement_amount: number | null;
    notes: string | null;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── O3: SLA Definitions & Tracking ───
export type SlaTargetType =
    | "task_completion" | "approval_turnaround" | "incident_response"
    | "invoice_payment" | "deliverable_review" | "onboarding_completion"
    | "support_response" | "change_order_approval";

export type SlaStatus = "on_track" | "at_risk" | "breached";

export interface SlaDefinition {
    id: string;
    name: string;
    target_type: SlaTargetType;
    target_hours: number;
    warning_percent: number;
    applies_to_role: string | null;
    is_active: boolean;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface SlaTracking {
    id: string;
    sla_definition_id: string;
    entity_type: string;
    entity_id: string;
    started_at: string;
    due_at: string;
    completed_at: string | null;
    status: SlaStatus;
    elapsed_hours: number;
    organization_id: string;
    created_at: string;
}

// ─── O4: Resilience Targets ───
export type ResilienceTestResult = "passed" | "failed" | "partial";

export interface ResilienceTarget {
    id: string;
    service_name: string;
    rto_minutes: number;
    rpo_minutes: number;
    backup_frequency: string;
    last_tested_at: string | null;
    test_result: ResilienceTestResult | null;
    notes: string | null;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── S6: Idempotency Keys ───
export interface IdempotencyKey {
    key: string;
    entity_type: string;
    entity_id: string | null;
    response_status: number | null;
    organization_id: string;
    created_at: string;
    expires_at: string;
}

// ─── X2: Domain Events ───
export type DomainEventStatus = "pending" | "delivered" | "failed" | "expired";

export interface DomainEvent {
    id: string;
    event_type: string;
    source_domain: string;
    target_domain: string | null;
    entity_type: string;
    entity_id: string;
    payload: Record<string, unknown>;
    status: DomainEventStatus;
    processed_at: string | null;
    error_message: string | null;
    organization_id: string;
    created_at: string;
}

// ─── P1+P2: Data Export & Anonymization ───
export type DataExportStatus = "requested" | "processing" | "ready" | "downloaded" | "expired";
export type AnonymizationStatus = "pending" | "processing" | "completed" | "failed";

export interface DataExportRequest {
    id: string;
    user_id: string;
    export_format: "json" | "csv";
    status: DataExportStatus;
    file_path: string | null;
    file_size_bytes: number | null;
    requested_at: string;
    completed_at: string | null;
    expires_at: string | null;
    organization_id: string;
    created_at: string;
}

export interface AnonymizationQueueItem {
    id: string;
    user_profile_id: string;
    scheduled_for: string;
    processed_at: string | null;
    status: AnonymizationStatus;
    error_message: string | null;
    organization_id: string;
    created_at: string;
}
