import type {
    Deal,
    DealStage,
    Project,
    Task,
    CrewMember,
    Asset,
    Vehicle,
    Vendor,
    PurchaseOrder,
    Invoice,
    Approval,
    Notification,
    CaseStudy,
    Stakeholder,
} from "@/types";
import { DEAL_STAGES as DEAL_STAGES_CONFIG } from "@/config/domain-config";

// ─── Pipeline / Deals (derived from SSOT) ───
export const DEAL_STAGES: { id: DealStage; label: string; color: string }[] = 
    DEAL_STAGES_CONFIG.map((stage) => ({
        id: stage.value,
        label: stage.label,
        color: `var(--color-${stage.variant === "default" ? "primary" : stage.variant})`,
    }));

export const MOCK_DEALS: Deal[] = [
    {
        id: "d1", title: "SXSW Brand Activation", company: "Nike", contactName: "Sarah Chen",
        contactEmail: "sarah@nike.com", value: 450000, stage: "negotiation", probability: 75,
        expectedCloseDate: "2026-03-15", assignedTo: "Alex Rivera", createdAt: "2026-01-10T00:00:00Z", updatedAt: "2026-02-20T00:00:00Z",
    },
    {
        id: "d2", title: "Art Basel Installation", company: "Louis Vuitton", contactName: "Pierre Moreau",
        contactEmail: "pierre@lv.com", value: 1200000, stage: "proposal", probability: 50,
        expectedCloseDate: "2026-04-01", assignedTo: "Jordan Park", createdAt: "2026-02-01T00:00:00Z", updatedAt: "2026-02-22T00:00:00Z",
    },
    {
        id: "d3", title: "CES Booth Design", company: "Tesla", contactName: "Mike Wong",
        contactEmail: "mike@tesla.com", value: 800000, stage: "qualified", probability: 40,
        expectedCloseDate: "2026-05-10", assignedTo: "Alex Rivera", createdAt: "2026-02-15T00:00:00Z", updatedAt: "2026-02-23T00:00:00Z",
    },
    {
        id: "d4", title: "Product Launch Event", company: "Apple", contactName: "Lisa Park",
        contactEmail: "lisa@apple.com", value: 2000000, stage: "lead", probability: 20,
        expectedCloseDate: "2026-06-01", assignedTo: "Jordan Park", createdAt: "2026-02-20T00:00:00Z", updatedAt: "2026-02-24T00:00:00Z",
    },
    {
        id: "d5", title: "Festival Main Stage", company: "Coachella", contactName: "Derek Allen",
        contactEmail: "derek@coachella.com", value: 3500000, stage: "won", probability: 100,
        expectedCloseDate: "2026-02-28", assignedTo: "Alex Rivera", createdAt: "2025-11-01T00:00:00Z", updatedAt: "2026-02-10T00:00:00Z",
    },
    {
        id: "d6", title: "Pop-Up Retail Experience", company: "Glossier", contactName: "Emma Liu",
        contactEmail: "emma@glossier.com", value: 175000, stage: "won", probability: 100,
        expectedCloseDate: "2026-01-30", assignedTo: "Jordan Park", createdAt: "2025-12-05T00:00:00Z", updatedAt: "2026-01-28T00:00:00Z",
    },
    {
        id: "d7", title: "Conference Expo Build", company: "Salesforce", contactName: "Tom Brady",
        contactEmail: "tom@salesforce.com", value: 650000, stage: "lost", probability: 0,
        expectedCloseDate: "2026-02-01", assignedTo: "Alex Rivera", notes: "Went with competitor pricing", createdAt: "2025-10-15T00:00:00Z", updatedAt: "2026-01-15T00:00:00Z",
    },
];

