/* ═══════════════════════════════════════════════════════════════
   RILLA MASTERS 2026 — Sales Conference Seed Data
   ═══════════════════════════════════════════════════════════════
   
   Flagship conference for mastering in-person sales
   - The Diplomat Hotel & Beach Resort, Hollywood FL
   - Keynotes from Pat Riley, Coach K, Sebastian Jimenez
   - Jungle Afterparty, breakout sessions, networking
   - Full production management data for event fabrication
   ═══════════════════════════════════════════════════════════════ */

import type {
    Approval,
    Asset,
    CaseStudy,
    CrewMember,
    Deal,
    Project,
    PurchaseOrder,
    Stakeholder,
    Task,
    Vendor,
} from "@/types";

// ─── Conference Configuration ───
export const RILLA_MASTERS_2026 = {
    id: "rm2026",
    name: "Rilla Masters 2026",
    shortName: "RM26",
    tagline: "The Flagship Conference for Mastering In-Person Sales",
    dates: {
        registration: "2026-03-11",
        welcomeReception: "2026-03-11",
        conferenceDay1: "2026-03-12",
        conferenceDay2: "2026-03-13",
        jungleAfterparty: "2026-03-12",
    },
    venue: {
        primary: {
            name: "The Diplomat Beach Resort",
            address: "3555 S Ocean Dr, Hollywood, FL 33019",
            events: ["Main Conference", "Morning Workouts", "Jungle After Party"],
        },
        welcomeReception: {
            name: "Miami International Autodrome",
            address: "Miami Gardens, FL",
            events: ["Welcome Reception"],
        },
        partnerHotels: ["Aloft Miami Aventura", "DoubleTree Resort by Hilton Hollywood Beach"],
    },
    ticketPrice: {
        coachesTrack: 1500,
        allStarTrack: 3500,
    },
    tracks: ["sales-leadership", "coaching", "ai-technology", "performance", "culture"],
    keynoteSpeakers: [
        { name: "Sebastian Jimenez", title: "CEO", company: "Rilla" },
        { name: "Pat Riley", title: "President", company: "Miami Heat" },
        { name: "Coach K", title: "Fmr. Head Coach", company: "Duke University Basketball" },
        { name: "Dr. Tommy Wood", title: "Performance Expert", company: "Hintsa" },
        { name: "Allan Langer", title: "Best-Selling Author", company: "" },
    ],
    schedule: {
        march11: ["Registration", "Welcome Reception at Miami Autodrome"],
        march12: [
            "Morning Workout",
            "Breakfast",
            "Keynotes",
            "Breakout Sessions",
            "Jungle After Party",
        ],
        march13: ["Morning Workout", "Breakfast", "Keynotes", "Breakout Sessions", "Closing"],
    },
} as const;

// ─── Deals / Pipeline ───
export const RILLA_DEALS: Deal[] = [
    {
        id: "rm-d1",
        title: "Rilla Masters 2026 - Main Conference Production",
        company: "Rilla",
        contactName: "Sebastian Jimenez",
        contactEmail: "sebastian@rilla.com",
        value: 750000,
        stage: "won",
        probability: 100,
        expectedCloseDate: "2025-11-15",
        assignedTo: "Alex Rivera",
        notes: "Full production package: main stage, breakout rooms, AV, Jungle Afterparty theming at The Diplomat Beach Resort",
        createdAt: "2025-09-01T00:00:00Z",
        updatedAt: "2025-11-15T00:00:00Z",
    },
    {
        id: "rm-d2",
        title: "Rilla Masters 2026 - Welcome Reception (Miami Autodrome)",
        company: "Rilla",
        contactName: "Paulina Parsons",
        contactEmail: "paulina@rilla.com",
        value: 125000,
        stage: "won",
        probability: 100,
        expectedCloseDate: "2025-12-01",
        assignedTo: "Jordan Park",
        notes: "F1 track venue activation with live music, immersive entertainment, premium catering",
        createdAt: "2025-10-01T00:00:00Z",
        updatedAt: "2025-12-01T00:00:00Z",
    },
    {
        id: "rm-d3",
        title: "Rilla Masters 2026 - Jungle Afterparty",
        company: "Rilla",
        contactName: "Paulina Parsons",
        contactEmail: "paulina@rilla.com",
        value: 185000,
        stage: "won",
        probability: 100,
        expectedCloseDate: "2025-12-10",
        assignedTo: "Jordan Park",
        notes: "Poolside jungle-themed activations at The Diplomat, premium F&B, entertainment",
        createdAt: "2025-10-15T00:00:00Z",
        updatedAt: "2025-12-10T00:00:00Z",
    },
    {
        id: "rm-d4",
        title: "Rilla Regional Roadshow 2026",
        company: "Rilla",
        contactName: "Sebastian Jimenez",
        contactEmail: "sebastian@rilla.com",
        value: 350000,
        stage: "proposal",
        probability: 55,
        expectedCloseDate: "2026-05-15",
        assignedTo: "Alex Rivera",
        notes: "5-city roadshow for regional sales training events post-Masters",
        createdAt: "2026-02-01T00:00:00Z",
        updatedAt: "2026-02-24T00:00:00Z",
    },
];

