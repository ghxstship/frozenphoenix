// ═══════════════════════════════════════════════════════════════════════════
// ATLVS — Production Lifecycle Types
// Complete data model for creative/experiential production management
// Who/What/When/Where/Why/How/If-Then for every datapoint
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// BASE TYPES — Common fields for audit trail and relationships
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditFields {
    createdAt: string;
    createdBy: string;
    updatedAt?: string | undefined;
    updatedBy?: string | undefined;
    deletedAt?: string | undefined;
    deletedBy?: string | undefined;
}

export interface LinkedRecord {
    id: string;
    type: EntityType;
    name: string;
    status?: string | undefined;
    linkId?: string | undefined;
    linkType?: string | undefined;
    linkLabel?: string | undefined;
}

export type EntityType =
    | "project"
    | "location"
    | "activation"
    | "event"
    | "activity"
    | "task"
    | "milestone"
    | "deliverable"
    | "crew_member"
    | "vendor"
    | "client"
    | "stakeholder"
    | "asset"
    | "consumable"
    | "vehicle"
    | "purchase_order"
    | "invoice"
    | "expense"
    | "budget_line"
    | "shipment"
    | "warehouse"
    | "incident"
    | "document"
    | "sop";

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT HIERARCHY — Projects → Locations → Activations → Events → Activities
// ─────────────────────────────────────────────────────────────────────────────

export type ProjectType =
    | "tour"
    | "festival"
    | "activation"
    | "installation"
    | "broadcast"
    | "corporate"
    | "retail"
    | "experiential";
export type ProjectStatus =
    | "draft"
    | "planning"
    | "pre_production"
    | "in_production"
    | "wrap"
    | "completed"
    | "cancelled"
    | "on_hold";

export interface Project extends AuditFields {
    id: string;
    code: string;
    name: string;
    type: ProjectType;
    status: ProjectStatus;

    // WHO
    clientId: string;
    clientName: string;
    accountManagerId: string;
    projectManagerId: string;
    teamIds: string[];
    stakeholderIds: string[];

    // WHAT
    description: string;
    scope: string;
    deliverables: string[];

    // WHEN
    startDate: string;
    endDate: string;
    loadInDate?: string | undefined;
    loadOutDate?: string | undefined;
    // WHERE
    primaryLocationId?: string | undefined;
    locationIds: string[];

    // WHY
    objectives: string[];
    successMetrics: string[];

    // HOW
    budget: number;
    currency: string;
    phases: ProjectPhaseConfig[];

    // IF/THEN
    riskLevel: "low" | "medium" | "high" | "critical";
    contingencyPercent: number;

    // Relationships
    dealId?: string | undefined;
    parentProjectId?: string | undefined;
    childProjectIds: string[];
}

export interface ProjectPhaseConfig {
    phase: ProductionPhase;
    startDate: string;
    endDate: string;
    budget: number;
    status: "pending" | "active" | "completed";
}

export type ProductionPhase =
    | "discovery"
    | "design"
    | "pre_production"
    | "procurement"
    | "fabrication"
    | "logistics"
    | "load_in"
    | "rehearsal"
    | "show"
    | "strike"
    | "load_out"
    | "wrap";

// ─── Location ───
export type LocationType =
    | "venue"
    | "warehouse"
    | "office"
    | "fabrication_shop"
    | "staging_area"
    | "hotel"
    | "airport"
    | "other";

export interface Location extends AuditFields {
    id: string;
    projectId: string;
    name: string;
    type: LocationType;

    // WHO
    contactName?: string | undefined;
    contactPhone?: string | undefined;
    contactEmail?: string | undefined;
    venueRepId?: string | undefined;
    // WHAT
    description?: string | undefined;
    capacity?: number | undefined;
    squareFootage?: number | undefined;
    amenities: string[];
    restrictions: string[];

    // WHEN
    accessStartDate?: string | undefined;
    accessEndDate?: string | undefined;
    loadInWindows: TimeWindow[];
    loadOutWindows: TimeWindow[];

    // WHERE
    address: Address;
    coordinates?: { lat: number; lng: number } | undefined;
    parkingInfo?: string | undefined;
    dockInfo?: string | undefined;
    // WHY
    purpose: string;

    // HOW
    dailyRate?: number | undefined;
    totalCost?: number | undefined;
    powerAvailable?: string | undefined;
    internetAvailable?: boolean | undefined;
    // IF/THEN
    insuranceRequired: boolean;
    permitsRequired: string[];

