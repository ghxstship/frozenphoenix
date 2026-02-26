import type {
    WorkOrderFull,
    WorkOrderBid,
    DispatchEntry,
    VendorComplianceDoc,
    ComplianceRequirement,
    VendorReview,
    ChecklistTemplate,
    JobChecklist,
    Estimate,
    JobCostEntry,
    VendorCommunication,
    ServiceRequest,
} from "@/types/vendor-lifecycle";

// ─── Compliance Requirements ───
export const MOCK_COMPLIANCE_REQUIREMENTS: ComplianceRequirement[] = [
    { id: "cr1", name: "Certificate of Insurance (COI)", docType: "coi", description: "General liability insurance certificate", appliesToVendorTypes: ["vendor", "subcontractor", "independent_contractor"], appliesToCategories: [], isRequired: true, hasExpiry: true, expiryWarningDays: 30, autoSuspendOnExpiry: true, displayOrder: 1, isActive: true },
    { id: "cr2", name: "W-9 Tax Form", docType: "w9", description: "IRS W-9 for US-based contractors", appliesToVendorTypes: ["vendor", "subcontractor", "independent_contractor", "freelancer"], appliesToCategories: [], isRequired: true, hasExpiry: false, expiryWarningDays: 0, autoSuspendOnExpiry: false, displayOrder: 2, isActive: true },
    { id: "cr3", name: "Non-Disclosure Agreement", docType: "nda", description: "Standard NDA for confidential projects", appliesToVendorTypes: ["vendor", "subcontractor", "independent_contractor", "freelancer", "agency"], appliesToCategories: [], isRequired: true, hasExpiry: false, expiryWarningDays: 0, autoSuspendOnExpiry: false, displayOrder: 3, isActive: true },
    { id: "cr4", name: "Workers Compensation", docType: "workers_comp", description: "Workers comp insurance certificate", appliesToVendorTypes: ["subcontractor"], appliesToCategories: ["construction", "fabrication", "rigging"], isRequired: true, hasExpiry: true, expiryWarningDays: 30, autoSuspendOnExpiry: true, displayOrder: 4, isActive: true },
    { id: "cr5", name: "Business License", docType: "business_license", description: "Valid business license", appliesToVendorTypes: ["vendor", "subcontractor", "agency"], appliesToCategories: [], isRequired: false, hasExpiry: true, expiryWarningDays: 60, autoSuspendOnExpiry: false, displayOrder: 5, isActive: true },
    { id: "cr6", name: "Auto Insurance", docType: "auto_insurance", description: "Vehicle insurance for delivery/transport", appliesToVendorTypes: ["vendor", "subcontractor"], appliesToCategories: ["logistics", "trucking"], isRequired: true, hasExpiry: true, expiryWarningDays: 30, autoSuspendOnExpiry: true, displayOrder: 6, isActive: true },
    { id: "cr7", name: "Safety Certification", docType: "safety_cert", description: "OSHA or equivalent safety certification", appliesToVendorTypes: ["subcontractor", "independent_contractor"], appliesToCategories: ["construction", "rigging", "electrical"], isRequired: true, hasExpiry: true, expiryWarningDays: 60, autoSuspendOnExpiry: false, displayOrder: 7, isActive: true },
    { id: "cr8", name: "Master Service Agreement", docType: "msa", description: "Executed MSA", appliesToVendorTypes: ["vendor", "agency"], appliesToCategories: [], isRequired: false, hasExpiry: true, expiryWarningDays: 90, autoSuspendOnExpiry: false, displayOrder: 8, isActive: true },
];

// ─── Vendor Compliance Documents ───
export const MOCK_VENDOR_COMPLIANCE_DOCS: VendorComplianceDoc[] = [
    { id: "vcd1", vendorId: "v1", requirementId: "cr1", docType: "coi", docName: "COI - General Liability", docNumber: "GL-2026-4412", documentUrl: "/docs/coi-v1.pdf", issuedDate: "2025-12-01", expiryDate: "2026-12-01", submittedAt: "2025-12-05T10:00:00Z", reviewedAt: "2025-12-06T09:00:00Z", status: "approved", coverageAmount: 2000000, policyNumber: "GL-2026-4412", carrierName: "Hartford Insurance" },
    { id: "vcd2", vendorId: "v1", requirementId: "cr2", docType: "w9", docName: "W-9 Form", documentUrl: "/docs/w9-v1.pdf", submittedAt: "2025-11-15T10:00:00Z", reviewedAt: "2025-11-16T09:00:00Z", status: "approved" },
    { id: "vcd3", vendorId: "v1", requirementId: "cr3", docType: "nda", docName: "NDA - Standard", documentUrl: "/docs/nda-v1.pdf", issuedDate: "2025-11-01", submittedAt: "2025-11-02T10:00:00Z", reviewedAt: "2025-11-03T09:00:00Z", status: "approved" },
    { id: "vcd4", vendorId: "v2", requirementId: "cr1", docType: "coi", docName: "COI - General Liability", expiryDate: "2026-01-15", submittedAt: "2025-06-01T10:00:00Z", reviewedAt: "2025-06-02T09:00:00Z", status: "expired", coverageAmount: 1000000, carrierName: "State Farm" },
    { id: "vcd5", vendorId: "v2", requirementId: "cr2", docType: "w9", docName: "W-9 Form", documentUrl: "/docs/w9-v2.pdf", submittedAt: "2025-06-01T10:00:00Z", reviewedAt: "2025-06-02T09:00:00Z", status: "approved" },
    { id: "vcd6", vendorId: "v3", requirementId: "cr1", docType: "coi", docName: "COI - General Liability", expiryDate: "2026-04-30", submittedAt: "2025-10-01T10:00:00Z", status: "expiring_soon", coverageAmount: 5000000, carrierName: "Zurich" },
    { id: "vcd7", vendorId: "v3", requirementId: "cr2", docType: "w9", docName: "W-9 Form", submittedAt: "2025-10-01T10:00:00Z", status: "approved" },
    { id: "vcd8", vendorId: "v3", requirementId: "cr3", docType: "nda", docName: "NDA - Standard", submittedAt: "2025-10-01T10:00:00Z", status: "approved" },
    { id: "vcd9", vendorId: "v3", requirementId: "cr4", docType: "workers_comp", docName: "Workers Comp Certificate", expiryDate: "2026-09-01", submittedAt: "2025-10-05T10:00:00Z", status: "approved", coverageAmount: 500000 },
    { id: "vcd10", vendorId: "v4", requirementId: "cr1", docType: "coi", docName: "COI - General Liability", submittedAt: "2026-02-01T10:00:00Z", status: "pending_review" },
    { id: "vcd11", vendorId: "v5", requirementId: "cr2", docType: "w9", docName: "W-9 Form", submittedAt: "2026-01-20T10:00:00Z", status: "not_submitted" },
];