// ─── Projects ───
export const MOCK_PROJECTS: Project[] = [
    {
        id: "p1", name: "Coachella Main Stage 2026", client: "Coachella", status: "active",
        currentPhase: "fabrication", startDate: "2026-01-15", endDate: "2026-04-10",
        budgetPlanned: 3500000, budgetActual: 1450000, progress: 42, managerId: "u1", teamIds: ["u1", "u2", "u3"],
        createdAt: "2025-11-01T00:00:00Z",
    },
    {
        id: "p2", name: "Glossier Pop-Up NYC", client: "Glossier", status: "active",
        currentPhase: "load_in", startDate: "2026-02-01", endDate: "2026-03-15",
        budgetPlanned: 175000, budgetActual: 160000, progress: 85, managerId: "u2", teamIds: ["u2", "u4"],
        createdAt: "2025-12-05T00:00:00Z",
    },
    {
        id: "p3", name: "Nike SXSW Activation", client: "Nike", status: "draft",
        currentPhase: "pre_production", startDate: "2026-03-01", endDate: "2026-03-20",
        budgetPlanned: 450000, budgetActual: 0, progress: 5, managerId: "u1", teamIds: ["u1"],
        createdAt: "2026-01-10T00:00:00Z",
    },
];

// ─── Tasks ───
export const MOCK_TASKS: Task[] = [
    {
        id: "t1", projectId: "p1", title: "Main Stage Steel Frame", status: "in_progress",
        priority: "critical", assigneeId: "u3", phase: "fabrication",
        fabricationStatus: "assembly", materialCost: 85000, dependencies: [],
        startDate: "2026-02-01", dueDate: "2026-03-01", createdAt: "2026-01-20T00:00:00Z",
    },
    {
        id: "t2", projectId: "p1", title: "LED Panel Array Installation", status: "todo",
        priority: "high", assigneeId: "u2", phase: "fabrication",
        fabricationStatus: "cutting", materialCost: 120000, dependencies: ["t1"],
        startDate: "2026-03-01", dueDate: "2026-03-20", createdAt: "2026-01-20T00:00:00Z",
    },
    {
        id: "t3", projectId: "p1", title: "Audio System Rigging Plan", status: "done",
        priority: "high", phase: "pre_production",
        dependencies: [], dueDate: "2026-02-15", completedAt: "2026-02-12T00:00:00Z", createdAt: "2026-01-15T00:00:00Z",
    },
    {
        id: "t4", projectId: "p2", title: "Custom Shelving Units", status: "done",
        priority: "medium", phase: "fabrication",
        fabricationStatus: "complete", materialCost: 12000, dependencies: [],
        dueDate: "2026-02-20", completedAt: "2026-02-18T00:00:00Z", createdAt: "2026-02-01T00:00:00Z",
    },
    {
        id: "t5", projectId: "p2", title: "Window Vinyl Graphics", status: "in_progress",
        priority: "medium", phase: "fabrication",
        fabricationStatus: "finishing", materialCost: 4500, dependencies: [],
        dueDate: "2026-02-25", createdAt: "2026-02-05T00:00:00Z",
    },
    {
        id: "t6", projectId: "p1", title: "Freight Logistics — Stage Components", status: "backlog",
        priority: "high", phase: "logistics", dependencies: ["t1", "t2"],
        startDate: "2026-03-20", dueDate: "2026-03-28", createdAt: "2026-01-20T00:00:00Z",
    },
];

// ─── Crew ───
export const MOCK_CREW: CrewMember[] = [
    {
        id: "c1", name: "Marcus Johnson", email: "marcus@crew.com", phone: "(555) 100-2001",
        role: "Lead Fabricator", hourlyRate: 55, status: "assigned",
        certifications: [
            { id: "cert1", type: "osha_30", label: "OSHA 30", issuedDate: "2025-06-01", expiryDate: "2027-06-01", isValid: true },
            { id: "cert2", type: "forklift", label: "Forklift", issuedDate: "2025-08-01", expiryDate: "2026-08-01", isValid: true },
        ],
    },
    {
        id: "c2", name: "Aisha Patel", email: "aisha@crew.com", phone: "(555) 100-2002",
        role: "Rigging Specialist", hourlyRate: 65, status: "available",
        certifications: [
            { id: "cert3", type: "rigging", label: "Rigging", issuedDate: "2024-12-01", expiryDate: "2026-12-01", isValid: true },
            { id: "cert4", type: "osha_10", label: "OSHA 10", issuedDate: "2024-03-01", expiryDate: "2026-03-01", isValid: true },
        ],
    },
    {
        id: "c3", name: "Tommy Rodriguez", email: "tommy@crew.com", phone: "(555) 100-2003",
        role: "Electrician", hourlyRate: 70, status: "available",
        certifications: [
            { id: "cert5", type: "electrical", label: "Electrical", issuedDate: "2025-01-01", expiryDate: "2027-01-01", isValid: true },
            { id: "cert6", type: "osha_30", label: "OSHA 30", issuedDate: "2024-05-01", expiryDate: "2025-05-01", isValid: false },
        ],
    },
    {
        id: "c4", name: "Devon Williams", email: "devon@crew.com", phone: "(555) 100-2004",
        role: "General Labor", hourlyRate: 35, status: "unavailable",
        certifications: [
            { id: "cert7", type: "osha_10", label: "OSHA 10", issuedDate: "2025-09-01", expiryDate: "2027-09-01", isValid: true },
        ],
    },
];

