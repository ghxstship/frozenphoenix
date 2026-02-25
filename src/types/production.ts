// ═══════════════════════════════════════════════════════════════════════════
// FROZEN PHOENIX — Production Lifecycle Types
// Complete data model for creative/experiential production management
// Who/What/When/Where/Why/How/If-Then for every datapoint
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// BASE TYPES — Common fields for audit trail and relationships
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditFields {
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
    deletedAt?: string;
    deletedBy?: string;
}

export interface LinkedRecord {
    id: string;
    type: EntityType;
    name: string;
    status?: string;
}

export type EntityType =
    | "project" | "location" | "activation" | "event" | "activity"
    | "task" | "milestone" | "deliverable"
    | "crew_member" | "vendor" | "client" | "stakeholder"
    | "asset" | "consumable" | "vehicle"
    | "purchase_order" | "invoice" | "expense" | "budget_line"
    | "shipment" | "warehouse" | "incident" | "document" | "sop";

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT HIERARCHY — Projects → Locations → Activations → Events → Activities
// ─────────────────────────────────────────────────────────────────────────────

export type ProjectType = "tour" | "festival" | "activation" | "installation" | "broadcast" | "corporate" | "retail" | "experiential";
export type ProjectStatus = "draft" | "planning" | "pre_production" | "in_production" | "wrap" | "completed" | "cancelled" | "on_hold";

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
    loadInDate?: string;
    loadOutDate?: string;
    
    // WHERE
    primaryLocationId?: string;
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
    dealId?: string;
    parentProjectId?: string;
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
    | "discovery" | "design" | "pre_production" | "procurement" 
    | "fabrication" | "logistics" | "load_in" | "rehearsal" 
    | "show" | "strike" | "load_out" | "wrap";

// ─── Location ───
export type LocationType = "venue" | "warehouse" | "office" | "fabrication_shop" | "staging_area" | "hotel" | "airport" | "other";

export interface Location extends AuditFields {
    id: string;
    projectId: string;
    name: string;
    type: LocationType;
    
    // WHO
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    venueRepId?: string;
    
    // WHAT
    description?: string;
    capacity?: number;
    squareFootage?: number;
    amenities: string[];
    restrictions: string[];
    
    // WHEN
    accessStartDate?: string;
    accessEndDate?: string;
    loadInWindows: TimeWindow[];
    loadOutWindows: TimeWindow[];
    
    // WHERE
    address: Address;
    coordinates?: { lat: number; lng: number };
    parkingInfo?: string;
    dockInfo?: string;
    
    // WHY
    purpose: string;
    
    // HOW
    dailyRate?: number;
    totalCost?: number;
    powerAvailable?: string;
    internetAvailable?: boolean;
    
    // IF/THEN
    insuranceRequired: boolean;
    permitsRequired: string[];
    
    // Relationships
    activationIds: string[];
    eventIds: string[];
}

export interface Address {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface TimeWindow {
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
}

// ─── Activation ───
export type ActivationType = "booth" | "stage" | "installation" | "pop_up" | "mobile" | "digital" | "hybrid";

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
    floorPlanPosition?: { x: number; y: number };
    zone?: string;
    
    // WHY
    experienceGoals: string[];
    targetAudience: string;
    expectedFootfall?: number;
    
    // HOW
    budget: number;
    powerRequirements?: string;
    staffingRequirements: StaffingRequirement[];
    
    // IF/THEN
    weatherContingency?: string;
    backupPlan?: string;
    
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
    type: "structural" | "electrical" | "av" | "scenic" | "props" | "signage" | "furniture" | "technology";
    quantity: number;
    status: "pending" | "ordered" | "fabricating" | "ready" | "installed";
    assetId?: string;
    vendorId?: string;
    cost?: number;
}

export interface StaffingRequirement {
    role: string;
    quantity: number;
    hoursPerDay: number;
    skillsRequired: string[];
    notes?: string;
}