// ─── Work Orders ───
export const MOCK_WORK_ORDERS: WorkOrderFull[] = [
    { id: "wo1", projectId: "p1", projectName: "Coachella Main Stage 2026", number: "WO-2026-001", title: "Stage Steel Frame Fabrication", description: "Custom steel frame fabrication and welding for main stage structure", vendorId: "v1", vendorName: "SteelCraft Fabrication", category: "fabrication", department: "construction", phase: "fabrication", scheduledStart: "2026-02-15T08:00:00Z", scheduledEnd: "2026-03-10T18:00:00Z", estimatedHours: 480, estimatedCost: 185000, notToExceed: 200000, priority: "high", status: "in_progress", isOpenForBids: false, requiresChecklistCompletion: true, completionPhotos: [], assignedCrewIds: [], createdAt: "2026-01-20T10:00:00Z" },
    { id: "wo2", projectId: "p1", projectName: "Coachella Main Stage 2026", number: "WO-2026-002", title: "LED Panel Installation", description: "Install and configure 200 LED panels across main stage facade", vendorId: "v3", vendorName: "Lumina AV Solutions", category: "av", department: "technical", phase: "fabrication", scheduledStart: "2026-03-12T08:00:00Z", scheduledEnd: "2026-03-25T18:00:00Z", estimatedHours: 240, estimatedCost: 95000, priority: "high", status: "scheduled", isOpenForBids: false, requiresChecklistCompletion: true, completionPhotos: [], assignedCrewIds: [], createdAt: "2026-01-25T10:00:00Z" },
    { id: "wo3", projectId: "p1", projectName: "Coachella Main Stage 2026", number: "WO-2026-003", title: "Rigging & Truss Setup", description: "Full rigging package including motors, truss, and safety inspection", category: "rigging", department: "technical", phase: "load_in", scheduledStart: "2026-03-28T06:00:00Z", scheduledEnd: "2026-04-02T18:00:00Z", estimatedHours: 160, estimatedCost: 72000, priority: "urgent", status: "posted", isOpenForBids: true, bidDeadline: "2026-03-01T23:59:00Z", maxBidders: 5, requiresChecklistCompletion: true, completionPhotos: [], assignedCrewIds: [], createdAt: "2026-02-01T10:00:00Z" },
    { id: "wo4", projectId: "p2", projectName: "Glossier Pop-Up NYC", number: "WO-2026-004", title: "Custom Fixture Fabrication", description: "Fabricate 12 custom display fixtures per design specs", vendorId: "v1", vendorName: "SteelCraft Fabrication", category: "fabrication", phase: "fabrication", scheduledStart: "2026-02-10T08:00:00Z", scheduledEnd: "2026-02-28T18:00:00Z", estimatedHours: 120, actualHours: 110, estimatedCost: 28000, actualCost: 26500, priority: "normal", status: "completed", isOpenForBids: false, requiresChecklistCompletion: false, completedAt: "2026-02-27T16:00:00Z", completionNotes: "All 12 fixtures delivered and inspected", completionPhotos: ["/photos/wo4-1.jpg", "/photos/wo4-2.jpg"], assignedCrewIds: [], createdAt: "2026-01-15T10:00:00Z" },
    { id: "wo5", projectId: "p2", projectName: "Glossier Pop-Up NYC", number: "WO-2026-005", title: "Electrical & Lighting Install", description: "Full electrical and specialty lighting installation", vendorId: "v3", vendorName: "Lumina AV Solutions", category: "electrical", department: "technical", scheduledStart: "2026-03-01T07:00:00Z", scheduledEnd: "2026-03-03T20:00:00Z", estimatedHours: 36, estimatedCost: 14500, priority: "high", status: "accepted", isOpenForBids: false, requiresChecklistCompletion: true, completionPhotos: [], assignedCrewIds: [], createdAt: "2026-02-10T10:00:00Z" },
    { id: "wo6", projectId: "p3", projectName: "Nike SXSW Activation", number: "WO-2026-006", title: "Scenic Painting & Graphics", description: "Large format scenic painting and vinyl graphics application", category: "scenic", department: "scenic", phase: "fabrication", scheduledStart: "2026-03-05T08:00:00Z", scheduledEnd: "2026-03-12T18:00:00Z", estimatedHours: 80, estimatedCost: 32000, priority: "normal", status: "bidding", isOpenForBids: true, bidDeadline: "2026-02-28T23:59:00Z", maxBidders: 3, requiresChecklistCompletion: false, completionPhotos: [], assignedCrewIds: [], createdAt: "2026-02-05T10:00:00Z" },
    { id: "wo7", projectId: "p1", projectName: "Coachella Main Stage 2026", number: "WO-2026-007", title: "Freight & Trucking - Stage Components", description: "Cross-country freight for stage steel and scenic elements", vendorId: "v6", vendorName: "Express Stage Logistics", category: "logistics", department: "logistics", phase: "logistics", scheduledStart: "2026-03-20T06:00:00Z", scheduledEnd: "2026-03-26T20:00:00Z", estimatedHours: 48, estimatedCost: 18500, priority: "high", status: "assigned", isOpenForBids: false, requiresChecklistCompletion: false, completionPhotos: [], assignedCrewIds: [], createdAt: "2026-02-10T10:00:00Z" },
    { id: "wo8", projectId: "p1", projectName: "Coachella Main Stage 2026", number: "WO-2026-008", title: "Audio System Install & Tune", description: "L-Acoustics main PA deployment, delay towers, and system tuning", category: "audio", department: "technical", phase: "load_in", scheduledStart: "2026-04-01T06:00:00Z", scheduledEnd: "2026-04-05T22:00:00Z", estimatedHours: 200, estimatedCost: 45000, priority: "high", status: "draft", isOpenForBids: false, requiresChecklistCompletion: true, completionPhotos: [], assignedCrewIds: [], createdAt: "2026-02-15T10:00:00Z" },
];