    // Relationships
    activationIds: string[];
    eventIds: string[];
}

export interface Address {
    street1: string;
    street2?: string | undefined;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface TimeWindow {
    date: string;
    startTime: string;
    endTime: string;
    notes?: string | undefined;
}

// ─── Activation ───
export type ActivationType =
    | "booth"
    | "stage"
    | "installation"
    | "pop_up"
    | "mobile"
    | "digital"
    | "hybrid";

export interface Activation extends AuditFields {
    id: string;
    projectId: string;
    locationId: string;
    name: string;
    type: ActivationType;
    status: "planning" | "design" | "build" | "installed" | "active" | "struck" | "stored";

    // WHO
    leadId: string;
    teamIds: string[];
    vendorIds: string[];

    // WHAT
    description: string;
    dimensions: Dimensions;
    components: ActivationComponent[];

    // WHEN
    installDate: string;
    strikeDate: string;
    operatingHours: TimeWindow[];

    // WHERE
    floorPlanPosition?: { x: number; y: number } | undefined;
    zone?: string | undefined;
    // WHY
    experienceGoals: string[];
    targetAudience: string;
    expectedFootfall?: number | undefined;
    // HOW
    budget: number;
    powerRequirements?: string | undefined;
    staffingRequirements: StaffingRequirement[];

    // IF/THEN
    weatherContingency?: string | undefined;
    backupPlan?: string | undefined;
    // Relationships
    eventIds: string[];
    assetIds: string[];
    taskIds: string[];
}

export interface Dimensions {
    width: number;
    depth: number;
    height: number;
    unit: "ft" | "m" | "in" | "cm";
}

export interface ActivationComponent {
    id: string;
    name: string;
    type:
        | "structural"
        | "electrical"
        | "av"
        | "scenic"
        | "props"
        | "signage"
        | "furniture"
        | "technology";
    quantity: number;
    status: "pending" | "ordered" | "fabricating" | "ready" | "installed";
    assetId?: string | undefined;
    vendorId?: string | undefined;
    cost?: number | undefined;
}

export interface StaffingRequirement {
    role: string;
    quantity: number;
    hoursPerDay: number;
    skillsRequired: string[];
    notes?: string | undefined;
}

// ─── Event ───
export type EventType =
    | "show"
    | "rehearsal"
    | "setup"
    | "strike"
    | "meeting"
    | "walkthrough"
    | "training"
    | "press"
    | "vip";

export interface Event extends AuditFields {
    id: string;
    projectId: string;
    locationId: string;
    activationId?: string | undefined;
    name: string;
    type: EventType;
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "postponed";

    // WHO
    producerId: string;
    stageManagerId?: string | undefined;
    attendeeCount?: number | undefined;
    vipCount?: number | undefined;
    // WHAT
    description: string;
    runOfShow: RunOfShowItem[];

    // WHEN
    date: string;
    doorsTime?: string | undefined;
    startTime: string;
    endTime: string;

    // WHERE
    specificLocation?: string | undefined;
    // WHY
    purpose: string;

    // HOW
    budget?: number | undefined;
    // IF/THEN
    rainPlan?: string | undefined;
    cancellationPolicy?: string | undefined;
    // Relationships
    activityIds: string[];
    crewAssignmentIds: string[];
}

export interface RunOfShowItem {
    id: string;
    time: string;
    duration: number;
    description: string;
    responsibleParty: string;
    notes?: string | undefined;
    cueNumber?: string | undefined;
}

// ─── Activity ───
export type ActivityType =
    | "performance"
    | "presentation"
    | "demo"
    | "sampling"
    | "photo_op"
    | "game"
    | "workshop"
    | "meet_greet"
    | "other";

export interface Activity extends AuditFields {
    id: string;
    projectId: string;
    eventId: string;
    activationId?: string | undefined;
    name: string;
    type: ActivityType;
    status: "planned" | "ready" | "active" | "paused" | "completed" | "cancelled";

    // WHO
    leadId: string;
    staffIds: string[];
    participantCount?: number | undefined;
    // WHAT
    description: string;
    requirements: string[];

    // WHEN
    startTime: string;
    endTime: string;
    frequency?: "once" | "hourly" | "continuous" | undefined;
    // WHERE
    specificLocation?: string | undefined;
    // WHY
    objective: string;

    // HOW
    instructions: string;
    equipmentNeeded: string[];