// ─── Projects ───
export const RILLA_PROJECTS: Project[] = [
    {
        id: "rm-p1",
        name: "Rilla Masters 2026 - Main Conference",
        client: "Rilla",
        clientLogo: "/brands/rilla/logo-icon.svg",
        status: "active",
        currentPhase: "fabrication",
        startDate: "2025-11-15",
        endDate: "2026-03-13",
        budgetPlanned: 750000,
        budgetActual: 485000,
        progress: 75,
        managerId: "u1",
        teamIds: ["u1", "u2", "u3", "u4"],
        createdAt: "2025-11-15T00:00:00Z",
    },
    {
        id: "rm-p2",
        name: "Rilla Masters 2026 - Welcome Reception (Miami Autodrome)",
        client: "Rilla",
        clientLogo: "/brands/rilla/logo-icon.svg",
        status: "active",
        currentPhase: "fabrication",
        startDate: "2025-12-01",
        endDate: "2026-03-11",
        budgetPlanned: 125000,
        budgetActual: 78000,
        progress: 65,
        managerId: "u2",
        teamIds: ["u2", "u4"],
        createdAt: "2025-12-01T00:00:00Z",
    },
    {
        id: "rm-p3",
        name: "Rilla Masters 2026 - Jungle Afterparty",
        client: "Rilla",
        clientLogo: "/brands/rilla/logo-icon.svg",
        status: "active",
        currentPhase: "fabrication",
        startDate: "2025-12-10",
        endDate: "2026-03-12",
        budgetPlanned: 185000,
        budgetActual: 112000,
        progress: 70,
        managerId: "u2",
        teamIds: ["u2", "u3"],
        createdAt: "2025-12-10T00:00:00Z",
    },
];