// ─── Work Order Bids ───
export const MOCK_WORK_ORDER_BIDS: WorkOrderBid[] = [
    { id: "bid1", workOrderId: "wo3", vendorId: "v3", vendorName: "Lumina AV Solutions", bidAmount: 68000, estimatedHours: 150, proposedStart: "2026-03-28T06:00:00Z", proposedEnd: "2026-04-01T18:00:00Z", notes: "Includes all rigging hardware and certified crew", status: "submitted", submittedAt: "2026-02-10T14:00:00Z" },
    { id: "bid2", workOrderId: "wo3", vendorId: "v7", vendorName: "Apex Rigging Co", bidAmount: 74500, estimatedHours: 160, proposedStart: "2026-03-28T07:00:00Z", proposedEnd: "2026-04-02T18:00:00Z", notes: "Full crew of 12 certified riggers, includes safety inspection", status: "submitted", submittedAt: "2026-02-12T09:00:00Z" },
    { id: "bid3", workOrderId: "wo6", vendorId: "v8", vendorName: "Scenic Arts Studio", bidAmount: 29500, estimatedHours: 72, proposedStart: "2026-03-05T08:00:00Z", proposedEnd: "2026-03-11T18:00:00Z", notes: "Team of 4 scenic artists, materials included", status: "submitted", submittedAt: "2026-02-15T11:00:00Z" },
    { id: "bid4", workOrderId: "wo6", vendorId: "v9", vendorName: "ColorWorks Graphics", bidAmount: 34000, estimatedHours: 80, proposedStart: "2026-03-06T08:00:00Z", proposedEnd: "2026-03-12T18:00:00Z", notes: "Includes UV-resistant coatings for outdoor use", status: "under_review", submittedAt: "2026-02-16T10:00:00Z" },
];

// ─── Dispatch Entries ───
export const MOCK_DISPATCH_ENTRIES: DispatchEntry[] = [
    { id: "de1", workOrderId: "wo1", vendorId: "v1", vendorName: "SteelCraft Fabrication", role: "Lead Fabricator", status: "in_progress", dispatchedAt: "2026-02-15T07:30:00Z", arrivedAt: "2026-02-15T08:00:00Z", startedAt: "2026-02-15T08:15:00Z", dispatchNotes: "Access via loading dock B" },
    { id: "de2", workOrderId: "wo1", crewMemberId: "c1", crewMemberName: "Mike Torres", role: "Welding Supervisor", status: "in_progress", dispatchedAt: "2026-02-15T07:00:00Z", arrivedAt: "2026-02-15T07:45:00Z", startedAt: "2026-02-15T08:00:00Z" },
    { id: "de3", workOrderId: "wo5", vendorId: "v3", vendorName: "Lumina AV Solutions", role: "Lead Electrician", status: "accepted", dispatchedAt: "2026-02-28T10:00:00Z", confirmedAt: "2026-02-28T10:30:00Z", dispatchNotes: "Bring 200A disconnect and panel" },
    { id: "de4", workOrderId: "wo7", vendorId: "v6", vendorName: "Express Stage Logistics", role: "Trucking", status: "en_route", dispatchedAt: "2026-03-20T05:00:00Z", dispatchNotes: "3 x 53ft trailers, liftgate required at destination" },
    { id: "de5", workOrderId: "wo4", vendorId: "v1", vendorName: "SteelCraft Fabrication", role: "Fabrication Team", status: "completed", dispatchedAt: "2026-02-10T07:00:00Z", arrivedAt: "2026-02-10T08:00:00Z", startedAt: "2026-02-10T08:15:00Z", completedAt: "2026-02-27T16:00:00Z" },
    { id: "de6", workOrderId: "wo2", vendorId: "v3", vendorName: "Lumina AV Solutions", role: "AV Installation Crew", status: "offered", dispatchedAt: "2026-03-01T10:00:00Z", dispatchNotes: "Waiting for vendor confirmation" },
];

