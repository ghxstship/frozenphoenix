/* ═══════════════════════════════════════════════════════════════
   Production Advancing — Type Definitions
   Maps to migrations 047 (catalog), 048 (advances), 049 (RBAC)
   ═══════════════════════════════════════════════════════════════ */

// ─── Catalog Enums ───

export type CatalogCategoryType =
    | "access"
    | "production"
    | "technical"
    | "hospitality"
    | "travel"
    | "custom"
    | "site"
    | "food_beverage"
    | "retail"
    | "workplace"
    | "labor";

export type CatalogItemStatus = "active" | "discontinued" | "out_of_stock" | "seasonal" | "draft";

export type ModifierType = "single_select" | "multi_select" | "quantity" | "text" | "boolean";

export type PriceAdjustmentType = "flat" | "percentage" | "per_unit";

export type WeatherRating =
    | "indoor_only"
    | "sheltered"
    | "outdoor_rated"
    | "all_weather"
    | "not_applicable";

export type PricingTier = "basic" | "standard" | "premium";

// ─── Advance Enums ───

export type AdvanceType = "pre_event" | "load_in" | "show_day" | "strike" | "post_event";

export type AdvanceStatus =
    | "draft"
    | "submitted"
    | "in_review"
    | "approved"
    | "in_progress"
    | "fulfilled"
    | "completed"
    | "cancelled";

export type AdvancePriority = "low" | "medium" | "high" | "urgent" | "critical";

export type AdvanceItemStatus =
    | "pending"
    | "confirmed"
    | "in_transit"
    | "delivered"
    | "installed"
    | "operational"
    | "struck"
    | "returned"
    | "complete";

export type AdvanceHistoryEntityType = "advance" | "advance_item";

// ─── Catalog Entities ───

export interface CatalogCategory {
    id: string;
    organization_id: string | null;
    parent_id: string | null;
    name: string;
    slug: string;
    category_type: CatalogCategoryType;
    description: string | null;
    icon: string | null;
    sort_order: number;
    depth: number;
    item_count: number;
    is_active: boolean;
    unspsc_code: string | null;
    nigp_code: string | null;
    naics_code: string | null;
    category_code: string | null;
    subcategory_code: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    children?: CatalogCategory[] | undefined;
}

export interface CatalogItemSpecifications {
    make?: string | undefined;
    model?: string | undefined;
    dimensions?: string | undefined;
    weight?: string | undefined;
    power_requirements?: string | undefined;
    [key: string]: unknown;
}