// ─── Event ───
export type EventType = "show" | "rehearsal" | "setup" | "strike" | "meeting" | "walkthrough" | "training" | "press" | "vip";

export interface Event extends AuditFields {
    id: string;
    projectId: string;
    locationId: string;
    activationId?: string;
    name: string;
    type: EventType;
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "postponed";
    
    // WHO
    producerId: string;
    stageManagerId?: string;
    attendeeCount?: number;
    vipCount?: number;
    
    // WHAT
    description: string;
    runOfShow: RunOfShowItem[];
    
    // WHEN
    date: string;
    doorsTime?: string;
    startTime: string;
    endTime: string;
    
    // WHERE
    specificLocation?: string;
    
    // WHY
    purpose: string;
    
    // HOW
    budget?: number;
    
    // IF/THEN
    rainPlan?: string;
    cancellationPolicy?: string;
    
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
    notes?: string;
    cueNumber?: string;
}

// ─── Activity ───
export type ActivityType = "performance" | "presentation" | "demo" | "sampling" | "photo_op" | "game" | "workshop" | "meet_greet" | "other";

export interface Activity extends AuditFields {
    id: string;
    projectId: string;
    eventId: string;
    activationId?: string;
    name: string;
    type: ActivityType;
    status: "planned" | "ready" | "active" | "paused" | "completed" | "cancelled";
    
    // WHO
    leadId: string;
    staffIds: string[];
    participantCount?: number;
    
    // WHAT
    description: string;
    requirements: string[];
    
    // WHEN
    startTime: string;
    endTime: string;
    frequency?: "once" | "hourly" | "continuous";
    
    // WHERE
    specificLocation?: string;
    
    // WHY
    objective: string;
    
    // HOW
    instructions: string;
    equipmentNeeded: string[];
    
    // IF/THEN
    contingencyPlan?: string;
    
    // Relationships
    assetIds: string[];
    consumableIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT MANAGEMENT — Tasks, Milestones, Deliverables by Department
// ─────────────────────────────────────────────────────────────────────────────

export type Department = 
    | "production" | "construction" | "technical" | "fabrication" 
    | "print" | "scenic" | "props" | "av" | "lighting" | "rigging"
    | "food_beverage" | "staffing" | "logistics" | "finance" | "creative";

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "blocked" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent" | "critical";

export interface ProductionTask extends AuditFields {
    id: string;
    projectId: string;
    parentTaskId?: string;
    department: Department;
    phase: ProductionPhase;
    
    // WHO
    assigneeId?: string;
    assigneeName?: string;
    reviewerId?: string;
    vendorId?: string;
    
    // WHAT
    title: string;
    description?: string;
    deliverables: string[];
    acceptanceCriteria: string[];
    
    // WHEN
    startDate?: string;
    dueDate?: string;
    completedAt?: string;
    estimatedHours?: number;
    actualHours?: number;
    
    // WHERE
    locationId?: string;
    activationId?: string;
    
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
    milestoneId?: string;
    purchaseOrderIds: string[];
    assetIds: string[];
    attachmentIds: string[];
}

export interface Milestone extends AuditFields {
    id: string;
    projectId: string;
    phase: ProductionPhase;
    name: string;
    description?: string;
    
    // WHO
    ownerId: string;
    approverIds: string[];
    
    // WHAT
    deliverables: MilestoneDeliverable[];
    
    // WHEN
    dueDate: string;
    completedAt?: string;
    
    // WHY
    isCriticalPath: boolean;
    clientFacing: boolean;
    
    // HOW
    status: "pending" | "in_progress" | "pending_approval" | "approved" | "rejected" | "overdue";
    
    // IF/THEN
    paymentTrigger: boolean;
    paymentAmount?: number;
    