    // IF/THEN
    contingencyPlan?: string | undefined;
    // Relationships
    assetIds: string[];
    consumableIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT MANAGEMENT — Tasks, Milestones, Deliverables by Department
// ─────────────────────────────────────────────────────────────────────────────

export type Department =
    | "production"
    | "construction"
    | "technical"
    | "fabrication"
    | "print"
    | "scenic"
    | "props"
    | "av"
    | "lighting"
    | "rigging"
    | "food_beverage"
    | "staffing"
    | "logistics"
    | "finance"
    | "creative";

export type TaskStatus =
    | "backlog"
    | "todo"
    | "in_progress"
    | "review"
    | "blocked"
    | "completed"
    | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent" | "critical";

export interface ProductionTask extends AuditFields {
    id: string;
    projectId: string;
    parentTaskId?: string | undefined;
    department: Department;
    phase: ProductionPhase;

    // WHO
    assigneeId?: string | undefined;
    assigneeName?: string | undefined;
    reviewerId?: string | undefined;
    vendorId?: string | undefined;
    // WHAT
    title: string;
    description?: string | undefined;
    deliverables: string[];
    acceptanceCriteria: string[];

    // WHEN
    startDate?: string | undefined;
    dueDate?: string | undefined;
    completedAt?: string | undefined;
    estimatedHours?: number | undefined;
    actualHours?: number | undefined;
    // WHERE
    locationId?: string | undefined;
    activationId?: string | undefined;
    // WHY
    priority: TaskPriority;
    impactIfDelayed: string;

    // HOW
    status: TaskStatus;
    percentComplete: number;
    blockers: string[];

    // IF/THEN
    dependencies: string[];
    dependents: string[];

    // Relationships
    milestoneId?: string | undefined;
    purchaseOrderIds: string[];
    assetIds: string[];
    attachmentIds: string[];
}

export interface Milestone extends AuditFields {
    id: string;
    projectId: string;
    phase: ProductionPhase;
    name: string;
    description?: string | undefined;
    // WHO
    ownerId: string;
    approverIds: string[];

    // WHAT
    deliverables: MilestoneDeliverable[];

    // WHEN
    dueDate: string;
    completedAt?: string | undefined;
    // WHY
    isCriticalPath: boolean;
    clientFacing: boolean;

    // HOW
    status: "pending" | "in_progress" | "pending_approval" | "approved" | "rejected" | "overdue";

    // IF/THEN
    paymentTrigger: boolean;
    paymentAmount?: number | undefined;
    // Relationships
    taskIds: string[];
    approvalId?: string | undefined;
}

export interface MilestoneDeliverable {
    id: string;
    name: string;
    type: "document" | "asset" | "approval" | "payment" | "installation" | "other";
    status: "pending" | "submitted" | "approved" | "rejected";
    dueDate: string;
    attachmentUrl?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCUREMENT — RFQs, Purchase Orders, Vendors, Contracts
// ─────────────────────────────────────────────────────────────────────────────

export type ProcurementStatus =
    | "draft"
    | "pending_approval"
    | "approved"
    | "sent"
    | "acknowledged"
    | "in_progress"
    | "shipped"
    | "received"
    | "completed"
    | "cancelled"
    | "disputed";

export interface RFQ extends AuditFields {
    id: string;
    projectId: string;
    number: string;
    title: string;

    // WHO
    requestedById: string;
    vendorIds: string[];

    // WHAT
    description: string;
    lineItems: RFQLineItem[];

    // WHEN
    issueDate: string;
    responseDeadline: string;
    requiredByDate: string;

    // WHERE
    deliveryLocationId: string;

    // WHY
    justification: string;

    // HOW
    status: "draft" | "sent" | "responses_received" | "awarded" | "cancelled";

    // IF/THEN
    budgetCode: string;

    // Relationships
    responses: RFQResponse[];
    awardedPOId?: string | undefined;
}

export interface RFQLineItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    specifications?: string | undefined;
    targetPrice?: number | undefined;
}

export interface RFQResponse {
    id: string;
    rfqId: string;
    vendorId: string;
    vendorName: string;
    totalPrice: number;
    leadTime: number;
    lineItems: RFQResponseLineItem[];
    notes?: string | undefined;
    submittedAt: string;
    selected: boolean;
}

export interface RFQResponseLineItem {
    rfqLineItemId: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string | undefined;
}

export interface PurchaseOrder extends AuditFields {
    id: string;
    projectId: string;
    number: string;

    // WHO
    vendorId: string;
    vendorName: string;
    requestedById: string;
    approvedById?: string | undefined;
    // WHAT
    description: string;
    lineItems: POLineItem[];