export interface CatalogItem {
    id: string;
    organization_id: string | null;
    category_id: string;
    name: string;
    description: string | null;
    sku: string | null;
    hierarchical_sku: string | null;
    common_name: string | null;
    make: string | null;
    model: string | null;
    specifications: CatalogItemSpecifications;
    tags: string[];
    search_aliases: string[];
    options: string[];
    modifiers_summary: string | null;
    prerequisites: string | null;
    pricing_unit: string | null;
    lead_time_hours: number;
    setup_time: string | null;
    strike_time: string | null;
    crew_required: string | null;
    power_requirements: string | null;
    footprint: string | null;
    truck_space: string | null;
    weather: WeatherRating;
    compliance_tags: string[];
    sustainability_tags: string[];
    unspsc_code: string | null;
    default_unit_cost: number;
    currency: string;
    unit_of_measure: string;
    status: CatalogItemStatus;
    is_custom: boolean;
    is_critical_path: boolean;
    client_visible: boolean;
    image_url: string | null;
    thumbnail_url: string | null;
    available_quantity: number;
    min_lead_time_days: number;
    sort_order: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CatalogItemModifier {
    id: string;
    catalog_item_id: string;
    organization_id: string | null;
    name: string;
    description: string | null;
    modifier_type: ModifierType;
    is_required: boolean;
    min_selections: number;
    max_selections: number | null;
    sort_order: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    options?: CatalogModifierOption[] | undefined;
}

export interface CatalogModifierOption {
    id: string;
    modifier_id: string;
    label: string;
    value: string;
    price_adjustment: number;
    adjustment_type: PriceAdjustmentType;
    is_default: boolean;
    sort_order: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CatalogOrgOverride {
    id: string;
    organization_id: string;
    catalog_item_id: string;
    unit_cost: number | null;
    currency: string;
    preferred_vendor_id: string | null;
    available_quantity: number;
    reserved_quantity: number;
    is_active: boolean;
    pricing_notes: string | null;
    lead_time_days: number;
    minimum_order_quantity: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CatalogPricingTier {
    id: string;
    catalog_item_id: string;
    tier: PricingTier;
    currency: string;
    price_low: number;
    price_high: number;
    created_at: string;
    updated_at: string;
}

// ─── Catalog View Types (computed from joins) ───

export interface CatalogItemWithOverride extends CatalogItem {
    effective_cost: number;
    effective_is_active: boolean;
    preferred_vendor_id: string | null;
    org_available_quantity: number | null;
    org_reserved_quantity: number | null;
    org_lead_time_days: number | null;
    org_minimum_order_quantity: number | null;
    org_pricing_notes: string | null;
    category?: CatalogCategory | undefined;
    modifiers?: CatalogItemModifier[] | undefined;
}

// ─── Advance Entities ───

export interface ProductionAdvance {
    id: string;
    organization_id: string;
    event_id: string;
    project_id: string | null;
    submitted_by: string | null;
    point_of_contact: string | null;
    approved_by: string | null;
    advance_number: string;
    title: string;
    description: string | null;
    advance_type: AdvanceType;
    status: AdvanceStatus;
    priority: AdvancePriority;
    service_start_date: string | null;
    service_end_date: string | null;
    service_duration_days: number | null;
    total_estimated_cost: number;
    total_actual_cost: number;
    total_items: number;
    currency: string;
    workflow_instance_id: string | null;
    source_template_id: string | null;
    client_originated: boolean;
    internal_notes: string | null;
    client_notes: string | null;
    metadata: Record<string, unknown>;
    submitted_at: string | null;
    approved_at: string | null;
    fulfilled_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface SelectedModifier {
    modifier_id: string;
    modifier_name: string;
    option_id: string;
    option_label: string;
    option_value: string;
    price_adjustment: number;
    adjustment_type: PriceAdjustmentType;
}

export interface ProductionAdvanceItem {
    id: string;
    advance_id: string;
    catalog_item_id: string;
    category_id: string | null;
    vendor_id: string | null;
    assigned_to: string | null;
    quantity_requested: number;
    quantity_confirmed: number | null;
    selected_modifiers: SelectedModifier[];
    item_specifications: Record<string, unknown>;
    status: AdvanceItemStatus;
    unit_cost: number;
    total_cost: number;
    scheduled_delivery: string | null;
    actual_delivery: string | null;
    load_in_time: string | null;
    strike_time: string | null;
    delivery_zone: string | null;
    delivery_location: string | null;
    location_id: string | null;
    is_critical_path: boolean;
    dependencies: string[];
    notes: string | null;
    operational_purpose: string | null;
    special_requests: string | null;
    start_date: string | null;
    end_date: string | null;
    duration_days: number | null;
    budget_line_id: string | null;
    reservation_id: string | null;
    confirmed_at: string | null;
    delivered_at: string | null;
    installed_at: string | null;
    struck_at: string | null;
    returned_at: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface AdvanceStatusHistory {
    id: string;
    entity_type: AdvanceHistoryEntityType;
    entity_id: string;
    from_status: string | null;
    to_status: string;
    changed_by: string | null;
    reason: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface AdvanceTemplateItem {
    catalog_item_id: string;
    quantity: number;
    selected_modifiers?: SelectedModifier[] | undefined;
    notes?: string | undefined;
    is_critical_path?: boolean | undefined;
}

export interface AdvanceTemplate {
    id: string;
    organization_id: string;
    created_by: string | null;
    name: string;
    description: string | null;
    advance_type: AdvanceType;
    template_items: AdvanceTemplateItem[];
    is_public: boolean;
    use_count: number;
    tags: string[];
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Join Types (for React Query hooks) ───

export interface ProductionAdvanceWithJoins extends ProductionAdvance {
    events?: { name: string } | null | undefined;
    projects?: { name: string } | null | undefined;
    submitted_by_profile?: { name: string; avatar_url: string | null } | null | undefined;
    point_of_contact_profile?: { name: string; avatar_url: string | null } | null | undefined;
    approved_by_profile?: { name: string } | null | undefined;
    items?: ProductionAdvanceItemWithJoins[] | undefined;
}

export interface ProductionAdvanceItemWithJoins extends ProductionAdvanceItem {
    catalog_items?:
        | { name: string; sku: string | null; thumbnail_url: string | null }
        | null
        | undefined;
    catalog_categories?:
        | { name: string; slug: string; category_type: CatalogCategoryType }
        | null
        | undefined;
    locations?: { name: string } | null | undefined;
    vendors?: { name: string } | null | undefined;
    assigned_to_profile?: { name: string } | null | undefined;
}

// ─── Advance Cart Types (client-side Zustand store — lightweight) ───

export interface AdvanceCartItem {
    catalog_item_id: string;
    category_id?: string | undefined;
    name: string;
    sku?: string | undefined;
    thumbnail_url?: string | undefined;
    vendor_id?: string | undefined;
    quantity: number;
    unit_cost: number;
    selected_modifiers?: SelectedModifier[] | undefined;
    item_specifications?: Record<string, unknown> | undefined;
    notes?: string | null | undefined;
    is_critical_path: boolean;
    delivery_zone?: string | undefined;
    delivery_location?: string | undefined;
    location_id?: string | undefined;
    scheduled_delivery?: string | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    operational_purpose?: string | undefined;
    special_requests?: string | undefined;
}

export interface AdvanceCartState {
    items: AdvanceCartItem[];
    event_id: string;
    project_id: string | undefined;
    advance_type: AdvanceType;
    priority: AdvancePriority;
    title: string;
    description: string;
    total_items: number;
    total_estimated_cost: number;
    service_start_date?: string | undefined;
    service_end_date?: string | undefined;
    source_template_id?: string | undefined;
}

// ─── Cart Types (client-side Zustand store) ───

export interface CartItem {
    catalog_item_id: string;
    category_id: string | null;
    catalog_item: CatalogItemWithOverride;
    quantity: number;
    unit_cost: number;
    selected_modifiers: SelectedModifier[];
    item_specifications: Record<string, unknown>;
    notes: string | null;
    is_critical_path: boolean;
    delivery_zone: string | null;
    delivery_location: string | null;
    location_id: string | null;
    scheduled_delivery: string | null;
    start_date: string | null;
    end_date: string | null;
    operational_purpose: string | null;
    special_requests: string | null;
}

export interface CartState {
    items: CartItem[];
    event_id: string | null;
    project_id: string | null;
    advance_type: AdvanceType;
    title: string;
    description: string;
    priority: AdvancePriority;
    service_start_date: string | null;
    service_end_date: string | null;
    internal_notes: string;
    client_notes: string;
    source_template_id: string | null;
}

// ─── API Request/Response Types ───

export interface CreateAdvanceRequest {
    event_id: string;
    project_id?: string | undefined;
    title: string;
    description?: string | undefined;
    advance_type: AdvanceType;
    priority?: AdvancePriority | undefined;
    service_start_date?: string | undefined;
    service_end_date?: string | undefined;
    internal_notes?: string | undefined;
    client_notes?: string | undefined;
    source_template_id?: string | undefined;
    items: CreateAdvanceItemRequest[];
}

export interface CreateAdvanceItemRequest {
    catalog_item_id: string;
    category_id?: string | undefined;
    quantity_requested: number;
    unit_cost: number;
    selected_modifiers?: SelectedModifier[] | undefined;
    item_specifications?: Record<string, unknown> | undefined;
    vendor_id?: string | undefined;
    notes?: string | undefined;
    is_critical_path?: boolean | undefined;
    delivery_zone?: string | undefined;
    delivery_location?: string | undefined;
    location_id?: string | undefined;
    scheduled_delivery?: string | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    operational_purpose?: string | undefined;
    special_requests?: string | undefined;
}

export interface UpdateAdvanceRequest {
    title?: string | undefined;
    description?: string | undefined;
    advance_type?: AdvanceType | undefined;
    priority?: AdvancePriority | undefined;
    service_start_date?: string | undefined;
    service_end_date?: string | undefined;
    point_of_contact?: string | undefined;
    internal_notes?: string | undefined;
    client_notes?: string | undefined;
}

export interface AdvanceStatusTransitionRequest {
    status: AdvanceStatus;
    reason?: string | undefined;
}

export interface AdvanceItemStatusTransitionRequest {
    status: AdvanceItemStatus;
    reason?: string | undefined;
    quantity_confirmed?: number | undefined;
}

// ─── Filter/Query Types ───

export interface AdvanceListFilters {
    status?: AdvanceStatus | AdvanceStatus[] | undefined;
    advance_type?: AdvanceType | undefined;
    priority?: AdvancePriority | undefined;
    event_id?: string | undefined;
    project_id?: string | undefined;
    submitted_by?: string | undefined;
    search?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
    sort_by?: "created_at" | "updated_at" | "total_estimated_cost" | "advance_number" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    page?: number | undefined;
    per_page?: number | undefined;
}

export interface CatalogSearchFilters {
    category_id?: string | undefined;
    category_type?: CatalogCategoryType | undefined;
    search?: string | undefined;
    status?: CatalogItemStatus | undefined;
    is_critical_path?: boolean | undefined;
    tags?: string[] | undefined;
    min_cost?: number | undefined;
    max_cost?: number | undefined;
    sort_by?: "name" | "default_unit_cost" | "sort_order" | "created_at" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    page?: number | undefined;
    per_page?: number | undefined;
}