    // Relationships
    taskIds: string[];
    approvalId?: string;
}

export interface MilestoneDeliverable {
    id: string;
    name: string;
    type: "document" | "asset" | "approval" | "payment" | "installation" | "other";
    status: "pending" | "submitted" | "approved" | "rejected";
    dueDate: string;
    attachmentUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCUREMENT — RFQs, Purchase Orders, Vendors, Contracts
// ─────────────────────────────────────────────────────────────────────────────

export type ProcurementStatus = "draft" | "pending_approval" | "approved" | "sent" | "acknowledged" | "in_progress" | "shipped" | "received" | "completed" | "cancelled" | "disputed";

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
    awardedPOId?: string;
}

export interface RFQLineItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    specifications?: string;
    targetPrice?: number;
}

export interface RFQResponse {
    id: string;
    rfqId: string;
    vendorId: string;
    vendorName: string;
    totalPrice: number;
    leadTime: number;
    lineItems: RFQResponseLineItem[];
    notes?: string;
    submittedAt: string;
    selected: boolean;
}

export interface RFQResponseLineItem {
    rfqLineItemId: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}

export interface PurchaseOrder extends AuditFields {
    id: string;
    projectId: string;
    number: string;
    
    // WHO
    vendorId: string;
    vendorName: string;
    requestedById: string;
    approvedById?: string;
    
    // WHAT
    description: string;
    lineItems: POLineItem[];
    
    // WHEN
    issueDate: string;
    requiredByDate: string;
    acknowledgedAt?: string;
    
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
    rfqId?: string;
    invoiceIds: string[];
    shipmentIds: string[];
    taskId?: string;
    activationId?: string;
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
    projectId?: string;
    vendorId?: string;
    clientId?: string;
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
    signedAt?: string;
    
    // WHY
    value: number;
    
    // HOW
    status: "draft" | "pending_review" | "pending_signature" | "active" | "expired" | "terminated";
    
    // IF/THEN
    autoRenew: boolean;
    terminationClause?: string;
    
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
    description?: string;
    
    // WHEN
    startDateTime: string;
    endDateTime: string;
    allDay: boolean;
    timezone: string;
    
    // WHERE
    locationId?: string;
    locationName?: string;
    
    // WHY
    priority: TaskPriority;
    
    // HOW
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
    color?: string;
    
    // IF/THEN
    recurrence?: RecurrenceRule;
    reminderMinutes?: number[];
}

export interface RecurrenceRule {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    daysOfWeek?: number[];
    endDate?: string;
    occurrences?: number;
}

export interface CrewShift extends AuditFields {
    id: string;
    projectId: string;
    eventId?: string;
    locationId: string;
    
    // WHO
    crewMemberId: string;
    crewMemberName: string;
    supervisorId?: string;
    
    // WHAT
    role: string;
    department: Department;
    duties: string[];
    
    // WHEN
    date: string;
    callTime: string;
    startTime: string;
    endTime: string;
    wrapTime?: string;
    breakMinutes: number;
    
    // WHERE
    reportingLocation: string;
    
    // WHY
    notes?: string;
    
    // HOW
    status: "scheduled" | "confirmed" | "checked_in" | "on_break" | "checked_out" | "no_show" | "cancelled";
    hourlyRate: number;
    overtimeRate: number;
    
    // IF/THEN
    mealProvided: boolean;
    travelReimbursement: boolean;
    
    // Relationships
    timeEntryId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSONNEL — Crew, Roles, Certifications, Availability
// ─────────────────────────────────────────────────────────────────────────────

export type EmploymentType = "employee" | "contractor" | "freelance" | "temp" | "intern" | "volunteer";
export type CrewStatus = "active" | "inactive" | "on_leave" | "terminated" | "do_not_rehire";

export interface CrewMember extends AuditFields {
    id: string;
    employeeId?: string;
    
    // WHO
    firstName: string;
    lastName: string;
    preferredName?: string;
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
    terminationDate?: string;
    
    // WHERE
    homeBase: string;
    willingToTravel: boolean;
    travelRadius?: number;
    
    // WHY
    employmentType: EmploymentType;
    status: CrewStatus;
    