// ─── Vendor Reviews ───
export const MOCK_VENDOR_REVIEWS: VendorReview[] = [
    { id: "vr1", vendorId: "v1", vendorName: "SteelCraft Fabrication", projectId: "p2", projectName: "Glossier Pop-Up NYC", reviewerId: "u1", reviewerName: "Alex Rivera", reviewType: "project_completion", overallRating: 5, qualityRating: 5, timelinessRating: 5, communicationRating: 4, professionalismRating: 5, valueRating: 4, safetyRating: 5, strengths: "Exceptional weld quality, delivered 1 day ahead of schedule", improvements: "Could improve communication on material sourcing delays", comments: "Top-tier fabrication partner. Will definitely use again for Coachella.", wouldRehire: true, reviewDate: "2026-02-28" },
    { id: "vr2", vendorId: "v1", vendorName: "SteelCraft Fabrication", projectId: "p1", projectName: "Coachella Main Stage 2026", reviewerId: "u2", reviewerName: "Jordan Park", reviewType: "periodic", overallRating: 4, qualityRating: 5, timelinessRating: 4, communicationRating: 4, professionalismRating: 5, valueRating: 4, safetyRating: 5, strengths: "Consistent quality across multiple projects", comments: "Reliable vendor, handles large-scale projects well", wouldRehire: true, reviewDate: "2026-02-20" },
    { id: "vr3", vendorId: "v3", vendorName: "Lumina AV Solutions", projectId: "p2", projectName: "Glossier Pop-Up NYC", reviewerId: "u1", reviewerName: "Alex Rivera", reviewType: "project_completion", overallRating: 4, qualityRating: 4, timelinessRating: 3, communicationRating: 4, professionalismRating: 4, valueRating: 3, improvements: "Pricing was higher than quoted due to change orders", comments: "Good AV work but needs to be more transparent on change order costs", wouldRehire: true, reviewDate: "2026-03-01" },
    { id: "vr4", vendorId: "v2", vendorName: "EventTech Rentals", reviewerId: "u2", reviewerName: "Jordan Park", reviewType: "incident", overallRating: 2, qualityRating: 3, timelinessRating: 1, communicationRating: 2, professionalismRating: 2, safetyRating: 3, improvements: "Delivered equipment 2 days late with missing components. Poor communication about delays.", comments: "Significant issues on this project. Need to discuss before future assignments.", wouldRehire: false, reviewDate: "2026-01-15" },
    { id: "vr5", vendorId: "v6", vendorName: "Express Stage Logistics", projectId: "p1", projectName: "Coachella Main Stage 2026", reviewerId: "u1", reviewerName: "Alex Rivera", reviewType: "project_completion", overallRating: 5, qualityRating: 5, timelinessRating: 5, communicationRating: 5, professionalismRating: 5, valueRating: 5, safetyRating: 5, strengths: "GPS tracking, proactive communication, zero damage", comments: "Best logistics vendor we've worked with. Setting the standard.", wouldRehire: true, reviewDate: "2026-02-25" },
];

// ─── Checklist Templates ───
export const MOCK_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
    { id: "ct1", name: "Stage Load-In Checklist", description: "Standard checklist for stage load-in operations", category: "load_in", department: "production", items: [
        { id: "i1", title: "Verify site access and credentials", required: true, order: 1 },
        { id: "i2", title: "Confirm power drop locations match tech rider", required: true, order: 2 },
        { id: "i3", title: "Safety briefing for all crew", required: true, order: 3 },
        { id: "i4", title: "Unload trucks in correct order", required: true, order: 4 },
        { id: "i5", title: "Set ground protection / floor covering", required: false, order: 5 },
        { id: "i6", title: "Mark grid points on deck", required: true, order: 6 },
        { id: "i7", title: "Document pre-existing venue damage", required: true, order: 7, description: "Photo document any existing damage before work begins" },
    ], isActive: true, usageCount: 24 },
    { id: "ct2", name: "Rigging Safety Inspection", description: "Pre-show rigging safety verification checklist", category: "safety", department: "technical", items: [
        { id: "i8", title: "Verify all rigging points against plot", required: true, order: 1 },
        { id: "i9", title: "Check all shackles and hardware", required: true, order: 2 },
        { id: "i10", title: "Verify motor chain condition", required: true, order: 3 },
        { id: "i11", title: "Load cell readings within spec", required: true, order: 4 },
        { id: "i12", title: "Secondary safety cables installed", required: true, order: 5 },
        { id: "i13", title: "Wind speed monitoring active (outdoor)", required: false, order: 6 },
    ], isActive: true, usageCount: 18 },
    { id: "ct3", name: "Vendor Work Completion", description: "Checklist for verifying vendor work order completion", category: "quality", items: [
        { id: "i14", title: "All deliverables match scope of work", required: true, order: 1 },
        { id: "i15", title: "Quality inspection passed", required: true, order: 2 },
        { id: "i16", title: "Completion photos uploaded", required: true, order: 3 },
        { id: "i17", title: "Site left clean and organized", required: true, order: 4 },
        { id: "i18", title: "All tools and equipment removed", required: true, order: 5 },
        { id: "i19", title: "Client/PM sign-off obtained", required: false, order: 6 },
    ], isActive: true, usageCount: 42 },
    { id: "ct4", name: "AV System Check", description: "Audio/Visual system pre-show verification", category: "technical", department: "technical", items: [
        { id: "i20", title: "All speakers powered and tested", required: true, order: 1 },
        { id: "i21", title: "Video sources verified on all screens", required: true, order: 2 },
        { id: "i22", title: "Backup playback systems ready", required: true, order: 3 },
        { id: "i23", title: "Intercom/comms check complete", required: true, order: 4 },
        { id: "i24", title: "Recording systems armed", required: false, order: 5 },
    ], isActive: true, usageCount: 15 },
];

