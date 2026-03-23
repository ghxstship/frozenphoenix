// ─────────────────────────────────────────────────────────────────────────────
// LIVE EVENT / SHOW / ACTIVATION OPERATIONS — Type Definitions
// Migration: 019_live_event_operations.sql
// Architecture: docs/LIVE_EVENT_OPERATIONS_ARCHITECTURE.md
// ─────────────────────────────────────────────────────────────────────────────

import type { AuditFields } from "./production";
import type { Department } from "./normalized";

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type LiveEventPhase =
    | "advance"
    | "load_in"
    | "setup"
    | "rehearsal"
    | "ready"
    | "live"
    | "hold"
    | "strike"
    | "wrapped";

export type CommandLayer = "command" | "tactical" | "operations";

export type CommandPositionType =
    // L1 Command
    | "event_commander"
    | "safety_officer"
    | "financial_officer"
    | "client_liaison"
    // L2 Tactical
    | "stage_manager"
    | "technical_director"
    | "logistics_lead"
    | "foh_manager"
    | "production_coordinator"
    // L3 Operations
    | "audio_lead"
    | "lighting_lead"
    | "video_lead"
    | "rigging_lead"
    | "stage_lead"
    | "crew_lead"
    | "security_lead"
    | "medical_lead"
    | "catering_lead"
    | "custom";

export type DepartmentLiveStatus =
    | "not_checked_in"
    | "setting_up"
    | "ready"
    | "active"
    | "issue"
    | "blocked"
    | "striking"
    | "wrapped";

export type ReadinessGateStatus = "not_started" | "in_progress" | "passed" | "failed" | "waived";

export type RosCueStatus =
    | "pending"
    | "standby"
    | "called"
    | "in_progress"
    | "completed"
    | "skipped"
    | "held";

export type CommChannelPriority = "emergency" | "critical" | "high" | "medium" | "low";

export type EquipmentLiveStatus =
    | "checked_in"
    | "deployed"
    | "standby"
    | "issue_reported"
    | "failed"
    | "being_repaired"
    | "struck"
    | "loaded_out";

export type FohZoneType =
    | "entry"
    | "general"
    | "vip"
    | "stage"
    | "fb"
    | "merch"
    | "amenity"
    | "medical"
    | "parking"
    | "accessibility";

export type VipTier = "bronze" | "silver" | "gold" | "platinum";

export type VipGuestStatus = "expected" | "arrived" | "in_venue" | "departed";

export type GuestIncidentType =
    | "complaint"
    | "injury"
    | "lost_item"
    | "accessibility"
    | "disturbance"
    | "ejection";

export type GuestIncidentSeverity = "minor" | "moderate" | "major";

export type StrikeDirection = "load_in" | "strike";

export type StrikeStepStatus = "pending" | "in_progress" | "completed" | "blocked" | "skipped";

export type AssetReturnCondition = "excellent" | "good" | "fair" | "damaged" | "missing";

export type ReconciliationStatus = "pending" | "reconciled" | "discrepancy" | "write_off";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type OtAlertLevel = "none" | "advisory" | "warning" | "alert" | "critical";

