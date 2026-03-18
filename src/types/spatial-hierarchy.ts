/* ═══════════════════════════════════════════════════════════════
   ATLVS — Location Spatial Hierarchy Types
   Migration 020: Location Spatial Hierarchy & Lifecycle
   Architecture: docs/LOCATION_SPATIAL_HIERARCHY_ARCHITECTURE.md
   ═══════════════════════════════════════════════════════════════ */

// ─── Enums ───

export type LocationTypeExtended =
    // Sites & Campuses
    | "site"
    | "campus"
    | "complex"
    | "festival_grounds"
    // Venues
    | "venue"
    | "theater"
    | "arena"
    | "convention_center"
    | "club"
    | "park"
    | "stadium"
    // Operational
    | "office"
    | "warehouse"
    | "fabrication_shop"
    | "staging_area"
    // Hospitality
    | "hotel"
    | "airport"
    // Sub-spaces
    | "floor"
    | "space"
    | "room"
    | "exhibit_hall"
    | "stage"
    | "loading_dock"
    | "green_room"
    | "control_room"
    | "storage_room"
    | "breakout_room"
    // Outdoor
    | "outdoor_zone"
    | "parking_lot"
    | "perimeter"
    // Generic
    | "other";

export type LocationStatus =
    | "prospecting"
    | "onboarding"
    | "active"
    | "seasonal"
    | "maintenance"
    | "reconfiguring"
    | "archived";

export type LocationOwnership = "owned" | "leased" | "temporary" | "partner" | "client_provided";

export type ProjectLocationRole =
    | "primary"
    | "secondary"
    | "staging"
    | "storage"
    | "fabrication"
    | "backup"
    | "load_in"
    | "load_out";

export type SpaceBookingType =
    | "event"
    | "rehearsal"
    | "setup"
    | "strike"
    | "load_in"
    | "load_out"
    | "maintenance"
    | "hold"
    | "site_visit"
    | "inspection";

export type SpaceBookingStatus = "tentative" | "confirmed" | "cancelled";

export type LocationDocType =
    | "fire_cert"
    | "occupancy_permit"
    | "ada_cert"
    | "health_dept"
    | "env_assessment"
    | "insurance_cert"
    | "engineering_cert"
    | "noise_permit"
    | "alcohol_license"
    | "building_permit"
    | "zoning_approval"
    | "safety_plan"
    | "structural_report"
    | "electrical_cert"
    | "plumbing_cert";

export type LocComplianceDocStatus = "valid" | "expiring_soon" | "expired" | "pending" | "rejected";

export type LocationInspectionType =
    | "fire"
    | "safety"
    | "structural"
    | "electrical"
    | "plumbing"
    | "ada"
    | "health"
    | "environmental"
    | "security"
    | "general";

export type LocationInspectionResult = "passed" | "failed" | "conditional" | "pending";

export type LocationCostType =
    | "lease"
    | "rent"
    | "utilities"
    | "maintenance"
    | "insurance"
    | "security"
    | "cleaning"
    | "taxes"
    | "renovation"
    | "equipment"
    | "other";

export type LocationCostFrequency = "one_time" | "monthly" | "quarterly" | "annual" | "per_event";

export type LocationContactRole =
    | "venue_manager"
    | "building_ops"
    | "security"
    | "fire_marshal"
    | "loading_dock"
    | "catering"
    | "av_tech"
    | "facilities"
    | "emergency";

// ─── Core Entities ───

export interface SpatialLocation {
    id: string;
    organizationId: string;

    // Hierarchy
    parentLocationId: string | null;
    hierarchyDepth: number;
    hierarchyPath: string | null;

    // Identity
    name: string;
    code: string | null;
    type: LocationTypeExtended;
    status: LocationStatus;
    ownership: LocationOwnership | null;
    description: string | null;

    // Capacity
    capacity: number | null;
    capacitySeated: number | null;
    capacityStanding: number | null;
    capacityFireCode: number | null;
    squareFootage: number | null;
    floorNumber: number | null;

    // Address
    addressStreet1: string | null;
    addressStreet2: string | null;
    addressCity: string | null;
    addressState: string | null;
    addressPostalCode: string | null;
    addressCountry: string | null;
    coordinates: { lat: number; lng: number } | null;
    timezone: string | null;