// ─── Job Checklists ───
export const MOCK_JOB_CHECKLISTS: JobChecklist[] = [
    { id: "jc1", templateId: "ct1", workOrderId: "wo1", projectId: "p1", title: "Stage Load-In - Main Stage", vendorId: "v1", status: "in_progress", totalItems: 7, completedItems: 4, completionPercent: 57, dueDate: "2026-03-10", items: [
        { id: "ji1", title: "Verify site access and credentials", completed: true, completedAt: "2026-02-15T08:00:00Z", completedBy: "Mike Torres", required: true },
        { id: "ji2", title: "Confirm power drop locations match tech rider", completed: true, completedAt: "2026-02-15T08:30:00Z", completedBy: "Mike Torres", required: true },
        { id: "ji3", title: "Safety briefing for all crew", completed: true, completedAt: "2026-02-15T08:45:00Z", completedBy: "Alex Rivera", required: true },
        { id: "ji4", title: "Unload trucks in correct order", completed: true, completedAt: "2026-02-15T10:00:00Z", completedBy: "SteelCraft Team", required: true },
        { id: "ji5", title: "Set ground protection / floor covering", completed: false, required: false },
        { id: "ji6", title: "Mark grid points on deck", completed: false, required: true },
        { id: "ji7", title: "Document pre-existing venue damage", completed: false, required: true },
    ] },
    { id: "jc2", templateId: "ct3", workOrderId: "wo4", projectId: "p2", title: "Vendor Completion - Custom Fixtures", vendorId: "v1", status: "completed", totalItems: 6, completedItems: 6, completionPercent: 100, dueDate: "2026-02-28", completedAt: "2026-02-27T16:00:00Z", items: [
        { id: "ji8", title: "All deliverables match scope of work", completed: true, completedAt: "2026-02-27T14:00:00Z", completedBy: "Jordan Park", required: true },
        { id: "ji9", title: "Quality inspection passed", completed: true, completedAt: "2026-02-27T14:30:00Z", completedBy: "Jordan Park", required: true },
        { id: "ji10", title: "Completion photos uploaded", completed: true, completedAt: "2026-02-27T15:00:00Z", completedBy: "SteelCraft", photoUrl: "/photos/wo4-complete.jpg", required: true },
        { id: "ji11", title: "Site left clean and organized", completed: true, completedAt: "2026-02-27T15:30:00Z", completedBy: "SteelCraft", required: true },
        { id: "ji12", title: "All tools and equipment removed", completed: true, completedAt: "2026-02-27T15:45:00Z", completedBy: "SteelCraft", required: true },
        { id: "ji13", title: "Client/PM sign-off obtained", completed: true, completedAt: "2026-02-27T16:00:00Z", completedBy: "Jordan Park", required: false },
    ] },
    { id: "jc3", templateId: "ct2", workOrderId: "wo3", projectId: "p1", title: "Rigging Safety - Main Stage", status: "not_started", totalItems: 6, completedItems: 0, completionPercent: 0, dueDate: "2026-04-02", items: [
        { id: "ji14", title: "Verify all rigging points against plot", completed: false, required: true },
        { id: "ji15", title: "Check all shackles and hardware", completed: false, required: true },
        { id: "ji16", title: "Verify motor chain condition", completed: false, required: true },
        { id: "ji17", title: "Load cell readings within spec", completed: false, required: true },
        { id: "ji18", title: "Secondary safety cables installed", completed: false, required: true },
        { id: "ji19", title: "Wind speed monitoring active", completed: false, required: false },
    ] },
];

