// ─────────────────────────────────────────────────────────────────────────────
// LIVE EVENT / SHOW / ACTIVATION OPERATIONS — Type Definitions
// Migration: 019_live_event_operations.sql
// Architecture: docs/LIVE_EVENT_OPERATIONS_ARCHITECTURE.md
// ─────────────────────────────────────────────────────────────────────────────

import type { AuditFields } from './production';
import type { Department } from './normalized';

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type LiveEventPhase =
    | "advance" | "load_in" | "setup" | "rehearsal"
    | "ready" | "live" | "hold" | "strike" | "wrapped";

export type CommandLayer = "command" | "tactical" | "operations";

export type CommandPositionType =
    // L1 Command
    | "event_commander" | "safety_officer" | "financial_officer" | "client_liaison"
    // L2 Tactical
    | "stage_manager" | "technical_director" | "logistics_lead" | "foh_manager" | "production_coordinator"
    // L3 Operations
    | "audio_lead" | "lighting_lead" | "video_lead" | "rigging_lead" | "stage_lead"
    | "crew_lead" | "security_lead" | "medical_lead" | "catering_lead" | "custom";

export type DepartmentLiveStatus =
    | "not_checked_in" | "setting_up" | "ready" | "active"
    | "issue" | "blocked" | "striking" | "wrapped";

export type ReadinessGateStatus =
    | "not_started" | "in_progress" | "passed" | "failed" | "waived";

export type RosCueStatus =
    | "pending" | "standby" | "called" | "in_progress"
    | "completed" | "skipped" | "held";

export type CommChannelPriority = "emergency" | "critical" | "high" | "medium" | "low";

export type EquipmentLiveStatus =
    | "checked_in" | "deployed" | "standby" | "issue_reported"
    | "failed" | "being_repaired" | "struck" | "loaded_out";

export type FohZoneType =
    | "entry" | "general" | "vip" | "stage" | "fb"
    | "merch" | "amenity" | "medical" | "parking" | "accessibility";

export type VipTier = "bronze" | "silver" | "gold" | "platinum";

export type VipGuestStatus = "expected" | "arrived" | "in_venue" | "departed";

export type GuestIncidentType =
    | "complaint" | "injury" | "lost_item"
    | "accessibility" | "disturbance" | "ejection";

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
    activationId?: string;
    locationId?: string;
    projectId: string;

    // State Machine
    phase: LiveEventPhase;
    phaseChangedAt: string;
    phaseChangedBy?: string;

    // Operational Window
    scheduledLoadIn?: string;
    actualLoadIn?: string;
    scheduledDoors?: string;
    actualDoors?: string;
    scheduledShowStart?: string;
    actualShowStart?: string;
    scheduledShowEnd?: string;
    actualShowEnd?: string;
    scheduledStrikeComplete?: string;
    actualStrikeComplete?: string;

    // Capacity
    venueCapacity?: number;
    permittedCapacity?: number;
    currentAttendance: number;

    // Risk
    riskScore: number;
    riskLevel: RiskLevel;

    // Weather
    weatherStatus: string;
    weatherAlertLevel: string;

    // Notes
    notes?: string;

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
    radioCallsign?: string;
    primaryChannelId?: string;

    // Contact
    mobileNumber?: string;

    // Status
    isActive: boolean;
    checkedInAt?: string;
    checkedOutAt?: string;

    // Custom
    customLabel?: string;

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
    description?: string;

    // Verification
    verifierRole: CommandPositionType;
    verifiedById?: string;
    verifiedAt?: string;

    // Status
    status: ReadinessGateStatus;
    isBlocking: boolean;

    // Evidence
    evidenceNotes?: string;
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
    departmentLeadId?: string;

    // Status
    status: DepartmentLiveStatus;
    statusChangedAt: string;

    // Details
    crewCount: number;
    crewCheckedIn: number;
    notes?: string;
    issues?: string;

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
    scheduledTime?: string;
    actualTime?: string;
    durationSeconds?: number;
    actualDurationSeconds?: number;

    // Content
    title: string;
    description?: string;
    department?: Department;
    responsibleId?: string;

    // Execution
    status: RosCueStatus;
    calledById?: string;
    calledAt?: string;

    // Flags
    isCritical: boolean;
    dependencies: string[];
    notes?: string;

    // Computed
    varianceSeconds?: number;

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
    discipline?: string;
    isRestricted: boolean;

    organizationId: string;
}