    // Regulatory
    zoningClassification: string | null;
    regulatoryJurisdiction: string | null;
    isAdaAccessible: boolean | null;
    adaNotes: string | null;
    noiseCurfewTime: string | null;
    noiseMaxDb: number | null;
    alcoholLicense: boolean;
    outdoor: boolean;

    // Features
    climateControlled: boolean | null;
    securityLevel: string | null;
    powerAvailable: string | null;
    internetAvailable: boolean;
    amenities: string[];
    restrictions: string[];

    // Linked entities
    floorplanAssetId: string | null;
    primaryContactId: string | null;
    managerId: string | null;

    // Audit
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectLocation {
    id: string;
    projectId: string;
    locationId: string;
    role: ProjectLocationRole;
    accessStartDate: string | null;
    accessEndDate: string | null;
    loadInWindows: Record<string, unknown>[];
    loadOutWindows: Record<string, unknown>[];
    dailyRate: number | null;
    totalCost: number | null;
    notes: string | null;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

export interface SpaceBooking {
    id: string;
    locationId: string;
    projectId: string | null;
    eventId: string | null;
    activationId: string | null;
    bookedBy: string;
    bookingType: SpaceBookingType;
    status: SpaceBookingStatus;
    startDatetime: string;
    endDatetime: string;
    expectedAttendance: number | null;
    setupMinutesBefore: number;
    teardownMinutesAfter: number;
    notes: string | null;
    organizationId: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface EventSpaceOverlay {
    id: string;
    baseLocationId: string;
    overlayName: string;
    overlayType: LocationTypeExtended;
    projectId: string | null;
    eventId: string | null;
    capacityOverride: number | null;
    squareFootageOverride: number | null;
    restrictionsOverride: string[];
    layoutAssetId: string | null;
    startDate: string;
    endDate: string;
    notes: string | null;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

export interface LocationComplianceDoc {
    id: string;
    locationId: string;
    docType: LocationDocType;
    documentNumber: string | null;
    issuingAuthority: string | null;
    issuedDate: string | null;
    expiryDate: string | null;
    status: LocComplianceDocStatus;
    digitalAssetId: string | null;
    notes: string | null;
    organizationId: string;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LocationInspection {
    id: string;
    locationId: string;
    inspectionType: LocationInspectionType;
    inspectorName: string | null;
    inspectorOrg: string | null;
    inspectionDate: string;
    nextInspectionDate: string | null;
    result: LocationInspectionResult;
    findings: string | null;
    correctiveActions: string | null;
    correctiveDeadline: string | null;
    digitalAssetId: string | null;
    notes: string | null;
    organizationId: string;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LocationCost {
    id: string;
    locationId: string;
    costType: LocationCostType;
    description: string | null;
    amount: number;
    currency: string;
    frequency: LocationCostFrequency;
    effectiveDate: string | null;
    endDate: string | null;
    vendorId: string | null;
    contractId: string | null;
    projectId: string | null;
    notes: string | null;
    organizationId: string;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LocationContact {
    id: string;
    locationId: string;
    contactId: string;
    role: LocationContactRole;
    isPrimary: boolean;
    notes: string | null;
    organizationId: string;
    createdAt: string;
}

// ─── Composite Types (Views / Aggregations) ───

export interface LocationWithHierarchy extends SpatialLocation {
    breadcrumb: string;
    children?: LocationWithHierarchy[];
}

export interface LocationComplianceSummary {
    locationId: string;
    name: string;
    type: LocationTypeExtended;
    organizationId: string;
    totalDocs: number;
    validDocs: number;
    expiringDocs: number;
    expiredDocs: number;
    pendingDocs: number;
    rejectedDocs: number;
    nearestExpiry: string | null;
    totalInspections: number;
    passedInspections: number;
    failedInspections: number;
    lastInspectionDate: string | null;
}

export interface LocationProfitability {
    locationId: string;
    name: string;
    type: LocationTypeExtended;
    status: LocationStatus;
    organizationId: string;
    projectsServed: number;
    totalProjectRevenue: number;
    totalRecurringCosts: number;
    totalOnetimeCosts: number;
    netMargin: number;
    bookedHours: number;
    bookingCount: number;
}

// ─── Config Types ───

export interface LocationTypeConfig {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category:
        | "site"
        | "venue"
        | "operational"
        | "hospitality"
        | "sub_space"
        | "outdoor"
        | "generic";
    typicalDepth: number[];
}

export interface LocationStatusConfig {
    label: string;
    color: string;
}