// ─── Estimates ───
export const MOCK_ESTIMATES: Estimate[] = [
    { id: "est1", companyId: "comp1", companyName: "Nike", contactId: "con1", contactName: "Sarah Chen", dealId: "d1", number: "EST-2026-001", title: "SXSW Brand Activation Package", description: "Complete activation build including fabrication, AV, lighting, and staffing", lineItems: [
        { id: "eli1", name: "Custom Booth Fabrication", description: "20x30 custom booth structure with branded panels", qty: 1, unit: "lot", unitPrice: 85000, total: 85000, optional: false },
        { id: "eli2", name: "LED Video Wall", description: "12x8 LED wall with media server", qty: 1, unit: "ea", unitPrice: 45000, total: 45000, optional: false },
        { id: "eli3", name: "Lighting Package", description: "Full lighting design and equipment", qty: 1, unit: "lot", unitPrice: 28000, total: 28000, optional: false },
        { id: "eli4", name: "Audio System", description: "PA system with DJ setup", qty: 1, unit: "lot", unitPrice: 18000, total: 18000, optional: false },
        { id: "eli5", name: "Brand Ambassadors", description: "Team of 8 brand ambassadors for 4 days", qty: 32, unit: "day", unitPrice: 350, total: 11200, optional: false },
        { id: "eli6", name: "Interactive Photo Experience", description: "AR photo booth with social sharing", qty: 1, unit: "ea", unitPrice: 22000, total: 22000, optional: true },
    ], subtotal: 209200, discountPercent: 5, discountAmount: 10460, taxPercent: 0, taxAmount: 0, total: 198740, currency: "USD", validUntil: "2026-03-01", proposedStartDate: "2026-03-08", proposedEndDate: "2026-03-16", status: "sent", sentAt: "2026-02-20T15:00:00Z", signatureRequired: true, createdAt: "2026-02-18T10:00:00Z" },
    { id: "est2", companyId: "comp2", companyName: "Louis Vuitton", contactId: "con2", contactName: "Pierre Moreau", dealId: "d2", number: "EST-2026-002", title: "Art Basel Installation Concept", description: "Immersive art installation for Art Basel Miami", lineItems: [
        { id: "eli7", name: "Scenic Design & Engineering", qty: 1, unit: "lot", unitPrice: 180000, total: 180000, optional: false },
        { id: "eli8", name: "Custom Fabrication", qty: 1, unit: "lot", unitPrice: 420000, total: 420000, optional: false },
        { id: "eli9", name: "Projection Mapping System", qty: 1, unit: "lot", unitPrice: 165000, total: 165000, optional: false },
        { id: "eli10", name: "Interactive Technology Layer", qty: 1, unit: "lot", unitPrice: 95000, total: 95000, optional: true },
        { id: "eli11", name: "Project Management", qty: 1, unit: "lot", unitPrice: 85000, total: 85000, optional: false },
    ], subtotal: 945000, discountPercent: 0, discountAmount: 0, taxPercent: 0, taxAmount: 0, total: 945000, currency: "USD", validUntil: "2026-03-15", proposedStartDate: "2026-06-01", proposedEndDate: "2026-12-05", status: "viewed", sentAt: "2026-02-22T10:00:00Z", viewedAt: "2026-02-23T14:30:00Z", signatureRequired: true, createdAt: "2026-02-21T10:00:00Z" },
    { id: "est3", companyId: "comp3", companyName: "Tesla", contactId: "con3", contactName: "Mike Wong", dealId: "d3", number: "EST-2026-003", title: "CES Booth Design & Build", description: "Premium expo booth for CES", lineItems: [
        { id: "eli12", name: "Booth Design & Engineering", qty: 1, unit: "lot", unitPrice: 65000, total: 65000, optional: false },
        { id: "eli13", name: "Booth Fabrication & Build", qty: 1, unit: "lot", unitPrice: 320000, total: 320000, optional: false },
        { id: "eli14", name: "AV & Technology Package", qty: 1, unit: "lot", unitPrice: 210000, total: 210000, optional: false },
        { id: "eli15", name: "Logistics & I&D", qty: 1, unit: "lot", unitPrice: 95000, total: 95000, optional: false },
    ], subtotal: 690000, discountPercent: 0, discountAmount: 0, taxPercent: 0, taxAmount: 0, total: 690000, currency: "USD", validUntil: "2026-04-01", status: "draft", signatureRequired: true, createdAt: "2026-02-24T10:00:00Z" },
    { id: "est4", companyName: "Spotify", contactName: "Dana Lee", number: "EST-2026-004", title: "Podcast Studio Pop-Up", description: "Temporary podcast studio activation", lineItems: [
        { id: "eli16", name: "Studio Build & Soundproofing", qty: 1, unit: "lot", unitPrice: 42000, total: 42000, optional: false },
        { id: "eli17", name: "Recording Equipment", qty: 1, unit: "lot", unitPrice: 18000, total: 18000, optional: false },
        { id: "eli18", name: "Branding & Graphics", qty: 1, unit: "lot", unitPrice: 8500, total: 8500, optional: false },
    ], subtotal: 68500, discountPercent: 0, discountAmount: 0, taxPercent: 0, taxAmount: 0, total: 68500, currency: "USD", validUntil: "2026-03-15", status: "accepted", acceptedAt: "2026-02-22T16:00:00Z", signedBy: "Dana Lee", signedAt: "2026-02-22T16:00:00Z", signatureRequired: true, createdAt: "2026-02-15T10:00:00Z" },
];