    // HOW
    hourlyRate: number;
    overtimeRate: number;
    dayRate?: number;
    
    // IF/THEN
    unionMember: boolean;
    unionLocal?: string;
    backgroundCheckDate?: string;
    drugTestDate?: string;
    
    // Relationships
    supervisorId?: string;
    projectAssignments: ProjectAssignment[];
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}

export interface Certification {
    id: string;
    type: string;
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    documentUrl?: string;
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
    projectId?: string;
    notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY — Assets, Consumables, Tracking
// ─────────────────────────────────────────────────────────────────────────────

export type AssetCategory = "staging" | "lighting" | "audio" | "video" | "rigging" | "scenic" | "props" | "furniture" | "tools" | "vehicles" | "technology" | "safety" | "other";
export type AssetCondition = "new" | "excellent" | "good" | "fair" | "needs_repair" | "decommissioned";
export type AssetOwnership = "owned" | "rental" | "client_provided" | "vendor_provided";

export interface Asset extends AuditFields {
    id: string;
    barcode: string;
    serialNumber?: string;
    
    // WHO
    ownerId?: string;
    currentCustodianId?: string;
    vendorId?: string;
    
    // WHAT
    name: string;
    description?: string;
    category: AssetCategory;
    subcategory?: string;
    manufacturer?: string;
    model?: string;
    specifications: Record<string, string>;
    
    // WHEN
    purchaseDate?: string;
    warrantyExpiry?: string;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    
    // WHERE
    homeLocationId: string;
    currentLocationId: string;
    
    // WHY
    ownership: AssetOwnership;
    condition: AssetCondition;
    
    // HOW
    purchasePrice?: number;
    currentValue?: number;
    dailyRentalRate?: number;
    insuranceValue?: number;
    
    // IF/THEN
    requiresCertification: boolean;
    certificationTypes: string[];
    maintenanceSchedule?: string;
    
    // Relationships
    projectAssignments: AssetAssignment[];
    maintenanceRecords: MaintenanceRecord[];
}

export interface AssetAssignment extends AuditFields {
    id: string;
    assetId: string;
    projectId: string;
    activationId?: string;
    status: "reserved" | "checked_out" | "in_use" | "returned" | "damaged" | "lost";
    checkOutDate: string;
    expectedReturnDate: string;
    actualReturnDate?: string;
    checkedOutById: string;
    returnedById?: string;
    conditionOnCheckout: AssetCondition;
    conditionOnReturn?: AssetCondition;
    notes?: string;
}

export interface MaintenanceRecord extends AuditFields {
    id: string;
    assetId: string;
    type: "inspection" | "repair" | "calibration" | "cleaning" | "upgrade";
    description: string;
    performedById: string;
    vendorId?: string;
    cost?: number;
    date: string;
    nextDueDate?: string;
    notes?: string;
}

export interface Consumable extends AuditFields {
    id: string;
    sku: string;
    name: string;
    description?: string;
    category: string;
    unit: string;
    quantityOnHand: number;
    reorderPoint: number;
    reorderQuantity: number;
    unitCost: number;
    preferredVendorId?: string;
    locationId: string;
}

export interface ConsumableUsage extends AuditFields {
    id: string;
    consumableId: string;
    projectId: string;
    quantity: number;
    usedById: string;
    date: string;
    notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGISTICS — Shipping, Trucking, Warehousing
// ─────────────────────────────────────────────────────────────────────────────

export type ShipmentType = "outbound" | "inbound" | "transfer" | "return";
export type ShipmentStatus = "planning" | "booked" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "exception" | "cancelled";

export interface Shipment extends AuditFields {
    id: string;
    projectId: string;
    number: string;
    type: ShipmentType;
    
    // WHO
    carrierId?: string;
    carrierName: string;
    driverId?: string;
    coordinatorId: string;
    
    // WHAT
    description: string;
    items: ShipmentItem[];
    totalWeight: number;
    weightUnit: "lbs" | "kg";
    totalPieces: number;
    
