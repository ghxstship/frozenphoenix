/* ═══════════════════════════════════════════════════════════════
   Digital Asset Lifecycle Types (Migration 014)
   ═══════════════════════════════════════════════════════════════ */

// ─── Storage Abstraction ───

export type StorageProvider = 'supabase_storage' | 's3' | 'gcs' | 'azure_blob' | 'external_url';
export type ProcessingStatus = 'uploading' | 'processing' | 'ready' | 'error';

export interface StorageObject {
    id: string;
    provider: StorageProvider;
    bucket_id: string;
    object_path: string;
    original_filename: string;
    mime_type: string;
    size_bytes: number;
    checksum_sha256: string | null;
    storage_url: string;
    cdn_url: string | null;
    thumbnail_url: string | null;
    preview_url: string | null;
    processing_status: ProcessingStatus;
    processing_error: string | null;
    is_deduplicated: boolean;
    canonical_object_id: string | null;
    organization_id: string;
    created_by: string | null;
    created_at: string;
}

// ─── Asset Classification ───

export type AssetClassL1 =
    | 'document'
    | 'legal'
    | 'engineering'
    | 'creative'
    | 'media'
    | 'production'
    | 'knowledge'
    | 'financial'
    | 'identity';

export type ScopeLevel =
    | 'global'
    | 'company'
    | 'project'
    | 'location'
    | 'activation'
    | 'event'
    | 'task'
    | 'vendor'
    | 'worker'
    | 'department'
    | 'personal';

export type AssetStatus =
    | 'draft'
    | 'pending_review'
    | 'in_review'
    | 'approved'
    | 'published'
    | 'active'
    | 'superseded'
    | 'archived'
    | 'expired'
    | 'deleted';

export type AssetSensitivity = 'public' | 'internal' | 'confidential' | 'restricted';

export type FunctionalDomain =
    | 'sales'
    | 'legal'
    | 'production'
    | 'creative'
    | 'finance'
    | 'hr'
    | 'operations'
    | 'logistics'
    | 'client_facing'
    | 'internal';

// ─── Core Metadata ───