// ─── Assets ───
export const MOCK_ASSETS: Asset[] = [
    { id: "a1", name: "20ft Box Truss", category: "Rigging", barcode: "FP-TR-001", condition: "excellent", location: "Warehouse A", ownedOrRental: "owned", purchasePrice: 4200 },
    { id: "a2", name: "LED Video Wall Panel (4x4)", category: "AV", barcode: "FP-AV-015", condition: "good", location: "In Transit", ownedOrRental: "owned", purchasePrice: 8500 },
    { id: "a3", name: "Generator 50kW", category: "Power", barcode: "FP-PW-003", condition: "good", location: "Warehouse B", ownedOrRental: "rental", rentalReturnDate: "2026-03-05", dailyRentalCost: 350 },
    { id: "a4", name: "Staging Deck 4x8", category: "Staging", barcode: "FP-ST-022", condition: "fair", location: "Warehouse A", ownedOrRental: "owned", purchasePrice: 1200 },
    { id: "a5", name: "Chain Hoist 1-Ton", category: "Rigging", barcode: "FP-TR-005", condition: "needs_repair", location: "Shop", ownedOrRental: "owned", purchasePrice: 3800, notes: "Motor needs service" },
];

// ─── Vehicles ───
export const MOCK_VEHICLES: Vehicle[] = [
    { id: "v1", name: "Sprinter Van #1", type: "Cargo Van", licensePlate: "FP-2201", dockHeight: "24in", driverName: "Carlos Reyes", driverPhone: "(555) 300-1001", gpsEnabled: true, status: "available" },
    { id: "v2", name: "53ft Flatbed", type: "Semi Trailer", licensePlate: "FP-5301", dockHeight: "48in", driverName: "Mike Thompson", driverPhone: "(555) 300-1002", gpsEnabled: true, status: "in_transit" },
    { id: "v3", name: "Box Truck #3", type: "Box Truck", licensePlate: "FP-3303", dockHeight: "36in", driverName: "Sarah Lee", driverPhone: "(555) 300-1003", gpsEnabled: true, status: "loading" },
];

// ─── Vendors ───
export const MOCK_VENDORS: Vendor[] = [
    { id: "vn1", name: "SteelWorks Inc.", contactName: "James Miller", email: "james@steelworks.com", phone: "(555) 400-1001", specialty: "Steel Fabrication", coiExpiryDate: "2026-12-31", coiValid: true, ndaSigned: true, w9Uploaded: true, rating: 4.8, status: "active" },
    { id: "vn2", name: "PrintMax Studio", contactName: "Linda Chang", email: "linda@printmax.com", phone: "(555) 400-1002", specialty: "Large Format Printing", coiExpiryDate: "2026-06-15", coiValid: true, ndaSigned: true, w9Uploaded: true, rating: 4.5, status: "active" },
    { id: "vn3", name: "Bolt Electric", contactName: "Ray Santos", email: "ray@boltelectric.com", phone: "(555) 400-1003", specialty: "Electrical", coiExpiryDate: "2025-12-01", coiValid: false, ndaSigned: false, w9Uploaded: true, rating: 4.2, status: "suspended" },
];

// ─── Purchase Orders ───
export const MOCK_POS: PurchaseOrder[] = [
    {
        id: "po1", projectId: "p1", vendorId: "vn1", vendorName: "SteelWorks Inc.",
        items: [
            { description: "I-Beam 40ft", quantity: 12, unitPrice: 2400, total: 28800 },
            { description: "Steel Plate 4x8", quantity: 24, unitPrice: 350, total: 8400 },
        ],
        totalAmount: 37200, status: "received", issuedDate: "2026-01-25",
    },
    {
        id: "po2", projectId: "p1", vendorId: "vn2", vendorName: "PrintMax Studio",
        items: [
            { description: "Stage Backdrop 60x20ft", quantity: 1, unitPrice: 8500, total: 8500 },
        ],
        totalAmount: 8500, status: "issued", issuedDate: "2026-02-15",
    },
];