    // WHEN
    issueDate: string;
    requiredByDate: string;
    acknowledgedAt?: string | undefined;
    // WHERE
    deliveryLocationId: string;
    deliveryAddress: Address;

    // WHY
    justification: string;
    budgetCode: string;

    // HOW
    status: ProcurementStatus;
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    totalAmount: number;
    currency: string;
    paymentTerms: string;

    // IF/THEN
    approvalRequired: boolean;
    approvalThreshold: number;

    // Relationships
    rfqId?: string | undefined;
    invoiceIds: string[];
    shipmentIds: string[];
    taskId?: string | undefined;
    activationId?: string | undefined;
}

export interface POLineItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    taxRate: number;
    budgetCategoryId: string;
    receivedQuantity: number;
    status: "pending" | "partial" | "received" | "returned";
}

export interface Contract extends AuditFields {
    id: string;
    projectId?: string | undefined;
    vendorId?: string | undefined;
    clientId?: string | undefined;
    number: string;
    title: string;
    type: "vendor" | "client" | "venue" | "talent" | "sponsor" | "nda" | "other";

    // WHO
    counterpartyName: string;
    signatoryId: string;

    // WHAT
    description: string;
    scope: string;

    // WHEN
    effectiveDate: string;
    expirationDate: string;
    signedAt?: string | undefined;
    // WHY
    value: number;

    // HOW
    status: "draft" | "pending_review" | "pending_signature" | "active" | "expired" | "terminated";

    // IF/THEN
    autoRenew: boolean;
    terminationClause?: string | undefined;
    // Relationships
    documentUrl: string;
    amendmentIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE — Calendar, Shifts, Resource Allocation
// ─────────────────────────────────────────────────────────────────────────────

export interface ScheduleEntry extends AuditFields {
    id: string;
    projectId: string;
    type: "task" | "event" | "shift" | "milestone" | "travel" | "meeting" | "deadline";
    referenceId: string;
    referenceName: string;

    // WHO
    assigneeIds: string[];

    // WHAT
    title: string;
    description?: string | undefined;
    // WHEN
    startDateTime: string;
    endDateTime: string;
    allDay: boolean;
    timezone: string;

    // WHERE
    locationId?: string | undefined;
    locationName?: string | undefined;
    // WHY
    priority: TaskPriority;

    // HOW
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
    color?: string | undefined;
    // IF/THEN
    recurrence?: RecurrenceRule | undefined;
    reminderMinutes?: number[] | undefined;
}

export interface RecurrenceRule {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    daysOfWeek?: number[] | undefined;
    endDate?: string | undefined;
    occurrences?: number | undefined;
}

export interface CrewShift extends AuditFields {
    id: string;
    projectId: string;
    eventId?: string | undefined;
    locationId: string;

    // WHO
    crewMemberId: string;
    crewMemberName: string;
    supervisorId?: string | undefined;
    // WHAT
    role: string;
    department: Department;
    duties: string[];

    // WHEN
    date: string;
    callTime: string;
    startTime: string;
    endTime: string;
    wrapTime?: string | undefined;
    breakMinutes: number;

    // WHERE
    reportingLocation: string;

    // WHY
    notes?: string | undefined;
    // HOW
    status:
        | "scheduled"
        | "confirmed"
        | "checked_in"
        | "on_break"
        | "checked_out"
        | "no_show"
        | "cancelled";
    hourlyRate: number;
    overtimeRate: number;

    // IF/THEN
    mealProvided: boolean;
    travelReimbursement: boolean;

    // Relationships
    timeEntryId?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSONNEL — Crew, Roles, Certifications, Availability
// ─────────────────────────────────────────────────────────────────────────────

export type EmploymentType =
    | "employee"
    | "contractor"
    | "freelance"
    | "temp"
    | "intern"
    | "volunteer";
export type CrewStatus = "active" | "inactive" | "on_leave" | "terminated" | "do_not_rehire";

export interface CrewMember extends AuditFields {
    id: string;
    employeeId?: string | undefined;
    // WHO
    firstName: string;
    lastName: string;
    preferredName?: string | undefined;
    email: string;
    phone: string;
    emergencyContact: EmergencyContact;

    // WHAT
    primaryRole: string;
    secondaryRoles: string[];
    department: Department;
    skills: string[];
    certifications: Certification[];