// ─── Job Cost Entries ───
export const MOCK_JOB_COST_ENTRIES: JobCostEntry[] = [
    { id: "jce1", projectId: "p1", projectName: "Coachella Main Stage 2026", workOrderId: "wo1", costType: "subcontractor", description: "SteelCraft - Stage frame fabrication", vendorId: "v1", vendorName: "SteelCraft Fabrication", quantity: 1, unit: "lot", unitCost: 185000, totalCost: 185000, budgetedAmount: 200000, costDate: "2026-02-15", billable: true, billed: false },
    { id: "jce2", projectId: "p1", projectName: "Coachella Main Stage 2026", workOrderId: "wo1", costType: "material", description: "Structural steel - I-beams and tube steel", quantity: 12, unit: "ton", unitCost: 3200, totalCost: 38400, budgetedAmount: 40000, costDate: "2026-02-10", billable: true, billed: false },
    { id: "jce3", projectId: "p1", projectName: "Coachella Main Stage 2026", costType: "labor", description: "Welding crew - overtime hours", crewMemberId: "c1", crewMemberName: "Mike Torres", quantity: 24, unit: "hr", unitCost: 95, totalCost: 2280, budgetedAmount: 2000, costDate: "2026-02-20", billable: true, billed: false },
    { id: "jce4", projectId: "p1", projectName: "Coachella Main Stage 2026", workOrderId: "wo2", costType: "equipment", description: "LED panel rental - 200 units x 14 days", vendorId: "v3", vendorName: "Lumina AV Solutions", quantity: 200, unit: "unit-day", unitCost: 35, totalCost: 7000, budgetedAmount: 8000, costDate: "2026-03-12", billable: true, billed: false },
    { id: "jce5", projectId: "p2", projectName: "Glossier Pop-Up NYC", workOrderId: "wo4", costType: "subcontractor", description: "SteelCraft - Custom fixture fabrication", vendorId: "v1", vendorName: "SteelCraft Fabrication", quantity: 1, unit: "lot", unitCost: 26500, totalCost: 26500, budgetedAmount: 28000, costDate: "2026-02-27", billable: true, billed: true },
    { id: "jce6", projectId: "p2", projectName: "Glossier Pop-Up NYC", costType: "material", description: "Custom acrylic panels and hardware", quantity: 1, unit: "lot", unitCost: 8200, totalCost: 8200, budgetedAmount: 9000, costDate: "2026-02-12", billable: true, billed: true },
    { id: "jce7", projectId: "p2", projectName: "Glossier Pop-Up NYC", costType: "expense", description: "Permit fees - NYC DOB", quantity: 1, unit: "ea", unitCost: 2500, totalCost: 2500, budgetedAmount: 3000, costDate: "2026-02-05", billable: true, billed: true },
    { id: "jce8", projectId: "p2", projectName: "Glossier Pop-Up NYC", costType: "labor", description: "Install crew - 4 days", crewMemberName: "Install Team", quantity: 128, unit: "hr", unitCost: 65, totalCost: 8320, budgetedAmount: 8500, costDate: "2026-03-01", billable: true, billed: false },
    { id: "jce9", projectId: "p1", projectName: "Coachella Main Stage 2026", costType: "overhead", description: "Project management overhead", quantity: 1, unit: "lot", unitCost: 35000, totalCost: 35000, budgetedAmount: 35000, costDate: "2026-02-01", billable: false, billed: false },
    { id: "jce10", projectId: "p1", projectName: "Coachella Main Stage 2026", workOrderId: "wo7", costType: "subcontractor", description: "Express Stage Logistics - Freight", vendorId: "v6", vendorName: "Express Stage Logistics", quantity: 1, unit: "lot", unitCost: 18500, totalCost: 18500, budgetedAmount: 20000, costDate: "2026-03-20", billable: true, billed: false },
];

// ─── Vendor Communications ───
export const MOCK_VENDOR_COMMUNICATIONS: VendorCommunication[] = [
    { id: "vc1", vendorId: "v1", workOrderId: "wo1", projectId: "p1", channel: "in_app", direction: "outbound", subject: "WO-2026-001 Assigned", body: "Hi SteelCraft team, WO-2026-001 has been assigned to you for the Coachella main stage steel frame fabrication. Please confirm acceptance.", senderName: "Alex Rivera", createdAt: "2026-02-14T10:00:00Z", attachmentUrls: [] },
    { id: "vc2", vendorId: "v1", workOrderId: "wo1", projectId: "p1", channel: "in_app", direction: "inbound", subject: "Re: WO-2026-001 Assigned", body: "Confirmed! We'll have the crew on site Feb 15 at 8am. Material order placed.", senderName: "John Steel", readAt: "2026-02-14T11:30:00Z", createdAt: "2026-02-14T11:00:00Z", attachmentUrls: [] },
    { id: "vc3", vendorId: "v1", workOrderId: "wo1", channel: "email", direction: "outbound", subject: "Updated drawings - Rev C", body: "Attached are the updated structural drawings (Rev C). Please review and confirm you can accommodate the changes to the upstage truss connection points.", senderName: "Jordan Park", createdAt: "2026-02-18T14:00:00Z", attachmentUrls: ["/docs/stage-drawings-revC.pdf"] },
    { id: "vc4", vendorId: "v3", workOrderId: "wo5", channel: "in_app", direction: "outbound", subject: "Electrical install details", body: "Please review the attached electrical plan for the Glossier pop-up. Note the 200A service requirement.", senderName: "Alex Rivera", createdAt: "2026-02-25T09:00:00Z", attachmentUrls: ["/docs/glossier-electrical-plan.pdf"] },
    { id: "vc5", vendorId: "v2", channel: "email", direction: "outbound", subject: "COI Renewal Required", body: "Your Certificate of Insurance has expired. Please upload a current COI to maintain active status. Your account will be suspended if not received within 14 days.", senderName: "System", createdAt: "2026-01-16T08:00:00Z", attachmentUrls: [] },
];

