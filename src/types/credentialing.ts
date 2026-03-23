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

export type CredentialFormat = "wristband" | "badge" | "lanyard" | "digital" | "rfid" | "ticket";

export type CredentialScanType = "check_in" | "check_out" | "verify" | "deny";

export type ScanResult = "valid" | "denied" | "expired" | "revoked" | "zone_denied" | "flagged";

export type ScanMethodType = "keyboard" | "camera" | "rfid" | "nfc" | "file" | "api";

export type IdentifierType = "barcode" | "rfid" | "nfc" | "auto";

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
    nfc_serial: string | null;
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
    scan_method: ScanMethodType;
    scanned_identifier: string | null;
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
    value?: string | undefined;
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
    transform?: string | undefined;
    include: boolean;
}

// ─── View / Computed Types ───

export interface CredentialPoolWithType extends CredentialInventoryPool {
    credential_type?: CredentialType | undefined;
    available_count: number;
    utilization_percent: number;
}

export interface CredentialAssignmentWithDetails extends CredentialAssignment {
    credential_type?: CredentialType | undefined;
    pool?: CredentialInventoryPool | undefined;
    scan_count?: number | undefined;
    last_scan?: CredentialScanLog | null | undefined;
}

// ─── Filter / Request Types ───

export interface CredentialAssignmentFilters {
    pool_id?: string | undefined;
    credential_type_id?: string | undefined;
    status?: CredentialAssignmentStatus | CredentialAssignmentStatus[] | undefined;
    event_id?: string | undefined;
    assignee_name?: string | undefined;
    zone_access?: string | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    page?: number | undefined;
    per_page?: number | undefined;
}

export interface CredentialPoolFilters {
    event_id?: string | undefined;
    credential_type_id?: string | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
}

export interface CreateCredentialTypeRequest {
    name: string;
    category: CredentialCategory;
    description?: string | undefined;
    tier_level?: number | undefined;
    color_hex?: string | undefined;
    default_zone_access?: string[] | undefined;
    format?: CredentialFormat | undefined;
}

export interface CreateCredentialPoolRequest {
    credential_type_id: string;
    event_id?: string | undefined;
    live_event_id?: string | undefined;
    total_quantity: number;
    valid_from?: string | undefined;
    valid_until?: string | undefined;
    notes?: string | undefined;
}

export interface AssignCredentialRequest {
    pool_id: string;
    credential_type_id: string;
    assignee_name: string;
    assignee_email?: string | undefined;
    profile_id?: string | undefined;
    crew_member_id?: string | undefined;
    vip_guest_id?: string | undefined;
    vendor_id?: string | undefined;
    zone_access?: string[] | undefined;
    valid_from?: string | undefined;
    valid_until?: string | undefined;
    notes?: string | undefined;
}

export interface ScanCredentialRequest {
    /** The scanned value — can be barcode, RFID tag, or NFC serial. */
    identifier: string;
    /** How to interpret the identifier. Default "auto" tries all. */
    identifier_type?: IdentifierType | undefined;
    scan_type: CredentialScanType;
    scan_method?: ScanMethodType | undefined;
    zone_id?: string | undefined;
    device_id?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    notes?: string | undefined;
}

export interface ScanCredentialResponse {
    result: ScanResult;
    assignment: CredentialAssignment | null;
    credential_type: CredentialType | null;
    message: string;
    matched_by?: IdentifierType | undefined;
    scan_method?: ScanMethodType | undefined;
}

export interface BulkImportRequest {
    entity_type: string;
    target_pool_id?: string | undefined;
    file_name: string;
    file_size_bytes?: number | undefined;
    rows: Record<string, unknown>[];
}

export interface ExportRequest {
    entity_type: string;
    template_id?: string | undefined;
    format: ExportFormat;
    filters?: Record<string, unknown> | undefined;
}