// ─────────────────────────────────────────────────────────────────────────────
// CORE: Live Event Instance
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveEventInstance extends AuditFields {
    id: string;
    eventId: string;
    activationId?: string | undefined;
    locationId?: string | undefined;
    projectId: string;

    // State Machine
    phase: LiveEventPhase;
    phaseChangedAt: string;
    phaseChangedBy?: string | undefined;
    // Operational Window
    scheduledLoadIn?: string | undefined;
    actualLoadIn?: string | undefined;
    scheduledDoors?: string | undefined;
    actualDoors?: string | undefined;
    scheduledShowStart?: string | undefined;
    actualShowStart?: string | undefined;
    scheduledShowEnd?: string | undefined;
    actualShowEnd?: string | undefined;
    scheduledStrikeComplete?: string | undefined;
    actualStrikeComplete?: string | undefined;
    // Capacity
    venueCapacity?: number | undefined;
    permittedCapacity?: number | undefined;
    currentAttendance: number;

    // Risk
    riskScore: number;
    riskLevel: RiskLevel;

    // Weather
    weatherStatus: string;
    weatherAlertLevel: string;

    // Notes
    notes?: string | undefined;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMAND & CONTROL
// ─────────────────────────────────────────────────────────────────────────────

export interface CommandPosition extends AuditFields {
    id: string;
    liveEventId: string;
    positionType: CommandPositionType;
    layer: CommandLayer;
    profileId: string;

    // Radio
    radioCallsign?: string | undefined;
    primaryChannelId?: string | undefined;
    // Contact
    mobileNumber?: string | undefined;
    // Status
    isActive: boolean;
    checkedInAt?: string | undefined;
    checkedOutAt?: string | undefined;
    // Custom
    customLabel?: string | undefined;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// READINESS GATES
// ─────────────────────────────────────────────────────────────────────────────

export interface ReadinessGate extends AuditFields {
    id: string;
    liveEventId: string;
    gateNumber: number;
    name: string;
    description?: string | undefined;
    // Verification
    verifierRole: CommandPositionType;
    verifiedById?: string | undefined;
    verifiedAt?: string | undefined;
    // Status
    status: ReadinessGateStatus;
    isBlocking: boolean;

    // Evidence
    evidenceNotes?: string | undefined;
    evidenceUrls: string[];

    // Linked compliance
    permitIds: string[];
    checklistIds: string[];

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENT STATUS
// ─────────────────────────────────────────────────────────────────────────────

export interface DepartmentStatus extends AuditFields {
    id: string;
    liveEventId: string;
    department: Department;
    departmentLeadId?: string | undefined;
    // Status
    status: DepartmentLiveStatus;
    statusChangedAt: string;

    // Details
    crewCount: number;
    crewCheckedIn: number;
    notes?: string | undefined;
    issues?: string | undefined;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RUN OF SHOW (Normalized Cues)
// ─────────────────────────────────────────────────────────────────────────────

export interface RosCue extends AuditFields {
    id: string;
    liveEventId: string;
    sequence: number;
    cueNumber: string;

    // Timing
    scheduledTime?: string | undefined;
    actualTime?: string | undefined;
    durationSeconds?: number | undefined;
    actualDurationSeconds?: number | undefined;
    // Content
    title: string;
    description?: string | undefined;
    department?: Department | undefined;
    responsibleId?: string | undefined;
    // Execution
    status: RosCueStatus;
    calledById?: string | undefined;
    calledAt?: string | undefined;
    // Flags
    isCritical: boolean;
    dependencies: string[];
    notes?: string | undefined;
    // Computed
    varianceSeconds?: number | undefined;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNICATION CHANNELS & LOG
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveCommChannel extends AuditFields {
    id: string;
    liveEventId: string;
    channelNumber: number;
    name: string;
    priority: CommChannelPriority;
    assignment: string;
    discipline?: string | undefined;
    isRestricted: boolean;

    organizationId: string;
}

export interface CommLogEntry {
    id: string;
    liveEventId: string;
    channelId?: string | undefined;
    senderId?: string | undefined;
    // Content
    message: string;
    messageType: string;

    // Timing
    loggedAt: string;

    // Linking
    incidentId?: string | undefined;
    cueId?: string | undefined;
    // Priority
    isDecision: boolean;
    isEscalation: boolean;

    organizationId: string;
    createdBy: string;
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE CREW ASSIGNMENTS
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveCrewAssignment extends AuditFields {
    id: string;
    liveEventId: string;
    crewMemberId: string;
    shiftId?: string | undefined;
    // Assignment
    department?: Department | undefined;
    zone?: string | undefined;
    roleDescription?: string | undefined;
    // Status
    checkedInAt?: string | undefined;
    checkedOutAt?: string | undefined;
    isActive: boolean;

    // Credentials
    credentialsVerified: boolean;
    credentialsVerifiedBy?: string | undefined;
    // Radio
    radioChannelId?: string | undefined;
    radioCallsign?: string | undefined;
    // Hours
    breakStart?: string | undefined;
    breakEnd?: string | undefined;
    totalBreakMinutes: number;
    hoursWorked: number;
    overtimeFlagged: boolean;

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EQUIPMENT CHECK-INS
// ─────────────────────────────────────────────────────────────────────────────

export interface EquipmentCheckIn extends AuditFields {
    id: string;
    liveEventId: string;
    assetId: string;
    assetAssignmentId?: string | undefined;
    // Check-in
    checkedInAt: string;
    checkedInBy?: string | undefined;
    conditionOnArrival: AssetReturnCondition;
    conditionNotes?: string | undefined;
    conditionPhotos: string[];

    // Deployment
    status: EquipmentLiveStatus;
    deployedLocation?: string | undefined;
    department?: Department | undefined;
    // Check-out
    checkedOutAt?: string | undefined;
    checkedOutBy?: string | undefined;
    conditionOnDeparture?: AssetReturnCondition | undefined;
    departureNotes?: string | undefined;
    departurePhotos: string[];

    // Quantity
    expectedQuantity: number;
    receivedQuantity: number;
    returnedQuantity?: number | undefined;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENTAL READINGS
// ─────────────────────────────────────────────────────────────────────────────

export interface EnvironmentalReading {
    id: string;
    liveEventId: string;
    recordedAt: string;
    recordedBy?: string | undefined;
    // Weather
    temperatureF?: number | undefined;
    humidityPercent?: number | undefined;
    windSpeedMph?: number | undefined;
    windGustsMph?: number | undefined;
    precipitation?: string | undefined;
    visibility?: string | undefined;
    weatherAlert?: string | undefined;
    weatherAlertSource?: string | undefined;
    // Noise
    noiseLevelDb?: number | undefined;
    noiseLocation?: string | undefined;
    // Power
    totalPowerLoadAmps?: number | undefined;
    powerCapacityAmps?: number | undefined;
    generatorFuelPercent?: number | undefined;
    // Notes
    notes?: string | undefined;
    organizationId: string;
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE FINANCIAL SNAPSHOTS
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveFinancialSnapshot {
    id: string;
    liveEventId: string;
    snapshotTime: string;
    capturedBy?: string | undefined;
    // Budget
    budgetTotal: number;
    spentToDate: number;
    committedNotSpent: number;

    // Labor
    laborRegular: number;
    laborOvertime: number;
    laborDoubleTime: number;

    // Cost categories
    equipmentCost: number;
    vendorCost: number;
    onsiteProcurement: number;

    // Revenue
    revenueTickets: number;
    revenueFb: number;
    revenueMerch: number;
    revenueOther: number;

    // Computed
    marginPercent?: number | undefined;
    burnRatePerHour?: number | undefined;
    projectedTotal?: number | undefined;
    // Alerts
    otAlertLevel: OtAlertLevel;

    organizationId: string;
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FRONT-OF-HOUSE: Zones & Readings
// ─────────────────────────────────────────────────────────────────────────────

export interface FohZone extends AuditFields {
    id: string;
    liveEventId: string;
    name: string;
    zoneType: FohZoneType;
    capacity?: number | undefined;
    locationDescription?: string | undefined;
    // Assignment
    zoneLeadId?: string | undefined;
    organizationId: string;
}

export interface FohZoneReading {
    id: string;
    zoneId: string;
    liveEventId: string;
    recordedAt: string;
    recordedBy?: string | undefined;
    // Crowd
    occupancyCount: number;
    entryRate: number;
    exitRate: number;
    queueLength: number;
    avgWaitMinutes: number;

    // Revenue
    salesAmount: number;
    transactionsCount: number;

    // Issues
    incidentsCount: number;
    notes?: string | undefined;
    organizationId: string;
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIP MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface VipGuest extends AuditFields {
    id: string;
    liveEventId: string;

    // Guest info
    name: string;
    affiliation?: string | undefined;
    tier: VipTier;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    // Arrival
    expectedArrival?: string | undefined;
    actualArrival?: string | undefined;
    // Service
    escortId?: string | undefined;
    zoneAccess: string[];
    dietaryRestrictions?: string | undefined;
    specialRequests?: string | undefined;
    // Status
    status: VipGuestStatus;
    notes?: string | undefined;
    organizationId: string;
}

export interface VipServiceRequest extends AuditFields {
    id: string;
    vipGuestId: string;
    liveEventId: string;

    // Request
    requestType: string;
    description: string;
    requestedAt: string;

    // Assignment
    assignedToId?: string | undefined;
    // Resolution
    status: "pending" | "in_progress" | "completed" | "cancelled";
    resolvedAt?: string | undefined;
    resolutionNotes?: string | undefined;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GUEST INCIDENTS
// ─────────────────────────────────────────────────────────────────────────────

export interface GuestIncident extends AuditFields {
    id: string;
    liveEventId: string;
    fohZoneId?: string | undefined;
    // Details
    type: GuestIncidentType;
    severity: GuestIncidentSeverity;
    description: string;
    reportedAt: string;
    reportedBy?: string | undefined;
    // Resolution
    status: "reported" | "investigating" | "resolved" | "closed";
    assignedToId?: string | undefined;
    resolution?: string | undefined;
    resolvedAt?: string | undefined;
    // Escalation
    escalatedToIncidentId?: string | undefined;
    // Guest info
    guestName?: string | undefined;
    guestContact?: string | undefined;
    compensationOffered?: string | undefined;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STRIKE SEQUENCES
// ─────────────────────────────────────────────────────────────────────────────

export interface StrikeSequence extends AuditFields {
    id: string;
    liveEventId: string;
    direction: StrikeDirection;
    sequence: number;

    // Task
    name: string;
    description?: string | undefined;
    department?: Department | undefined;
    responsibleId?: string | undefined;
    // Timing
    estimatedStart?: string | undefined;
    actualStart?: string | undefined;
    estimatedEnd?: string | undefined;
    actualEnd?: string | undefined;
    estimatedDurationMinutes?: number | undefined;
    actualDurationMinutes?: number | undefined;
    // Dependencies
    dependsOnIds: string[];

    // Status
    status: StrikeStepStatus;
    notes?: string | undefined;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSET RECONCILIATION
// ─────────────────────────────────────────────────────────────────────────────

export interface AssetReconciliationItem extends AuditFields {
    id: string;
    liveEventId: string;
    assetId: string;
    equipmentCheckInId?: string | undefined;
    // Reconciliation
    conditionOnReturn: AssetReturnCondition;
    conditionOnArrival?: AssetReturnCondition | undefined;
    reconciledBy?: string | undefined;
    reconciledAt?: string | undefined;
    // Status
    status: ReconciliationStatus;
    quantityExpected: number;
    quantityReturned?: number | undefined;
    quantityMissing: number;
    quantityDamaged: number;

    // Damage
    damageDescription?: string | undefined;
    damagePhotos: string[];
    estimatedRepairCost?: number | undefined;
    estimatedReplacementCost?: number | undefined;
    // Links
    incidentId?: string | undefined;
    vendorId?: string | undefined;
    insuranceClaimRecommended: boolean;

    // Notes
    notes?: string | undefined;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST-EVENT REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export interface PostEventReport extends AuditFields {
    id: string;
    liveEventId: string;
    compiledBy?: string | undefined;
    compiledAt?: string | undefined;
    // Attendance
    totalAttendance?: number | undefined;
    peakAttendance?: number | undefined;
    vipCount?: number | undefined;
    // Financial
    totalBudget?: number | undefined;
    totalSpent?: number | undefined;
    totalRevenue?: number | undefined;
    finalMarginPercent?: number | undefined;
    // Incidents
    totalIncidents: number;
    incidentsBySeverity: Record<string, number>;

    // Assets
    totalAssetsDeployed: number;
    assetsDamaged: number;
    assetsMissing: number;
    totalDamageCost: number;

    // Timeline
    loadInVarianceMinutes?: number | undefined;
    showStartVarianceMinutes?: number | undefined;
    showEndVarianceMinutes?: number | undefined;
    strikeVarianceMinutes?: number | undefined;
    // Vendor
    vendorScores: Record<string, number>;

    // Lessons
    lessonsLearned?: string | undefined;
    recommendations?: string | undefined;
    highlights?: string | undefined;
    challenges?: string | undefined;
    // Status
    status: "draft" | "in_review" | "approved" | "published";

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INCIDENT EXTENSIONS (added columns to existing incidents table)
// ─────────────────────────────────────────────────────────────────────────────

export interface IncidentLiveExtension {
    liveEventId?: string | undefined;
    eventPhase?: string | undefined;
    responseTeamIds: string[];
    firstResponderId?: string | undefined;
    responseTimeSeconds?: number | undefined;
    escalationLevel: number;
    autoEscalated: boolean;
    environmentalConditions?: Record<string, unknown> | undefined;
    medicalTransport: boolean;
    transportDestination?: string | undefined;
    oshaReportable: boolean;
    witnessStatements?: Record<string, unknown> | undefined;
    evidenceUrls: string[];
    insuranceNotified: boolean;
    insuranceNotifiedAt?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITE / CONVENIENCE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveEventFull extends LiveEventInstance {
    commandPositions: CommandPosition[];
    readinessGates: ReadinessGate[];
    departmentStatuses: DepartmentStatus[];
    rosCues: RosCue[];
    commChannels: LiveCommChannel[];
    crewAssignments: LiveCrewAssignment[];
    fohZones: FohZone[];
    vipGuests: VipGuest[];
    postEventReport?: PostEventReport | undefined;
}

export interface LiveEventSummary {
    id: string;
    eventId: string;
    projectId: string;
    phase: LiveEventPhase;
    riskScore: number;
    riskLevel: RiskLevel;
    currentAttendance: number;
    venueCapacity?: number | undefined;
    gatesCompleted: number;
    gatesTotal: number;
    departmentsReady: number;
    departmentsTotal: number;
    activeIncidents: number;
    cuesCompleted: number;
    cuesTotal: number;
    financialBurnPercent?: number | undefined;
}

export interface CommandDashboardData {
    liveEvent: LiveEventInstance;
    commandPositions: CommandPosition[];
    departmentStatuses: DepartmentStatus[];
    readinessGates: ReadinessGate[];
    activeIncidents: number;
    currentCue?: RosCue | undefined;
    nextCues: RosCue[];
    financialSnapshot?: LiveFinancialSnapshot | undefined;
    environmentalReading?: EnvironmentalReading | undefined;
    riskScore: number;
}

export interface StageManagerDashboardData {
    liveEvent: LiveEventInstance;
    rosCues: RosCue[];
    currentCue?: RosCue | undefined;
    nextCue?: RosCue | undefined;
    departmentStatuses: DepartmentStatus[];
    commChannels: LiveCommChannel[];
}

export interface SafetyDashboardData {
    liveEvent: LiveEventInstance;
    activeIncidents: GuestIncident[];
    opsIncidents: IncidentLiveExtension[];
    readinessGates: ReadinessGate[];
    environmentalReadings: EnvironmentalReading[];
    fohZoneReadings: FohZoneReading[];
    riskScore: number;
}

export interface FohDashboardData {
    liveEvent: LiveEventInstance;
    fohZones: FohZone[];
    latestReadings: FohZoneReading[];
    vipGuests: VipGuest[];
    guestIncidents: GuestIncident[];
    pendingServiceRequests: VipServiceRequest[];
}

export interface FinancialDashboardData {
    liveEvent: LiveEventInstance;
    latestSnapshot: LiveFinancialSnapshot;
    snapshots: LiveFinancialSnapshot[];
    otAlertLevel: OtAlertLevel;
    crewAssignments: LiveCrewAssignment[];
}