// ─── Tasks ───
export const RILLA_TASKS: Task[] = [
    // Main Conference Tasks
    {
        id: "rm-t1",
        projectId: "rm-p1",
        title: "Main Stage Design - Keynote Platform",
        description:
            "Design premium keynote stage with LED backdrop for Pat Riley, Coach K, and Sebastian Jimenez presentations",
        status: "done",
        priority: "critical",
        assigneeId: "u1",
        phase: "fabrication",
        fabricationStatus: "complete",
        materialCost: 85000,
        dependencies: [],
        startDate: "2025-11-20",
        dueDate: "2025-12-15",
        createdAt: "2025-11-15T00:00:00Z",
    },
    {
        id: "rm-t2",
        projectId: "rm-p1",
        title: "LED Wall Array - Main Ballroom",
        description:
            "High-resolution LED wall installation for keynote presentations and sponsor content",
        status: "done",
        priority: "high",
        assigneeId: "u3",
        phase: "fabrication",
        fabricationStatus: "complete",
        materialCost: 145000,
        dependencies: ["rm-t1"],
        startDate: "2025-12-15",
        dueDate: "2026-01-30",
        createdAt: "2025-11-15T00:00:00Z",
    },
    {
        id: "rm-t3",
        projectId: "rm-p1",
        title: "Breakout Room AV Packages (8 Rooms)",
        description:
            "Complete AV setup for 8 breakout session rooms with screens, audio, and streaming capability",
        status: "in_progress",
        priority: "high",
        assigneeId: "u3",
        phase: "fabrication",
        fabricationStatus: "assembly",
        materialCost: 72000,
        dependencies: [],
        startDate: "2026-01-15",
        dueDate: "2026-02-28",
        createdAt: "2025-11-15T00:00:00Z",
    },
    {
        id: "rm-t4",
        projectId: "rm-p1",
        title: "Conference Signage & Wayfinding",
        description:
            "Branded signage, directional wayfinding, and session room identification throughout The Diplomat",
        status: "in_progress",
        priority: "medium",
        assigneeId: "u4",
        phase: "fabrication",
        fabricationStatus: "finishing",
        materialCost: 28000,
        dependencies: [],
        startDate: "2026-01-20",
        dueDate: "2026-03-01",
        createdAt: "2025-12-01T00:00:00Z",
    },
    {
        id: "rm-t5",
        projectId: "rm-p1",
        title: "Audio System - Main Ballroom",
        description:
            "Professional audio system for main ballroom with wireless mics for keynote speakers",
        status: "done",
        priority: "high",
        assigneeId: "u3",
        phase: "fabrication",
        fabricationStatus: "complete",
        materialCost: 55000,
        dependencies: ["rm-t1"],
        startDate: "2026-01-10",
        dueDate: "2026-02-15",
        createdAt: "2025-11-15T00:00:00Z",
    },
    {
        id: "rm-t6",
        projectId: "rm-p1",
        title: "Freight Logistics - Hollywood FL",
        description: "Coordinate shipping of all fabricated elements to The Diplomat Beach Resort",
        status: "in_progress",
        priority: "critical",
        phase: "logistics",
        dependencies: ["rm-t2", "rm-t3", "rm-t4", "rm-t5"],
        startDate: "2026-02-25",
        dueDate: "2026-03-08",
        createdAt: "2025-11-15T00:00:00Z",
    },
    // Welcome Reception Tasks (Miami Autodrome)
    {
        id: "rm-t7",
        projectId: "rm-p2",
        title: "F1 Track Activation Design",
        description:
            "Design immersive activation experience on the Miami International Autodrome F1 track",
        status: "done",
        priority: "critical",
        assigneeId: "u2",
        phase: "fabrication",
        fabricationStatus: "complete",
        materialCost: 35000,
        dependencies: [],
        startDate: "2025-12-15",
        dueDate: "2026-01-30",
        createdAt: "2025-12-01T00:00:00Z",
    },
    {
        id: "rm-t8",
        projectId: "rm-p2",
        title: "Entertainment Stage & Lighting",
        description: "Live music stage and immersive lighting for trackside welcome reception",
        status: "in_progress",
        priority: "high",
        assigneeId: "u4",
        phase: "fabrication",
        fabricationStatus: "assembly",
        materialCost: 42000,
        dependencies: ["rm-t7"],
        startDate: "2026-02-01",
        dueDate: "2026-03-05",
        createdAt: "2025-12-01T00:00:00Z",
    },
    // Jungle Afterparty Tasks
    {
        id: "rm-t9",
        projectId: "rm-p3",
        title: "Poolside Jungle Theming - Scenic Elements",
        description:
            "Immersive jungle-themed scenic elements for poolside party: faux foliage, vines, tropical lighting",
        status: "in_progress",
        priority: "critical",
        assigneeId: "u2",
        phase: "fabrication",
        fabricationStatus: "finishing",
        materialCost: 45000,
        dependencies: [],
        startDate: "2026-01-15",
        dueDate: "2026-03-01",
        createdAt: "2025-12-10T00:00:00Z",
    },
    {
        id: "rm-t10",
        projectId: "rm-p3",
        title: "DJ Booth & Entertainment Stage",
        description: "Custom DJ booth with jungle aesthetic for poolside entertainment",
        status: "in_progress",
        priority: "high",
        assigneeId: "u4",
        phase: "fabrication",
        fabricationStatus: "assembly",
        materialCost: 32000,
        dependencies: ["rm-t9"],
        startDate: "2026-02-01",
        dueDate: "2026-03-05",
        createdAt: "2025-12-10T00:00:00Z",
    },
    {
        id: "rm-t11",
        projectId: "rm-p3",
        title: "Neon Signage - Rilla Branding",
        description:
            "Custom neon Rilla logo and jungle-themed neon accents for photo opportunities",
        status: "done",
        priority: "medium",
        assigneeId: "u4",
        phase: "fabrication",
        fabricationStatus: "complete",
        materialCost: 18000,
        dependencies: [],
        startDate: "2026-01-10",
        dueDate: "2026-02-15",
        createdAt: "2025-12-10T00:00:00Z",
    },
];