// ─── Invoices ───
export const MOCK_INVOICES: Invoice[] = [
    { id: "inv1", vendorId: "vn1", vendorName: "SteelWorks Inc.", purchaseOrderId: "po1", amount: 37200, status: "approved", invoiceDate: "2026-02-10", dueDate: "2026-03-10", variance: 0 },
    { id: "inv2", vendorId: "vn2", vendorName: "PrintMax Studio", purchaseOrderId: "po2", amount: 8925, status: "disputed", invoiceDate: "2026-02-20", dueDate: "2026-03-20", variance: 5 },
];

// ─── Approvals ───
export const MOCK_APPROVALS: Approval[] = [
    { id: "ap1", projectId: "p1", milestoneId: "m1", milestoneName: "Stage Design Concept", status: "approved", requestedAt: "2026-01-20T00:00:00Z", deadline: "2026-01-23T00:00:00Z", approvedAt: "2026-01-22T00:00:00Z", approverName: "Sarah Chen" },
    { id: "ap2", projectId: "p1", milestoneId: "m2", milestoneName: "Fabrication Blueprint", status: "pending", requestedAt: "2026-02-22T00:00:00Z", deadline: "2026-02-25T00:00:00Z", approverName: "Sarah Chen" },
    { id: "ap3", projectId: "p2", milestoneId: "m3", milestoneName: "Interior Layout Final", status: "overdue", requestedAt: "2026-02-18T00:00:00Z", deadline: "2026-02-21T00:00:00Z", approverName: "Emma Liu", timelineImpactDays: 3 },
];

// ─── Notifications ───
export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: "n1", title: "Approval Overdue", message: "Interior Layout Final for Glossier Pop-Up is 3 days overdue", type: "warning", read: false, actionUrl: "/approvals", createdAt: "2026-02-24T10:00:00Z" },
    { id: "n2", title: "COI Expired", message: "Bolt Electric's Certificate of Insurance has expired", type: "error", read: false, actionUrl: "/vendors", createdAt: "2026-02-24T09:00:00Z" },
    { id: "n3", title: "Rental Return Due", message: "Generator 50kW rental return due in 9 days", type: "info", read: true, actionUrl: "/assets", createdAt: "2026-02-24T08:00:00Z" },
    { id: "n4", title: "Deal Won!", message: "Coachella Main Stage deal closed at $3.5M", type: "success", read: true, createdAt: "2026-02-10T00:00:00Z" },
];

// ─── Case Studies (Published) ───
export const MOCK_CASE_STUDIES: CaseStudy[] = [
    {
        id: "cs1", projectId: "p-old-1", title: "Burning Man Art Collective 2025",
        client: "Black Rock Arts Foundation", summary: "A 40ft interactive kinetic sculpture combining steel fabrication with responsive LED arrays, installed in the deep playa.",
        metrics: [{ label: "On-Time", value: "100%" }, { label: "Budget Variance", value: "-2%" }, { label: "Attendee Interactions", value: "45,000+" }],
        photos: [], status: "published", publishedAt: "2025-09-15T00:00:00Z",
    },
];

// ─── Stakeholders ───
export const MOCK_STAKEHOLDERS: Stakeholder[] = [
    { id: "s1", name: "Alex Rivera", email: "alex@playbook.production", type: "internal", role: "Executive Producer", projectIds: ["p1", "p3"] },
    { id: "s2", name: "Jordan Park", email: "jordan@playbook.production", type: "internal", role: "Senior PM", projectIds: ["p2"] },
    { id: "s3", name: "Sarah Chen", email: "sarah@nike.com", type: "client", role: "Brand Director", projectIds: ["p3"] },
    { id: "s4", name: "Derek Allen", email: "derek@coachella.com", type: "client", role: "Festival Director", projectIds: ["p1"] },
    { id: "s5", name: "Marcus Johnson", email: "marcus@crew.com", type: "freelance", role: "Lead Fabricator", projectIds: ["p1"] },
];