    // WHEN
    pickupDate: string;
    pickupTime?: string;
    estimatedDeliveryDate: string;
    actualDeliveryDate?: string;
    
    // WHERE
    originLocationId: string;
    originAddress: Address;
    destinationLocationId: string;
    destinationAddress: Address;
    
    // WHY
    priority: "standard" | "expedited" | "rush" | "hot";
    
    // HOW
    status: ShipmentStatus;
    trackingNumber?: string;
    cost?: number;
    
    // IF/THEN
    specialInstructions?: string;
    liftgateRequired: boolean;
    insideDelivery: boolean;
    appointmentRequired: boolean;
    
    // Relationships
    purchaseOrderId?: string;
    vehicleId?: string;
}

export interface ShipmentItem {
    id: string;
    assetId?: string;
    description: string;
    quantity: number;
    weight?: number;
    dimensions?: Dimensions;
    value?: number;
    handlingInstructions?: string;
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
    primaryDriverId?: string;
    
    // WHAT
    capacity: number;
    capacityUnit: "lbs" | "kg" | "cu_ft" | "pallets";
    
    // WHEN
    registrationExpiry: string;
    insuranceExpiry: string;
    lastInspectionDate?: string;
    nextInspectionDate?: string;
    
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
    rackCount?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE — Budgets, Expenses, Revenue, Payroll
// ─────────────────────────────────────────────────────────────────────────────

export type BudgetCategory = 
    | "labor" | "materials" | "equipment_rental" | "equipment_purchase"
    | "fabrication" | "print" | "av" | "lighting" | "scenic"
    | "travel" | "lodging" | "per_diem" | "shipping" | "trucking"
    | "venue" | "permits" | "insurance" | "talent" | "catering"
    | "staffing" | "security" | "contingency" | "overhead" | "markup";

export interface Budget extends AuditFields {
    id: string;
    projectId: string;
    version: number;
    status: "draft" | "pending_approval" | "approved" | "locked";
    
    // WHO
    preparedById: string;
    approvedById?: string;
    
    // WHAT
    lineItems: BudgetLineItem[];
    
    // WHEN
    effectiveDate: string;
    
    // WHY
    notes?: string;
    
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
    subcategory?: string;
    description: string;
    phase: ProductionPhase;
    
    // WHO
    vendorId?: string;
    
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
    notes?: string;
    
    // Relationships
    purchaseOrderIds: string[];
    expenseIds: string[];
}

export interface Expense extends AuditFields {
    id: string;
    projectId: string;
    budgetLineItemId?: string;
    
    // WHO
    submittedById: string;
    approvedById?: string;
    vendorId?: string;
    
    // WHAT
    description: string;
    category: BudgetCategory;
    
    // WHEN
    expenseDate: string;
    submittedAt: string;
    approvedAt?: string;
    
    // WHY
    justification?: string;
    
    // HOW
    amount: number;
    currency: string;
    status: "draft" | "submitted" | "pending_approval" | "approved" | "rejected" | "reimbursed";
    paymentMethod: "corporate_card" | "personal_card" | "cash" | "check" | "wire" | "ach";
    
    // IF/THEN
    receiptUrl?: string;
    reimbursable: boolean;
    
    // Relationships
    purchaseOrderId?: string;
    invoiceId?: string;
}

export interface Invoice extends AuditFields {
    id: string;
    projectId: string;
    type: "vendor" | "client";
    number: string;
    
    // WHO
    vendorId?: string;
    clientId?: string;
    
    // WHAT
    description: string;
    lineItems: InvoiceLineItem[];
    
    // WHEN
    invoiceDate: string;
    dueDate: string;
    paidAt?: string;
    
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
    paymentInstructions?: string;
    
    // Relationships
    purchaseOrderId?: string;
    milestoneId?: string;
}

export interface InvoiceLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    budgetCategoryId?: string;
}

export interface TimeEntry extends AuditFields {
    id: string;
    projectId: string;
    crewMemberId: string;
    shiftId?: string;
    