// ─── Crew ───
export const RILLA_CREW: CrewMember[] = [
    {
        id: "rm-c1",
        name: "Tyler Okonkwo",
        email: "tyler@crew.com",
        phone: "(555) 200-3001",
        role: "VR Systems Specialist",
        hourlyRate: 85,
        status: "assigned",
        certifications: [
            {
                id: "cert-rm1",
                type: "electrical",
                label: "Electrical",
                issuedDate: "2025-03-01",
                expiryDate: "2027-03-01",
                isValid: true,
            },
            {
                id: "cert-rm2",
                type: "osha_10",
                label: "OSHA 10",
                issuedDate: "2025-06-01",
                expiryDate: "2027-06-01",
                isValid: true,
            },
        ],
    },
    {
        id: "rm-c2",
        name: "Kenji Nakamura",
        email: "kenji@crew.com",
        phone: "(555) 200-3002",
        role: "LED Technician",
        hourlyRate: 70,
        status: "assigned",
        certifications: [
            {
                id: "cert-rm3",
                type: "rigging",
                label: "Rigging",
                issuedDate: "2024-11-01",
                expiryDate: "2026-11-01",
                isValid: true,
            },
            {
                id: "cert-rm4",
                type: "osha_30",
                label: "OSHA 30",
                issuedDate: "2025-01-01",
                expiryDate: "2027-01-01",
                isValid: true,
            },
        ],
    },
    {
        id: "rm-c3",
        name: "Priya Sharma",
        email: "priya@crew.com",
        phone: "(555) 200-3003",
        role: "Broadcast Engineer",
        hourlyRate: 90,
        status: "available",
        certifications: [
            {
                id: "cert-rm5",
                type: "electrical",
                label: "Electrical",
                issuedDate: "2025-02-01",
                expiryDate: "2027-02-01",
                isValid: true,
            },
        ],
    },
    {
        id: "rm-c4",
        name: "Diego Fernandez",
        email: "diego@crew.com",
        phone: "(555) 200-3004",
        role: "Stage Carpenter",
        hourlyRate: 55,
        status: "available",
        certifications: [
            {
                id: "cert-rm6",
                type: "osha_30",
                label: "OSHA 30",
                issuedDate: "2025-04-01",
                expiryDate: "2027-04-01",
                isValid: true,
            },
            {
                id: "cert-rm7",
                type: "forklift",
                label: "Forklift",
                issuedDate: "2025-05-01",
                expiryDate: "2026-05-01",
                isValid: true,
            },
        ],
    },
];

// ─── Assets ───
export const RILLA_ASSETS: Asset[] = [
    {
        id: "rm-a1",
        name: "Meta Quest Pro (Tournament)",
        category: "VR",
        barcode: "RL-VR-001",
        condition: "excellent",
        location: "Warehouse A",
        ownedOrRental: "owned",
        purchasePrice: 1500,
    },
    {
        id: "rm-a2",
        name: "Meta Quest Pro (Tournament)",
        category: "VR",
        barcode: "RL-VR-002",
        condition: "excellent",
        location: "Warehouse A",
        ownedOrRental: "owned",
        purchasePrice: 1500,
    },
    {
        id: "rm-a3",
        name: "LED Panel 2.5mm (Indoor)",
        category: "AV",
        barcode: "RL-LED-001",
        condition: "excellent",
        location: "Warehouse A",
        ownedOrRental: "owned",
        purchasePrice: 4200,
    },
    {
        id: "rm-a4",
        name: "Streaming PC - Observer Rig",
        category: "IT",
        barcode: "RL-PC-001",
        condition: "excellent",
        location: "Warehouse A",
        ownedOrRental: "owned",
        purchasePrice: 8500,
    },
    {
        id: "rm-a5",
        name: "PTZ Camera - Broadcast",
        category: "AV",
        barcode: "RL-CAM-001",
        condition: "good",
        location: "Warehouse A",
        ownedOrRental: "owned",
        purchasePrice: 6800,
    },
    {
        id: "rm-a6",
        name: "Wireless Headset System",
        category: "Audio",
        barcode: "RL-AUD-001",
        condition: "excellent",
        location: "Warehouse A",
        ownedOrRental: "owned",
        purchasePrice: 2400,
    },
];

// ─── Vendors ───
export const RILLA_VENDORS: Vendor[] = [
    {
        id: "rm-vn1",
        name: "VR Stage Systems",
        contactName: "Alex Kim",
        email: "alex@vrstagesystems.com",
        phone: "(555) 500-4001",
        specialty: "VR Hardware Integration",
        coiExpiryDate: "2027-01-15",
        coiValid: true,
        ndaSigned: true,
        w9Uploaded: true,
        rating: 4.9,
        status: "active",
    },
    {
        id: "rm-vn2",
        name: "Neon Dreams Studio",
        contactName: "Luna Martinez",
        email: "luna@neondreams.co",
        phone: "(555) 500-4002",
        specialty: "Custom Neon & LED Signage",
        coiExpiryDate: "2026-08-30",
        coiValid: true,
        ndaSigned: true,
        w9Uploaded: true,
        rating: 4.7,
        status: "active",
    },
    {
        id: "rm-vn3",
        name: "Esports Broadcast Co",
        contactName: "Ryan Torres",
        email: "ryan@esportsbroadcast.tv",
        phone: "(555) 500-4003",
        specialty: "Live Streaming & Production",
        coiExpiryDate: "2026-12-01",
        coiValid: true,
        ndaSigned: true,
        w9Uploaded: true,
        rating: 4.8,
        status: "active",
    },
];