export interface CommLogEntry {
    id: string;
    liveEventId: string;
    channelId?: string;
    senderId?: string;

    // Content
    message: string;
    messageType: string;

    // Timing
    loggedAt: string;

    // Linking
    incidentId?: string;
    cueId?: string;

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
    shiftId?: string;

    // Assignment
    department?: Department;
    zone?: string;
    roleDescription?: string;

    // Status
    checkedInAt?: string;
    checkedOutAt?: string;
    isActive: boolean;

    // Credentials
    credentialsVerified: boolean;
    credentialsVerifiedBy?: string;

    // Radio
    radioChannelId?: string;
    radioCallsign?: string;

    // Hours
    breakStart?: string;
    breakEnd?: string;
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
    assetAssignmentId?: string;

    // Check-in
    checkedInAt: string;
    checkedInBy?: string;
    conditionOnArrival: AssetReturnCondition;
    conditionNotes?: string;
    conditionPhotos: string[];

    // Deployment
    status: EquipmentLiveStatus;
    deployedLocation?: string;
    department?: Department;

    // Check-out
    checkedOutAt?: string;
    checkedOutBy?: string;
    conditionOnDeparture?: AssetReturnCondition;
    departureNotes?: string;
    departurePhotos: string[];

    // Quantity
    expectedQuantity: number;
    receivedQuantity: number;
    returnedQuantity?: number;

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENTAL READINGS
// ─────────────────────────────────────────────────────────────────────────────

export interface EnvironmentalReading {
    id: string;
    liveEventId: string;
    recordedAt: string;
    recordedBy?: string;

    // Weather
    temperatureF?: number;
    humidityPercent?: number;
    windSpeedMph?: number;
    windGustsMph?: number;
    precipitation?: string;
    visibility?: string;
    weatherAlert?: string;
    weatherAlertSource?: string;

    // Noise
    noiseLevelDb?: number;
    noiseLocation?: string;

    // Power
    totalPowerLoadAmps?: number;
    powerCapacityAmps?: number;
    generatorFuelPercent?: number;

    // Notes
    notes?: string;

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
    capturedBy?: string;

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
    marginPercent?: number;
    burnRatePerHour?: number;
    projectedTotal?: number;

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
    capacity?: number;
    locationDescription?: string;

    // Assignment
    zoneLeadId?: string;

    organizationId: string;
}

export interface FohZoneReading {
    id: string;
    zoneId: string;
    liveEventId: string;
    recordedAt: string;
    recordedBy?: string;

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
    notes?: string;

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
    affiliation?: string;
    tier: VipTier;
    contactEmail?: string;
    contactPhone?: string;

    // Arrival
    expectedArrival?: string;
    actualArrival?: string;

    // Service
    escortId?: string;
    zoneAccess: string[];
    dietaryRestrictions?: string;
    specialRequests?: string;

    // Status
    status: VipGuestStatus;
    notes?: string;

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
    assignedToId?: string;

    // Resolution
    status: "pending" | "in_progress" | "completed" | "cancelled";
    resolvedAt?: string;
    resolutionNotes?: string;

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GUEST INCIDENTS
// ─────────────────────────────────────────────────────────────────────────────

export interface GuestIncident extends AuditFields {
    id: string;
    liveEventId: string;
    fohZoneId?: string;

    // Details
    type: GuestIncidentType;
    severity: GuestIncidentSeverity;
    description: string;
    reportedAt: string;
    reportedBy?: string;

    // Resolution
    status: "reported" | "investigating" | "resolved" | "closed";
    assignedToId?: string;
    resolution?: string;
    resolvedAt?: string;

    // Escalation
    escalatedToIncidentId?: string;

    // Guest info
    guestName?: string;
    guestContact?: string;
    compensationOffered?: string;

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
    description?: string;
    department?: Department;
    responsibleId?: string;