    // WHEN
    hireDate: string;
    terminationDate?: string | undefined;
    // WHERE
    homeBase: string;
    willingToTravel: boolean;
    travelRadius?: number | undefined;
    // WHY
    employmentType: EmploymentType;
    status: CrewStatus;

    // HOW
    hourlyRate: number;
    overtimeRate: number;
    dayRate?: number | undefined;
    // IF/THEN
    unionMember: boolean;
    unionLocal?: string | undefined;
    backgroundCheckDate?: string | undefined;
    drugTestDate?: string | undefined;
    // Relationships
    supervisorId?: string | undefined;
    projectAssignments: ProjectAssignment[];
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string | undefined;
}

export interface Certification {
    id: string;
    type: string;
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    documentUrl?: string | undefined;
    verified: boolean;
}

export interface ProjectAssignment extends AuditFields {
    id: string;
    projectId: string;
    crewMemberId: string;
    role: string;
    department: Department;
    startDate: string;
    endDate: string;
    status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
    rate: number;
    rateType: "hourly" | "daily" | "weekly" | "flat";
    estimatedHours: number;
    actualHours: number;
}

export interface Availability {
    id: string;
    crewMemberId: string;
    date: string;
    status: "available" | "unavailable" | "tentative" | "booked";
    projectId?: string | undefined;
    notes?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY — Assets, Consumables, Tracking
// ─────────────────────────────────────────────────────────────────────────────

export type AssetCategory =
    | "staging"
    | "lighting"
    | "audio"
    | "video"
    | "rigging"
    | "scenic"
    | "props"
    | "furniture"
    | "tools"
    | "vehicles"
    | "technology"
    | "safety"
    | "other";
export type AssetCondition =
    | "new"
    | "excellent"
    | "good"
    | "fair"
    | "needs_repair"
    | "decommissioned";
export type AssetOwnership = "owned" | "rental" | "client_provided" | "vendor_provided";

export interface Asset extends AuditFields {
    id: string;
    barcode: string;
    serialNumber?: string | undefined;
    // WHO
    ownerId?: string | undefined;
    currentCustodianId?: string | undefined;
    vendorId?: string | undefined;
    // WHAT
    name: string;
    description?: string | undefined;
    category: AssetCategory;
    subcategory?: string | undefined;
    manufacturer?: string | undefined;
    model?: string | undefined;
    specifications: Record<string, string>;

    // WHEN
    purchaseDate?: string | undefined;
    warrantyExpiry?: string | undefined;
    lastMaintenanceDate?: string | undefined;
    nextMaintenanceDate?: string | undefined;
    // WHERE
    homeLocationId: string;
    currentLocationId: string;

    // WHY
    ownership: AssetOwnership;
    condition: AssetCondition;

    // HOW
    purchasePrice?: number | undefined;
    currentValue?: number | undefined;
    dailyRentalRate?: number | undefined;
    insuranceValue?: number | undefined;
    // IF/THEN
    requiresCertification: boolean;
    certificationTypes: string[];
    maintenanceSchedule?: string | undefined;
    // Relationships
    projectAssignments: AssetAssignment[];
    maintenanceRecords: MaintenanceRecord[];
}

export interface AssetAssignment extends AuditFields {
    id: string;
    assetId: string;
    projectId: string;
    activationId?: string | undefined;
    status: "reserved" | "checked_out" | "in_use" | "returned" | "damaged" | "lost";
    checkOutDate: string;
    expectedReturnDate: string;
    actualReturnDate?: string | undefined;
    checkedOutById: string;
    returnedById?: string | undefined;
    conditionOnCheckout: AssetCondition;
    conditionOnReturn?: AssetCondition | undefined;
    notes?: string | undefined;
}

export interface MaintenanceRecord extends AuditFields {
    id: string;
    assetId: string;
    type: "inspection" | "repair" | "calibration" | "cleaning" | "upgrade";
    description: string;
    performedById: string;
    vendorId?: string | undefined;
    cost?: number | undefined;
    date: string;
    nextDueDate?: string | undefined;
    notes?: string | undefined;
}

export interface Consumable extends AuditFields {
    id: string;
    sku: string;
    name: string;
    description?: string | undefined;
    category: string;
    unit: string;
    quantityOnHand: number;
    reorderPoint: number;
    reorderQuantity: number;
    unitCost: number;
    preferredVendorId?: string | undefined;
    locationId: string;
}

export interface ConsumableUsage extends AuditFields {
    id: string;
    consumableId: string;
    projectId: string;
    quantity: number;
    usedById: string;
    date: string;
    notes?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGISTICS — Shipping, Trucking, Warehousing
// ─────────────────────────────────────────────────────────────────────────────

export type ShipmentType = "outbound" | "inbound" | "transfer" | "return";
export type ShipmentStatus =
    | "planning"
    | "booked"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "exception"
    | "cancelled";

export interface Shipment extends AuditFields {
    id: string;
    projectId: string;
    number: string;
    type: ShipmentType;