// ─── Purchase Orders ───
export const RILLA_POS: PurchaseOrder[] = [
    {
        id: "rm-po1",
        projectId: "rm-p1",
        vendorId: "rm-vn1",
        vendorName: "VR Stage Systems",
        items: [
            {
                description: "Custom VR Pod Frame - Steel",
                quantity: 16,
                unitPrice: 2800,
                total: 44800,
            },
            {
                description: "VR Cable Management System",
                quantity: 16,
                unitPrice: 450,
                total: 7200,
            },
            { description: "Tracking Sensor Array", quantity: 16, unitPrice: 1200, total: 19200 },
        ],
        totalAmount: 71200,
        status: "issued",
        issuedDate: "2026-03-25",
    },
    {
        id: "rm-po2",
        projectId: "rm-p1",
        vendorId: "rm-vn2",
        vendorName: "Neon Dreams Studio",
        items: [
            { description: "Rilla Logo Neon - 8ft", quantity: 2, unitPrice: 4500, total: 9000 },
            {
                description: "Stage Edge LED Strip - 100ft",
                quantity: 4,
                unitPrice: 1800,
                total: 7200,
            },
            { description: "Custom Jungle Vine Neon", quantity: 12, unitPrice: 850, total: 10200 },
        ],
        totalAmount: 26400,
        status: "issued",
        issuedDate: "2026-04-10",
    },
];

// ─── Approvals ───
export const RILLA_APPROVALS: Approval[] = [
    {
        id: "rm-ap1",
        projectId: "rm-p1",
        milestoneId: "rm-m1",
        milestoneName: "Stage Concept Design",
        status: "approved",
        requestedAt: "2026-03-20T00:00:00Z",
        deadline: "2026-03-25T00:00:00Z",
        approvedAt: "2026-03-24T00:00:00Z",
        approverName: "Marcus Chen",
    },
    {
        id: "rm-ap2",
        projectId: "rm-p1",
        milestoneId: "rm-m2",
        milestoneName: "VR Pod Prototype",
        status: "pending",
        requestedAt: "2026-04-15T00:00:00Z",
        deadline: "2026-04-22T00:00:00Z",
        approverName: "Marcus Chen",
    },
    {
        id: "rm-ap3",
        projectId: "rm-p1",
        milestoneId: "rm-m3",
        milestoneName: "Broadcast Layout Plan",
        status: "pending",
        requestedAt: "2026-04-18T00:00:00Z",
        deadline: "2026-04-25T00:00:00Z",
        approverName: "Sophie Weber",
    },
];

// ─── Stakeholders (Rilla team from official website) ───
export const RILLA_STAKEHOLDERS: Stakeholder[] = [
    {
        id: "rm-s1",
        name: "Sebastian Jimenez",
        email: "hello@rilla.com",
        phone: "(914) 873-5454",
        type: "client",
        role: "CEO",
        projectIds: ["rm-p1", "rm-p2", "rm-p3"],
    },
    {
        id: "rm-s2",
        name: "Paulina Parsons",
        email: "hello@rilla.com",
        type: "client",
        role: "Enterprise Lead",
        projectIds: ["rm-p1", "rm-p2", "rm-p3"],
    },
    {
        id: "rm-s3",
        name: "Tobias Hanl",
        email: "hello@rilla.com",
        type: "client",
        role: "Product Lead",
        projectIds: ["rm-p1"],
    },
    {
        id: "rm-s4",
        name: "Alex Rivera",
        email: "alex@playbook.production",
        type: "internal",
        role: "Executive Producer",
        projectIds: ["rm-p1"],
    },
    {
        id: "rm-s5",
        name: "Jordan Park",
        email: "jordan@playbook.production",
        type: "internal",
        role: "Event PM",
        projectIds: ["rm-p2", "rm-p3"],
    },
];