// ─── Service Requests (Jobber feature parity) ───
export const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [
    { id: "sr1", companyName: "Nike", contactName: "Sarah Chen", requesterEmail: "sarah.chen@nike.com", title: "SXSW Booth Setup — Rush Request", description: "Need a complete booth setup for SXSW including fabrication, AV, and lighting. Tight timeline — event is March 8-16.", category: "fabrication", serviceType: "Event Build", preferredDate: "2026-03-05", isFlexible: false, priority: "urgent", status: "new", source: "client_portal", requiresAssessment: true, attachmentUrls: ["/docs/nike-sxsw-brief.pdf"], createdAt: "2026-02-24T14:30:00Z" },
    { id: "sr2", companyName: "Glossier", contactName: "Emma Rose", requesterEmail: "emma@glossier.com", title: "Pop-Up Extension — Additional Week", description: "The NYC pop-up has been so successful we'd like to extend for one additional week. Need to assess if the venue and vendors can accommodate.", category: "general", serviceType: "Extension", preferredDate: "2026-03-10", isFlexible: true, priority: "high", status: "acknowledged", source: "email", requiresAssessment: false, assignedToName: "Alex Rivera", attachmentUrls: [], createdAt: "2026-02-23T09:15:00Z" },
    { id: "sr3", companyName: "Red Bull", contactName: "Max Kepler", requesterEmail: "max.k@redbull.com", requesterPhone: "+1-555-0199", title: "Festival Stage Audio Upgrade", description: "Looking to upgrade the main stage audio from last year's setup. Need L-Acoustics K2 system with delay towers.", category: "audio", serviceType: "Equipment Upgrade", preferredDate: "2026-04-01", preferredTimeStart: "09:00", preferredTimeEnd: "17:00", isFlexible: true, priority: "normal", status: "assessment_scheduled", source: "phone", requiresAssessment: true, assessmentDate: "2026-02-28T10:00:00Z", assessedByName: "Jordan Park", assignedToName: "Jordan Park", attachmentUrls: [], createdAt: "2026-02-20T16:00:00Z" },
    { id: "sr4", contactName: "Lisa Tran", requesterName: "Lisa Tran", requesterEmail: "lisa.tran@startup.io", title: "Product Launch Event — Full Service", description: "Tech startup product launch. Need venue styling, AV, lighting, catering coordination, and photo/video. 200 attendees.", category: "events", serviceType: "Full Production", preferredDate: "2026-04-15", isFlexible: true, priority: "normal", status: "quoted", source: "website_form", requiresAssessment: false, convertedToType: "estimate", convertedToId: "est5", assignedToName: "Alex Rivera", attachmentUrls: ["/docs/startup-launch-mood.pdf"], createdAt: "2026-02-18T11:00:00Z" },
    { id: "sr5", companyName: "Louis Vuitton", contactName: "Pierre Moreau", requesterEmail: "p.moreau@lvmh.com", title: "Art Basel Installation — Site Survey", description: "Need a site survey and feasibility assessment for a large-scale immersive installation at Art Basel Miami.", category: "fabrication", serviceType: "Site Survey", preferredDate: "2026-03-15", isFlexible: false, priority: "high", status: "converted", source: "client_portal", requiresAssessment: true, assessmentDate: "2026-02-15T14:00:00Z", assessmentNotes: "Site is 5000 sq ft, ceiling height 24ft. Power available: 400A 3-phase. Load-in via loading dock only.", assessedByName: "Jordan Park", convertedToType: "estimate", convertedToId: "est2", convertedAt: "2026-02-21T10:00:00Z", assignedToName: "Alex Rivera", attachmentUrls: [], createdAt: "2026-02-10T09:00:00Z" },
    { id: "sr6", requesterName: "Dave Miller", requesterEmail: "dave@localband.com", requesterPhone: "+1-555-0177", title: "Concert Lighting Rental", description: "Need stage lighting package for a 500-cap venue show. 2 nights.", category: "lighting", serviceType: "Equipment Rental", preferredDate: "2026-03-22", preferredTimeStart: "14:00", preferredTimeEnd: "23:00", isFlexible: false, priority: "low", status: "declined", source: "online_booking", requiresAssessment: false, internalNotes: "Below minimum project size. Referred to SubRent AV.", attachmentUrls: [], createdAt: "2026-02-22T20:00:00Z" },
    { id: "sr7", companyName: "Tesla", contactName: "Mike Wong", requesterEmail: "m.wong@tesla.com", title: "CES 2027 Booth — Early Planning", description: "Beginning planning for CES 2027. Need initial concepts and budget ranges for a 40x60 booth.", category: "fabrication", serviceType: "Booth Design", preferredDate: "2026-06-01", isFlexible: true, priority: "normal", status: "new", source: "referral", requiresAssessment: false, attachmentUrls: [], createdAt: "2026-02-25T08:00:00Z" },
    { id: "sr8", companyName: "Spotify", contactName: "Dana Lee", requesterEmail: "dana.l@spotify.com", title: "Podcast Studio Branding Refresh", description: "Want to refresh the branding and graphics in the existing podcast studio pop-up. New season, new look.", category: "scenic", serviceType: "Branding Update", preferredDate: "2026-03-20", isFlexible: true, priority: "normal", status: "acknowledged", source: "client_portal", requiresAssessment: false, assignedToName: "Jordan Park", attachmentUrls: ["/docs/spotify-brand-guide-s3.pdf"], createdAt: "2026-02-24T10:00:00Z" },
];