export interface DigitalAsset {
    id: string;
    asset_class: string;
    asset_class_l1: AssetClassL1;
    asset_class_l2: string;
    name: string;
    filename: string;
    description: string | null;
    scope_level: ScopeLevel;
    scope_entity_id: string | null;
    domains: FunctionalDomain[];
    status: AssetStatus;
    published_at: string | null;
    archived_at: string | null;
    expires_at: string | null;
    current_version_id: string | null;
    owner_id: string;
    created_by: string | null;
    updated_by: string | null;
    document_number: string | null;
    last_reviewed_at: string | null;
    next_review_date: string | null;
    reviewer_ids: string[];
    requires_acknowledgment: boolean;
    sensitivity: AssetSensitivity;
    data_purpose: string | null;
    retention_policy_id: string | null;
    custom_metadata: Record<string, unknown>;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── Version History ───

export type VersionChangeType =
    | 'create'
    | 'update'
    | 'amendment'
    | 'revision'
    | 'correction'
    | 'reformat'
    | 'merge';

export interface AssetVersion {
    id: string;
    asset_id: string;
    version_number: number;
    version_label: string | null;
    is_major: boolean;
    storage_object_id: string | null;
    content: Record<string, unknown> | null;
    content_text: string | null;
    mime_type: string | null;
    size_bytes: number | null;
    checksum: string | null;
    change_description: string | null;
    change_type: VersionChangeType;
    diff_from_previous: Record<string, unknown> | null;
    created_by: string | null;
    created_at: string;
}

// ─── Entity-Asset Linking ───

export type AssetLinkType =
    | 'primary'
    | 'attachment'
    | 'reference'
    | 'deliverable'
    | 'evidence'
    | 'template_source'
    | 'supersedes';

export type AssetEntityType =
    | 'project'
    | 'contract'
    | 'event'
    | 'activation'
    | 'location'
    | 'vendor'
    | 'crew_member'
    | 'task'
    | 'incident'
    | 'proposal'
    | 'expense'
    | 'work_order'
    | 'brand_kit'
    | 'case_study'
    | 'tech_sheet'
    | 'certification'
    | 'vendor_compliance'
    | 'scope_of_work'
    | 'client_invoice'
    | 'worker_profile';

export interface AssetLink {
    id: string;
    asset_id: string;
    entity_type: AssetEntityType;
    entity_id: string;
    link_type: AssetLinkType;
    link_role: string | null;
    display_order: number;
    is_pinned: boolean;
    effective_from: string | null;
    effective_until: string | null;
    notes: string | null;
    organization_id: string;
    created_by: string | null;
    created_at: string;
}

// ─── Tag System ───

export interface AssetTag {
    id: string;
    name: string;
    slug: string;
    tag_group: string | null;
    color: string | null;
    organization_id: string;
    created_at: string;
}

export interface AssetTagAssignment {
    asset_id: string;
    tag_id: string;
}

// ─── Access Control ───

export interface AssetAccessControl {
    id: string;
    asset_id: string;
    user_id: string | null;
    role: string | null;
    team_id: string | null;
    can_view: boolean;
    can_download: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_share: boolean;
    can_approve: boolean;
    granted_at: string;
    expires_at: string | null;
    granted_by: string | null;
    organization_id: string;
}

// ─── Audit Trail ───

export type AssetAccessAction =
    | 'viewed'
    | 'downloaded'
    | 'previewed'
    | 'printed'
    | 'shared'
    | 'linked'
    | 'unlinked'
    | 'versioned'
    | 'status_changed'
    | 'permissions_changed'
    | 'deleted'
    | 'restored'
    | 'exported';

export type AccessActorType = 'user' | 'system' | 'api' | 'portal';

export interface AssetAccessLogEntry {
    id: string;
    asset_id: string;
    version_id: string | null;
    user_id: string | null;
    actor_type: AccessActorType;
    action: AssetAccessAction;
    ip_address: string | null;
    user_agent: string | null;
    context: Record<string, unknown>;
    created_at: string;
}

// ─── Retention Policies ───

export type RetentionTrigger =
    | 'creation'
    | 'expiration'
    | 'project_closure'
    | 'contract_termination'
    | 'last_access'
    | 'manual';

export type RetentionAction = 'archive' | 'delete' | 'review' | 'notify_owner';
export type ExpirationAction = 'archive' | 'delete' | 'notify_owner' | 'lock' | 'none';

export interface AssetRetentionPolicy {
    id: string;
    name: string;
    description: string | null;
    applies_to_class: string | null;
    applies_to_scope: string | null;
    applies_to_sensitivity: string | null;
    retention_period_days: number | null;
    retention_trigger: RetentionTrigger;
    on_retention_reached: RetentionAction;
    on_expiration: ExpirationAction;
    warning_days_before: number[];
    legal_hold_exempt: boolean;
    is_active: boolean;
    organization_id: string;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Legal Holds ───

export type LegalHoldType = 'litigation' | 'regulatory' | 'investigation' | 'audit';
export type LegalHoldScope = 'asset' | 'project' | 'company' | 'vendor' | 'global';

export interface LegalHold {
    id: string;
    name: string;
    description: string | null;
    hold_type: LegalHoldType;
    scope_type: LegalHoldScope;
    scope_entity_id: string | null;
    is_active: boolean;
    placed_at: string;
    released_at: string | null;
    placed_by: string | null;
    released_by: string | null;
    matter_number: string | null;
    counsel_name: string | null;
    organization_id: string;
    created_at: string;
}

// ─── Asset Dependencies ───

export type DependencyType =
    | 'requires_approval'
    | 'requires_signature'
    | 'derived_from'
    | 'supersedes'
    | 'references'
    | 'bundles'
    | 'requires_upload';

export interface AssetDependency {
    id: string;
    asset_id: string;
    depends_on_asset_id: string;
    dependency_type: DependencyType;
    is_blocking: boolean;
    is_satisfied: boolean;
    satisfied_at: string | null;
    notes: string | null;
    organization_id: string;
    created_by: string | null;
    created_at: string;
}

// ─── Composite / Join-Aware Types ───

export interface DigitalAssetWithVersion extends DigitalAsset {
    current_version: AssetVersion | null;
}

export interface DigitalAssetWithLinks extends DigitalAsset {
    links: AssetLink[];
}

export interface DigitalAssetWithTags extends DigitalAsset {
    tags: AssetTag[];
}

export interface DigitalAssetFull extends DigitalAsset {
    current_version: AssetVersion | null;
    links: AssetLink[];
    tags: AssetTag[];
    versions: AssetVersion[];
    dependencies: AssetDependency[];
    access_controls: AssetAccessControl[];
}

export interface AssetVersionWithStorage extends AssetVersion {
    storage_object: StorageObject | null;
}