    // WHO
    carrierId?: string | undefined;
    carrierName: string;
    driverId?: string | undefined;
    coordinatorId: string;

    // WHAT
    description: string;
    items: ShipmentItem[];
    totalWeight: number;
    weightUnit: "lbs" | "kg";
    totalPieces: number;

    // WHEN
    pickupDate: string;
    pickupTime?: string | undefined;
    estimatedDeliveryDate: string;
    actualDeliveryDate?: string | undefined;
    // WHERE
    originLocationId: string;
    originAddress: Address;
    destinationLocationId: string;
    destinationAddress: Address;

    // WHY
    priority: "standard" | "expedited" | "rush" | "hot";

    // HOW
    status: ShipmentStatus;
    trackingNumber?: string | undefined;
    cost?: number | undefined;
    // IF/THEN
    specialInstructions?: string | undefined;
    liftgateRequired: boolean;
    insideDelivery: boolean;
    appointmentRequired: boolean;

    // Relationships
    purchaseOrderId?: string | undefined;
    vehicleId?: string | undefined;
}

export interface ShipmentItem {
    id: string;
    assetId?: string | undefined;
    description: string;
    quantity: number;
    weight?: number | undefined;
    dimensions?: Dimensions | undefined;
    value?: number | undefined;
    handlingInstructions?: string | undefined;
}

export interface Vehicle extends AuditFields {
    id: string;
    type: "box_truck" | "semi" | "sprinter" | "pickup" | "trailer" | "forklift" | "other";
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vin: string;

    // WHO
    primaryDriverId?: string | undefined;
    // WHAT
    capacity: number;
    capacityUnit: "lbs" | "kg" | "cu_ft" | "pallets";

    // WHEN
    registrationExpiry: string;
    insuranceExpiry: string;
    lastInspectionDate?: string | undefined;
    nextInspectionDate?: string | undefined;
    // WHERE
    homeLocationId: string;
    currentLocationId: string;

    // WHY
    ownership: "owned" | "leased" | "rental";

    // HOW
    status: "available" | "in_use" | "maintenance" | "out_of_service";
    mileage: number;
    fuelType: "gas" | "diesel" | "electric" | "hybrid";

    // IF/THEN
    dotCompliant: boolean;
    hazmatCertified: boolean;
}

export interface Warehouse extends AuditFields {
    id: string;
    name: string;
    type: "primary" | "satellite" | "staging" | "vendor";

    // WHO
    managerId: string;

    // WHAT
    totalSquareFootage: number;
    usableSquareFootage: number;
    zones: WarehouseZone[];

    // WHERE
    address: Address;

    // HOW
    status: "active" | "inactive";

    // IF/THEN
    climateControlled: boolean;
    securityLevel: "standard" | "high" | "restricted";
}

export interface WarehouseZone {
    id: string;
    name: string;
    type: "storage" | "staging" | "shipping" | "receiving" | "fabrication";
    squareFootage: number;
    rackCount?: number | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE — Budgets, Expenses, Revenue, Payroll
// ─────────────────────────────────────────────────────────────────────────────

export type BudgetCategory =
    | "labor"
    | "materials"
    | "equipment_rental"
    | "equipment_purchase"
    | "fabrication"
    | "print"
    | "av"
    | "lighting"
    | "scenic"
    | "travel"
    | "lodging"
    | "per_diem"
    | "shipping"
    | "trucking"
    | "venue"
    | "permits"
    | "insurance"
    | "talent"
    | "catering"
    | "staffing"
    | "security"
    | "contingency"
    | "overhead"
    | "markup";

export interface Budget extends AuditFields {
    id: string;
    projectId: string;
    version: number;
    status: "draft" | "pending_approval" | "approved" | "locked";

    // WHO
    preparedById: string;
    approvedById?: string | undefined;
    // WHAT
    lineItems: BudgetLineItem[];

    // WHEN
    effectiveDate: string;

    // WHY
    notes?: string | undefined;
    // HOW
    totalBudget: number;
    totalActual: number;
    totalVariance: number;
    currency: string;

