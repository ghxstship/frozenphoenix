/* ═══════════════════════════════════════════════════════════════
   Credentialing & Ticketing — Type Definitions
   Maps to migrations 050 (credentialing), 051 (bulk/export)
   ═══════════════════════════════════════════════════════════════ */

// ─── Credential Enums ───

export type CredentialCategory =
    | "artist"
    | "vip"
    | "crew"
    | "media"
    | "vendor"
    | "general_admission"
    | "production"
    | "security"
    | "medical"
    | "hospitality"
    | "sponsor";

export type CredentialAssignmentStatus =
    | "requested"
    | "approved"
    | "issued"
    | "checked_in"
    | "checked_out"
    | "revoked"
    | "expired";

export type CredentialFormat =
    | "wristband"
    | "badge"
    | "lanyard"
    | "digital"
    | "rfid"
    | "ticket";

export type CredentialScanType = "check_in" | "check_out" | "verify" | "deny";

export type ScanResult =
    | "valid"
    | "denied"
    | "expired"
    | "revoked"
    | "zone_denied"
    | "flagged";

export type BulkJobStatus =
    | "pending"
    | "validating"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled";

export type ExportFormat = "csv" | "xlsx" | "pdf" | "json";

// ─── Credential Entities ───

export interface CredentialType {
    id: string;
    organization_id: string;
    name: string;
    category: CredentialCategory;
    description: string | null;
    tier_level: number;
    color_hex: string | null;
    default_zone_access: string[];
    format: CredentialFormat;
    is_active: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface CredentialInventoryPool {
    id: string;
    organization_id: string;
    credential_type_id: string;
    event_id: string | null;
    live_event_id: string | null;
    total_quantity: number;
    allocated_count: number;
    valid_from: string | null;
    valid_until: string | null;
    notes: string | null;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface CredentialAssignment {
    id: string;
    organization_id: string;
    pool_id: string;
    credential_type_id: string;
    profile_id: string | null;
    crew_member_id: string | null;
    vip_guest_id: string | null;
    vendor_id: string | null;
    assignee_name: string;
    assignee_email: string | null;
    barcode_value: string;
    rfid_tag: string | null;
    status: CredentialAssignmentStatus;
    zone_access: string[];
    valid_from: string | null;
    valid_until: string | null;
    approved_at: string | null;
    approved_by: string | null;
    issued_at: string | null;
    issued_by: string | null;
    checked_in_at: string | null;
    checked_out_at: string | null;
    revoked_at: string | null;
    revoked_by: string | null;
    revocation_reason: string | null;
    last_synced_at: string | null;
    external_id: string | null;
    notes: string | null;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface CredentialScanLog {
    id: string;
    organization_id: string;
    assignment_id: string;
    scan_type: CredentialScanType;
    scan_result: ScanResult;
    zone_id: string | null;
    device_id: string | null;
    latitude: number | null;
    longitude: number | null;
    scanned_by: string | null;
    scanned_at: string;
    notes: string | null;
    created_at: string;
}

// ─── Bulk Import/Export Entities ───

export interface BulkImportJob {
    id: string;
    organization_id: string;
    entity_type: string;
    target_pool_id: string | null;
    file_name: string;
    file_size_bytes: number | null;
    status: BulkJobStatus;
    total_rows: number;
    processed_rows: number;
    error_rows: number;
    skipped_rows: number;
    error_details: BulkImportError[];
    result_summary: Record<string, unknown>;
    started_at: string | null;
    completed_at: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface BulkImportError {
    row: number;
    field: string;
    message: string;
    value?: string;
}

export interface ExportTemplate {
    id: string;
    organization_id: string;
    name: string;
    entity_type: string;
    format: ExportFormat;
    column_mapping: ExportColumnMapping[];
    provider_key: string | null;
    include_branding: boolean;
    is_default: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface ExportColumnMapping {
    source_field: string;
    target_header: string;
    transform?: string;
    include: boolean;
}

// ─── View / Computed Types ───

export interface CredentialPoolWithType extends CredentialInventoryPool {
    credential_type?: CredentialType;
    available_count: number;
    utilization_percent: number;
}

export interface CredentialAssignmentWithDetails extends CredentialAssignment {
    credential_type?: CredentialType;
    pool?: CredentialInventoryPool;
    scan_count?: number;
    last_scan?: CredentialScanLog | null;
}

// ─── Filter / Request Types ───

export interface CredentialAssignmentFilters {
    pool_id?: string;
    credential_type_id?: string;
    status?: CredentialAssignmentStatus | CredentialAssignmentStatus[];
    event_id?: string;
    assignee_name?: string;
    zone_access?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    page?: number;
    per_page?: number;
}

export interface CredentialPoolFilters {
    event_id?: string;
    credential_type_id?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

export interface CreateCredentialTypeRequest {
    name: string;
    category: CredentialCategory;
    description?: string;
    tier_level?: number;
    color_hex?: string;
    default_zone_access?: string[];
    format?: CredentialFormat;
}

export interface CreateCredentialPoolRequest {
    credential_type_id: string;
    event_id?: string;
    live_event_id?: string;
    total_quantity: number;
    valid_from?: string;
    valid_until?: string;
    notes?: string;
}

export interface AssignCredentialRequest {
    pool_id: string;
    credential_type_id: string;
    assignee_name: string;
    assignee_email?: string;
    profile_id?: string;
    crew_member_id?: string;
    vip_guest_id?: string;
    vendor_id?: string;
    zone_access?: string[];
    valid_from?: string;
    valid_until?: string;
    notes?: string;
}

export interface ScanCredentialRequest {
    barcode_value: string;
    scan_type: CredentialScanType;
    zone_id?: string;
    device_id?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
}

export interface ScanCredentialResponse {
    result: ScanResult;
    assignment: CredentialAssignment | null;
    credential_type: CredentialType | null;
    message: string;
}

export interface BulkImportRequest {
    entity_type: string;
    target_pool_id?: string;
    file_name: string;
    file_size_bytes?: number;
    rows: Record<string, unknown>[];
}

export interface ExportRequest {
    entity_type: string;
    template_id?: string;
    format: ExportFormat;
    filters?: Record<string, unknown>;
}