    // Timing
    estimatedStart?: string;
    actualStart?: string;
    estimatedEnd?: string;
    actualEnd?: string;
    estimatedDurationMinutes?: number;
    actualDurationMinutes?: number;

    // Dependencies
    dependsOnIds: string[];

    // Status
    status: StrikeStepStatus;
    notes?: string;

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSET RECONCILIATION
// ─────────────────────────────────────────────────────────────────────────────

export interface AssetReconciliationItem extends AuditFields {
    id: string;
    liveEventId: string;
    assetId: string;
    equipmentCheckInId?: string;

    // Reconciliation
    conditionOnReturn: AssetReturnCondition;
    conditionOnArrival?: AssetReturnCondition;
    reconciledBy?: string;
    reconciledAt?: string;

    // Status
    status: ReconciliationStatus;
    quantityExpected: number;
    quantityReturned?: number;
    quantityMissing: number;
    quantityDamaged: number;

    // Damage
    damageDescription?: string;
    damagePhotos: string[];
    estimatedRepairCost?: number;
    estimatedReplacementCost?: number;

    // Links
    incidentId?: string;
    vendorId?: string;
    insuranceClaimRecommended: boolean;

    // Notes
    notes?: string;

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST-EVENT REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export interface PostEventReport extends AuditFields {
    id: string;
    liveEventId: string;
    compiledBy?: string;
    compiledAt?: string;

    // Attendance
    totalAttendance?: number;
    peakAttendance?: number;
    vipCount?: number;

    // Financial
    totalBudget?: number;
    totalSpent?: number;
    totalRevenue?: number;
    finalMarginPercent?: number;

    // Incidents
    totalIncidents: number;
    incidentsBySeverity: Record<string, number>;

    // Assets
    totalAssetsDeployed: number;
    assetsDamaged: number;
    assetsMissing: number;
    totalDamageCost: number;

    // Timeline
    loadInVarianceMinutes?: number;
    showStartVarianceMinutes?: number;
    showEndVarianceMinutes?: number;
    strikeVarianceMinutes?: number;

    // Vendor
    vendorScores: Record<string, number>;

    // Lessons
    lessonsLearned?: string;
    recommendations?: string;
    highlights?: string;
    challenges?: string;

    // Status
    status: "draft" | "in_review" | "approved" | "published";

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INCIDENT EXTENSIONS (added columns to existing incidents table)
// ─────────────────────────────────────────────────────────────────────────────

export interface IncidentLiveExtension {
    liveEventId?: string;
    eventPhase?: string;
    responseTeamIds: string[];
    firstResponderId?: string;
    responseTimeSeconds?: number;
    escalationLevel: number;
    autoEscalated: boolean;
    environmentalConditions?: Record<string, unknown>;
    medicalTransport: boolean;
    transportDestination?: string;
    oshaReportable: boolean;
    witnessStatements?: Record<string, unknown>;
    evidenceUrls: string[];
    insuranceNotified: boolean;
    insuranceNotifiedAt?: string;
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
    postEventReport?: PostEventReport;
}

export interface LiveEventSummary {
    id: string;
    eventId: string;
    projectId: string;
    phase: LiveEventPhase;
    riskScore: number;
    riskLevel: RiskLevel;
    currentAttendance: number;
    venueCapacity?: number;
    gatesCompleted: number;
    gatesTotal: number;
    departmentsReady: number;
    departmentsTotal: number;
    activeIncidents: number;
    cuesCompleted: number;
    cuesTotal: number;
    financialBurnPercent?: number;
}

export interface CommandDashboardData {
    liveEvent: LiveEventInstance;
    commandPositions: CommandPosition[];
    departmentStatuses: DepartmentStatus[];
    readinessGates: ReadinessGate[];
    activeIncidents: number;
    currentCue?: RosCue;
    nextCues: RosCue[];
    financialSnapshot?: LiveFinancialSnapshot;
    environmentalReading?: EnvironmentalReading;
    riskScore: number;
}

export interface StageManagerDashboardData {
    liveEvent: LiveEventInstance;
    rosCues: RosCue[];
    currentCue?: RosCue;
    nextCue?: RosCue;
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