    // IF/THEN
    contingencyPercent: number;
    markupPercent: number;
}

export interface BudgetLineItem extends AuditFields {
    id: string;
    budgetId: string;
    category: BudgetCategory;
    subcategory?: string | undefined;
    description: string;
    phase: ProductionPhase;

    // WHO
    vendorId?: string | undefined;
    // WHAT
    quantity: number;
    unit: string;
    unitCost: number;

    // HOW
    budgetedAmount: number;
    actualAmount: number;
    committedAmount: number;
    variance: number;

    // IF/THEN
    notes?: string | undefined;
    // Relationships
    purchaseOrderIds: string[];
    expenseIds: string[];
}

export interface Expense extends AuditFields {
    id: string;
    projectId: string;
    budgetLineItemId?: string | undefined;
    // WHO
    submittedById: string;
    approvedById?: string | undefined;
    vendorId?: string | undefined;
    // WHAT
    description: string;
    category: BudgetCategory;

    // WHEN
    expenseDate: string;
    submittedAt: string;
    approvedAt?: string | undefined;
    // WHY
    justification?: string | undefined;
    // HOW
    amount: number;
    currency: string;
    status: "draft" | "submitted" | "pending_approval" | "approved" | "rejected" | "reimbursed";
    paymentMethod: "corporate_card" | "personal_card" | "cash" | "check" | "wire" | "ach";

    // IF/THEN
    receiptUrl?: string | undefined;
    reimbursable: boolean;

    // Relationships
    purchaseOrderId?: string | undefined;
    invoiceId?: string | undefined;
}

export interface Invoice extends AuditFields {
    id: string;
    projectId: string;
    type: "vendor" | "client";
    number: string;

    // WHO
    vendorId?: string | undefined;
    clientId?: string | undefined;
    // WHAT
    description: string;
    lineItems: InvoiceLineItem[];

    // WHEN
    invoiceDate: string;
    dueDate: string;
    paidAt?: string | undefined;
    // WHY
    terms: string;

    // HOW
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    currency: string;
    status: "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "disputed" | "void";

    // IF/THEN
    paymentInstructions?: string | undefined;
    // Relationships
    purchaseOrderId?: string | undefined;
    milestoneId?: string | undefined;
}

export interface InvoiceLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    budgetCategoryId?: string | undefined;
}

export interface TimeEntry extends AuditFields {
    id: string;
    projectId: string;
    crewMemberId: string;
    shiftId?: string | undefined;
    // WHO
    approvedById?: string | undefined;
    // WHAT
    description?: string | undefined;
    // WHEN
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    regularHours: number;
    overtimeHours: number;
    doubleTimeHours: number;

    // WHY
    taskId?: string | undefined;
    // HOW
    status: "draft" | "submitted" | "approved" | "rejected" | "processed";
    regularRate: number;
    overtimeRate: number;
    doubleTimeRate: number;
    totalPay: number;

    // IF/THEN
    notes?: string | undefined;
}

export interface PayrollBatch extends AuditFields {
    id: string;
    projectId?: string | undefined;
    periodStart: string;
    periodEnd: string;
    status: "draft" | "pending_approval" | "approved" | "processing" | "completed";
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    timeEntryIds: string[];
    processedAt?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// INCIDENTS — Safety, Issues, Resolution Tracking
// ─────────────────────────────────────────────────────────────────────────────

export type IncidentType =
    | "safety"
    | "injury"
    | "property_damage"
    | "theft"
    | "security"
    | "weather"
    | "equipment_failure"
    | "vendor_issue"
    | "client_complaint"
    | "other";
export type IncidentSeverity = "minor" | "moderate" | "major" | "critical";

export interface Incident extends AuditFields {
    id: string;
    projectId: string;
    number: string;
    type: IncidentType;

    // WHO
    reportedById: string;
    involvedPartyIds: string[];
    witnessIds: string[];
    assignedToId?: string | undefined;
    // WHAT
    title: string;
    description: string;
    immediateActions: string;

    // WHEN
    occurredAt: string;
    reportedAt: string;
    resolvedAt?: string | undefined;
    // WHERE
    locationId?: string | undefined;
    specificLocation: string;