    // WHO
    approvedById?: string;
    
    // WHAT
    description?: string;
    
    // WHEN
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    regularHours: number;
    overtimeHours: number;
    doubleTimeHours: number;
    
    // WHY
    taskId?: string;
    
    // HOW
    status: "draft" | "submitted" | "approved" | "rejected" | "processed";
    regularRate: number;
    overtimeRate: number;
    doubleTimeRate: number;
    totalPay: number;
    
    // IF/THEN
    notes?: string;
}

export interface PayrollBatch extends AuditFields {
    id: string;
    projectId?: string;
    periodStart: string;
    periodEnd: string;
    status: "draft" | "pending_approval" | "approved" | "processing" | "completed";
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    timeEntryIds: string[];
    processedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INCIDENTS — Safety, Issues, Resolution Tracking
// ─────────────────────────────────────────────────────────────────────────────

export type IncidentType = "safety" | "injury" | "property_damage" | "theft" | "security" | "weather" | "equipment_failure" | "vendor_issue" | "client_complaint" | "other";
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
    assignedToId?: string;
    
    // WHAT
    title: string;
    description: string;
    immediateActions: string;
    
    // WHEN
    occurredAt: string;
    reportedAt: string;
    resolvedAt?: string;
    
    // WHERE
    locationId?: string;
    specificLocation: string;
    
    // WHY
    severity: IncidentSeverity;
    rootCause?: string;
    
    // HOW
    status: "reported" | "investigating" | "pending_action" | "resolved" | "closed";
    resolution?: string;
    preventiveMeasures?: string;
    
    // IF/THEN
    insuranceClaim: boolean;
    claimNumber?: string;
    estimatedCost?: number;
    actualCost?: number;
    
    // Relationships
    attachmentIds: string[];
    followUpTaskIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE — SOPs, Templates, Documentation
// ─────────────────────────────────────────────────────────────────────────────

export type DocumentCategory = "sop" | "template" | "checklist" | "guide" | "policy" | "form" | "reference" | "training";

export interface KnowledgeBaseArticle extends AuditFields {
    id: string;
    category: DocumentCategory;
    department?: Department;
    
    // WHO
    authorId: string;
    reviewerIds: string[];
    
    // WHAT
    title: string;
    summary: string;
    content: string;
    tags: string[];
    
    // WHEN
    publishedAt?: string;
    reviewedAt?: string;
    nextReviewDate?: string;
    
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
    duration?: number;
    safetyNote?: string;
    imageUrl?: string;
}

export interface Checklist extends AuditFields {
    id: string;
    templateId?: string;
    projectId?: string;
    eventId?: string;
    
    // WHO
    assignedToId: string;
    completedById?: string;
    
    // WHAT
    title: string;
    items: ChecklistItem[];
    
    // WHEN
    dueDate?: string;
    completedAt?: string;
    
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
    completedAt?: string;
    completedById?: string;
    notes?: string;
    attachmentUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS — Standard Report Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type ReportType = 
    | "project_summary" | "budget_vs_actual" | "labor_summary" | "vendor_spend"
    | "asset_utilization" | "crew_utilization" | "incident_summary"
    | "milestone_status" | "procurement_status" | "logistics_summary"
    | "daily_production" | "wrap_report" | "post_mortem";

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
    groupBy?: string[];
    sortBy?: ReportSort[];
    
    // WHEN
    schedule?: ReportSchedule;
    
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
    width?: number;
    format?: "text" | "number" | "currency" | "date" | "percent";
    aggregate?: "sum" | "avg" | "count" | "min" | "max";
}

export interface ReportSort {
    field: string;
    direction: "asc" | "desc";
}

export interface ReportSchedule {
    frequency: "daily" | "weekly" | "monthly" | "on_demand";
    dayOfWeek?: number;
    dayOfMonth?: number;
    time?: string;
    recipientIds: string[];
}