// ─── Case Study (Template for post-event) ───
export const RILLA_CASE_STUDY_TEMPLATE: CaseStudy = {
    id: "rm-cs1",
    projectId: "rm-p1",
    title: "Rilla Masters 2026",
    client: "Rilla",
    summary:
        "The flagship conference for mastering in-person sales at The Diplomat Beach Resort, Hollywood FL. March 11-13, 2026. Featuring keynotes from Pat Riley (Miami Heat), Coach K (Duke Basketball), and Sebastian Jimenez (Rilla CEO). Welcome Reception at Miami International Autodrome F1 track. Poolside Jungle Afterparty.",
    heroImage: "/brands/rilla/case-studies/rm2026-hero.jpg",
    metrics: [
        { label: "Conference Days", value: "3" },
        { label: "Keynote Speakers", value: "5" },
        { label: "Breakout Sessions", value: "17+" },
        { label: "Venues", value: "2" },
    ],
    photos: [],
    status: "draft",
};

// ─── Conference Session Types ───
export interface ConferenceSession {
    id: string;
    conferenceId: string;
    title: string;
    description: string;
    track: "sales-leadership" | "coaching" | "ai-technology" | "performance" | "culture";
    type: "keynote" | "breakout" | "panel" | "workshop" | "networking";
    speakerName: string;
    speakerTitle: string;
    speakerCompany: string;
    startTime: string;
    endTime: string;
    room: string;
    capacity: number;
}

export interface ConferenceAttendee {
    id: string;
    name: string;
    email: string;
    company: string;
    title: string;
    ticketType: "standard" | "vip";
    industry: string;
    registeredAt: string;
}

export interface ConferenceSponsor {
    id: string;
    name: string;
    tier: "platinum" | "gold" | "silver" | "bronze";
    logoUrl: string;
    boothNumber?: string;
    contactName: string;
    contactEmail: string;
}