    // WHY
    severity: IncidentSeverity;
    rootCause?: string | undefined;
    // HOW
    status: "reported" | "investigating" | "pending_action" | "resolved" | "closed";
    resolution?: string | undefined;
    preventiveMeasures?: string | undefined;
    // IF/THEN
    insuranceClaim: boolean;
    claimNumber?: string | undefined;
    estimatedCost?: number | undefined;
    actualCost?: number | undefined;
    // Relationships
    attachmentIds: string[];
    followUpTaskIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE — SOPs, Templates, Documentation
// ─────────────────────────────────────────────────────────────────────────────

export type DocumentCategory =
    | "sop"
    | "template"
    | "checklist"
    | "guide"
    | "policy"
    | "form"
    | "reference"
    | "training";

export interface KnowledgeBaseArticle extends AuditFields {
    id: string;
    category: DocumentCategory;
    department?: Department | undefined;
    // WHO
    authorId: string;
    reviewerIds: string[];

    // WHAT
    title: string;
    summary: string;
    content: string;
    tags: string[];

    // WHEN
    publishedAt?: string | undefined;
    reviewedAt?: string | undefined;
    nextReviewDate?: string | undefined;
    // WHY
    purpose: string;

    // HOW
    status: "draft" | "pending_review" | "published" | "archived";
    version: number;

    // IF/THEN
    requiresAcknowledgment: boolean;
    acknowledgmentIds: string[];

    // Relationships
    relatedArticleIds: string[];
    attachmentIds: string[];
}

export interface SOP extends AuditFields {
    id: string;
    number: string;
    department: Department;

    // WHO
    ownerId: string;
    applicableRoles: string[];

    // WHAT
    title: string;
    purpose: string;
    scope: string;
    steps: SOPStep[];

    // WHEN
    effectiveDate: string;
    reviewDate: string;

    // WHY
    safetyRelated: boolean;

    // HOW
    status: "draft" | "active" | "under_review" | "superseded" | "archived";
    version: number;

    // IF/THEN
    requiresTraining: boolean;
    trainingMaterialIds: string[];

    // Relationships
    relatedSOPIds: string[];
    formIds: string[];
}

export interface SOPStep {
    id: string;
    order: number;
    title: string;
    description: string;
    responsibleRole: string;
    duration?: number | undefined;
    safetyNote?: string | undefined;
    imageUrl?: string | undefined;
}

export interface Checklist extends AuditFields {
    id: string;
    templateId?: string | undefined;
    projectId?: string | undefined;
    eventId?: string | undefined;
    // WHO
    assignedToId: string;
    completedById?: string | undefined;
    // WHAT
    title: string;
    items: ChecklistItem[];

    // WHEN
    dueDate?: string | undefined;
    completedAt?: string | undefined;
    // WHY
    type: "pre_event" | "post_event" | "safety" | "quality" | "maintenance" | "custom";

    // HOW
    status: "pending" | "in_progress" | "completed" | "overdue";
    completionPercent: number;
}

export interface ChecklistItem {
    id: string;
    order: number;
    text: string;
    required: boolean;
    completed: boolean;
    completedAt?: string | undefined;
    completedById?: string | undefined;
    notes?: string | undefined;
    attachmentUrl?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS — Standard Report Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type ReportType =
    | "project_summary"
    | "budget_vs_actual"
    | "labor_summary"
    | "vendor_spend"
    | "asset_utilization"
    | "crew_utilization"
    | "incident_summary"
    | "milestone_status"
    | "procurement_status"
    | "logistics_summary"
    | "daily_production"
    | "wrap_report"
    | "post_mortem";

export interface ReportDefinition extends AuditFields {
    id: string;
    type: ReportType;
    name: string;
    description: string;

    // WHO
    createdById: string;

    // WHAT
    filters: ReportFilter[];
    columns: ReportColumn[];
    groupBy?: string[] | undefined;
    sortBy?: ReportSort[] | undefined;
    // WHEN
    schedule?: ReportSchedule | undefined;
    // WHY
    isTemplate: boolean;
    isPublic: boolean;

    // HOW
    outputFormat: "pdf" | "excel" | "csv" | "dashboard";
}

export interface ReportFilter {
    field: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains" | "between";
    value: unknown;
}

export interface ReportColumn {
    field: string;
    label: string;
    width?: number | undefined;
    format?: "text" | "number" | "currency" | "date" | "percent" | undefined;
    aggregate?: "sum" | "avg" | "count" | "min" | "max" | undefined;
}

export interface ReportSort {
    field: string;
    direction: "asc" | "desc";
}

export interface ReportSchedule {
    frequency: "daily" | "weekly" | "monthly" | "on_demand";
    dayOfWeek?: number | undefined;
    dayOfMonth?: number | undefined;
    time?: string | undefined;
    recipientIds: string[];
}