// ─── Official Conference Sessions (from rilla.com/masters) ───
export const RILLA_SESSIONS: ConferenceSession[] = [
    // Day 1 - Thursday March 12
    {
        id: "sess-1",
        conferenceId: "rm2026",
        title: "Welcome Keynote",
        description:
            "Sebastian Jimenez kicks off with a State of the Union on the teams winning with Rilla. Breaks down the features and coaching breakthroughs driving the biggest gains. Lays out the shifts and opportunities defining the next era of coaching and sales.",
        track: "sales-leadership",
        type: "keynote",
        speakerName: "Sebastian Jimenez",
        speakerTitle: "CEO",
        speakerCompany: "Rilla",
        startTime: "2026-03-12T09:00:00-05:00",
        endTime: "2026-03-12T10:00:00-05:00",
        room: "Main Ballroom",
        capacity: 1500,
    },
    {
        id: "sess-2",
        conferenceId: "rm2026",
        title: "High-Performance Keynote",
        description:
            "Learn the same performance protocols used by pro athletes and Fortune 50 executives. Unlock a longevity blueprint that boosts energy, recovery, and cognitive sharpness.",
        track: "performance",
        type: "keynote",
        speakerName: "Dr. Tommy Wood",
        speakerTitle: "Performance Expert",
        speakerCompany: "Hintsa",
        startTime: "2026-03-12T10:15:00-05:00",
        endTime: "2026-03-12T11:00:00-05:00",
        room: "Main Ballroom",
        capacity: 1500,
    },
    {
        id: "sess-3",
        conferenceId: "rm2026",
        title: "Inside The Top Performers: What The Best Brands Do Differently",
        description:
            "Boris Valkov is joined by Jason Beckly (HomeFirst), George Donaldson (FixItGroup), Brian Remington (FixItGroup), and Mario Martinez (ServiceMinds) to share how top brands prioritize AI investments.",
        track: "ai-technology",
        type: "panel",
        speakerName: "Boris Valkov",
        speakerTitle: "Founder",
        speakerCompany: "Lace AI",
        startTime: "2026-03-12T11:15:00-05:00",
        endTime: "2026-03-12T12:00:00-05:00",
        room: "Breakout A",
        capacity: 200,
    },
    {
        id: "sess-4",
        conferenceId: "rm2026",
        title: "Sales Leadership at the Intersection of People and Technology",
        description:
            "See how elite sales leaders diagnose slumps and reset momentum in real time. Watch how AI is used inside weekly coaching to drive consistent improvement.",
        track: "sales-leadership",
        type: "breakout",
        speakerName: "Jon Gilge",
        speakerTitle: "Sales Leader",
        speakerCompany: "Leafguard",
        startTime: "2026-03-12T11:15:00-05:00",
        endTime: "2026-03-12T12:00:00-05:00",
        room: "Breakout B",
        capacity: 200,
    },
    {
        id: "sess-5",
        conferenceId: "rm2026",
        title: "The Art of Coaching",
        description:
            "Learn how to give feedback that actually improves performance. Top operators break down the techniques and habits behind feedback that lands, motivates, and drives better results.",
        track: "coaching",
        type: "breakout",
        speakerName: "Pete Marchmont",
        speakerTitle: "Sales Leader",
        speakerCompany: "Leafguard",
        startTime: "2026-03-12T13:30:00-05:00",
        endTime: "2026-03-12T14:15:00-05:00",
        room: "Breakout A",
        capacity: 200,
    },
    {
        id: "sess-6",
        conferenceId: "rm2026",
        title: "The Silent Signals That Decide Every Sale",
        description:
            "Allan Langer — 5× National Coach of the Year — shares how he studied FBI interrogation and body-language frameworks to read buyers body language clues.",
        track: "coaching",
        type: "breakout",
        speakerName: "Allan Langer",
        speakerTitle: "Best-Selling Author",
        speakerCompany: "",
        startTime: "2026-03-12T13:30:00-05:00",
        endTime: "2026-03-12T14:15:00-05:00",
        room: "Breakout B",
        capacity: 200,
    },
    {
        id: "sess-7",
        conferenceId: "rm2026",
        title: "Pat Riley Keynote",
        description:
            "The architect behind five NBA championships breaks down the leadership principles that built the Lakers dynasty and the Heat culture. He'll unpack the systems, discipline, and standards that turned good players into legends.",
        track: "performance",
        type: "keynote",
        speakerName: "Pat Riley",
        speakerTitle: "President",
        speakerCompany: "Miami Heat",
        startTime: "2026-03-12T14:30:00-05:00",
        endTime: "2026-03-12T15:30:00-05:00",
        room: "Main Ballroom",
        capacity: 1500,
    },
    {
        id: "sess-8",
        conferenceId: "rm2026",
        title: "Rilla Live: How to Save Millions of Dollars with Real Time Coaching",
        description:
            "How teams use Rilla Live to intervene mid-conversation and save deals in real time. The adoption frameworks behind 230% revenue growth and $100K+ weekly lift.",
        track: "ai-technology",
        type: "breakout",
        speakerName: "John Wensel",
        speakerTitle: "Owner",
        speakerCompany: "Windows USA",
        startTime: "2026-03-12T16:00:00-05:00",
        endTime: "2026-03-12T16:45:00-05:00",
        room: "Breakout A",
        capacity: 200,
    },
    {
        id: "sess-9",
        conferenceId: "rm2026",
        title: "Rilla for the Enterprise",
        description:
            "Learn how leading enterprises deployed Rilla across hundreds of reps and made virtual coaching a core system. See the strategies that created fast adoption and strong cultural buy-in.",
        track: "ai-technology",
        type: "breakout",
        speakerName: "Paulina Parsons",
        speakerTitle: "Enterprise Lead",
        speakerCompany: "Rilla",
        startTime: "2026-03-12T16:00:00-05:00",
        endTime: "2026-03-12T16:45:00-05:00",
        room: "Breakout B",
        capacity: 200,
    },
    // Day 2 - Friday March 13
    {
        id: "sess-10",
        conferenceId: "rm2026",
        title: "The Future of Rilla Keynote",
        description:
            "Sebastian Jimenez unveils the future roadmap for Rilla and the next era of AI-powered sales coaching.",
        track: "ai-technology",
        type: "keynote",
        speakerName: "Sebastian Jimenez",
        speakerTitle: "CEO",
        speakerCompany: "Rilla",
        startTime: "2026-03-13T09:00:00-05:00",
        endTime: "2026-03-13T10:00:00-05:00",
        room: "Main Ballroom",
        capacity: 1500,
    },
    {
        id: "sess-11",
        conferenceId: "rm2026",
        title: "AI That Makes You More Human: Unlocking EQ in High-Performing Teams",
        description:
            "Discover how AI reveals emotional signals that top performers use to build stronger, more authentic connections. Coach emotional intelligence at scale.",
        track: "coaching",
        type: "breakout",
        speakerName: "Demitria Comforti",
        speakerTitle: "Director of Training",
        speakerCompany: "Esler Companies",
        startTime: "2026-03-13T10:15:00-05:00",
        endTime: "2026-03-13T11:00:00-05:00",
        room: "Breakout A",
        capacity: 200,
    },
    {
        id: "sess-12",
        conferenceId: "rm2026",
        title: "The Culture Operating System",
        description:
            "Learn to create high standards without burnout and establish rituals and traditions that reinforce a unified, high-performance team.",
        track: "culture",
        type: "breakout",
        speakerName: "Barnaby Hitzig",
        speakerTitle: "Co-Founder",
        speakerCompany: "AirWorks Solutions",
        startTime: "2026-03-13T10:15:00-05:00",
        endTime: "2026-03-13T11:00:00-05:00",
        room: "Breakout B",
        capacity: 200,
    },
    {
        id: "sess-13",
        conferenceId: "rm2026",
        title: "The Hard Truth About Today's PE Market",
        description:
            "Hear the unfiltered reality of today's PE landscape from Rob Parker, one of the top dealmakers in the space. Learn why many 'strong' companies are getting passed over.",
        track: "sales-leadership",
        type: "breakout",
        speakerName: "Rob Parker",
        speakerTitle: "Managing Director",
        speakerCompany: "Piper Sandler",
        startTime: "2026-03-13T11:15:00-05:00",
        endTime: "2026-03-13T12:00:00-05:00",
        room: "Breakout A",
        capacity: 200,
    },
    {
        id: "sess-14",
        conferenceId: "rm2026",
        title: "Always Say Yes: How Customer Obsession Leads to Profits",
        description:
            "Learn how Joe Adams scaled his auto shop into a $100M nationwide organization by building a culture of customer obsession.",
        track: "culture",
        type: "breakout",
        speakerName: "Joe Adams",
        speakerTitle: "Founder",
        speakerCompany: "Adams Automotive",
        startTime: "2026-03-13T11:15:00-05:00",
        endTime: "2026-03-13T12:00:00-05:00",
        room: "Breakout B",
        capacity: 200,
    },
    {
        id: "sess-15",
        conferenceId: "rm2026",
        title: "Mastering Rilla Intelligence",
        description:
            "See how top organizations use Rilla Intelligence to pull insights from every sales conversation. Learn the core workflows and data patterns driving better coaching.",
        track: "ai-technology",
        type: "breakout",
        speakerName: "Tobias Hanl",
        speakerTitle: "Product Lead",
        speakerCompany: "Rilla",
        startTime: "2026-03-13T13:30:00-05:00",
        endTime: "2026-03-13T14:15:00-05:00",
        room: "Breakout A",
        capacity: 200,
    },
    {
        id: "sess-16",
        conferenceId: "rm2026",
        title: "Coach K Keynote",
        description:
            "Hear rare insights from one of the most decorated coaches in sports on leading under pressure and sustaining excellence. Learn the principles that build trust, discipline, and high performance inside championship teams.",
        track: "coaching",
        type: "keynote",
        speakerName: "Coach K",
        speakerTitle: "Fmr. Head Coach",
        speakerCompany: "Duke University Basketball",
        startTime: "2026-03-13T14:30:00-05:00",
        endTime: "2026-03-13T15:30:00-05:00",
        room: "Main Ballroom",
        capacity: 1500,
    },
    {
        id: "sess-17",
        conferenceId: "rm2026",
        title: "Closing Comments",
        description:
            "Sebastian Jimenez wraps up Rilla Masters 2026 with key takeaways and a call to action.",
        track: "sales-leadership",
        type: "keynote",
        speakerName: "Sebastian Jimenez",
        speakerTitle: "CEO",
        speakerCompany: "Rilla",
        startTime: "2026-03-13T15:45:00-05:00",
        endTime: "2026-03-13T16:15:00-05:00",
        room: "Main Ballroom",
        capacity: 1500,
    },
];

// ─── Sample Sponsors ───
export const RILLA_SPONSORS: ConferenceSponsor[] = [
    {
        id: "sponsor-1",
        name: "Neighborly",
        tier: "platinum",
        logoUrl: "/brands/rilla/sponsors/neighborly.png",
        boothNumber: "P1",
        contactName: "Mike Johnson",
        contactEmail: "mike@neighborly.com",
    },
    {
        id: "sponsor-2",
        name: "Pella Windows",
        tier: "gold",
        logoUrl: "/brands/rilla/sponsors/pella.png",
        boothNumber: "G1",
        contactName: "Eric Smithey",
        contactEmail: "eric@pella.com",
    },
    {
        id: "sponsor-3",
        name: "Windows USA",
        tier: "gold",
        logoUrl: "/brands/rilla/sponsors/windowsusa.png",
        boothNumber: "G2",
        contactName: "John Wensel",
        contactEmail: "john@windowsusa.com",
    },
];
