/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIGS — Vendor Domain
   
   Declarative ListPageConfig objects for the vendor domain.
   Consumed by ListPageShell — no imperative page code needed.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";
import { CREATE_OBLIGATION_CONFIG } from "@/config/create-entity-configs";
import {
    CREATE_COMPLIANCE_REQUIREMENT_CONFIG,
    CREATE_COMPLIANCE_TEMPLATE_CONFIG,
    CREATE_CONTRACT_AMENDMENT_CONFIG,
    CREATE_E_SIGNATURE_CONFIG,
    CREATE_ENGAGEMENT_TERM_CONFIG,
    CREATE_INSURANCE_REQUIREMENT_CONFIG,
    CREATE_LEGAL_HOLD_CONFIG,
    CREATE_RFQ_CONFIG,
    CREATE_RIGHTS_CONFIG,
    CREATE_RISK_ASSESSMENT_CONFIG,
    CREATE_VENDOR_COMMUNICATION_CONFIG,
    CREATE_VENDOR_COMPLIANCE_DOCUMENT_CONFIG,
} from "@/config/phase-h-create-entity-configs";
import {
    AlertTriangle,
    ClipboardCheck,
    FileCheck,
    FileSignature,
    FileText,
    KeyRound,
    Mail,
    PenTool,
    Scale,
    Shield,
} from "lucide-react";

// ─── compliance_requirement ───

export const COMPLIANCE_REQUIREMENTS_PAGE: ListPageConfig = {
    entityKey: "compliance_requirement",
    description: "Regulatory and contractual compliance requirements to track and satisfy",
    icon: Shield,
    createConfig: CREATE_COMPLIANCE_REQUIREMENT_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Requirement", accessorKey: "name" },
        {
            id: "requirement_type",
            header: "Type",
            accessorKey: "requirement_type",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board", "calendar"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "name",
        cardSubtitleKey: "requirement_type",
    },
    calendarConfig: {
        titleKey: "name",
        dateKey: "due_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Requirement", accessorKey: "name" },
            {
                id: "requirement_type",
                label: "Type",
                accessorKey: "requirement_type",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── contract_amendment ───

export const CONTRACT_AMENDMENTS_PAGE: ListPageConfig = {
    entityKey: "contract_amendment",
    description: "Track changes and amendments to existing contracts",
    icon: FileSignature,
    createConfig: CREATE_CONTRACT_AMENDMENT_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Amendment", accessorKey: "title" },
        {
            id: "amendment_type",
            header: "Type",
            accessorKey: "amendment_type",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "effective_date",
            header: "Effective",
            accessorKey: "effective_date",
            fieldType: "date",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "amendment_type",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Amendment", accessorKey: "title" },
            {
                id: "amendment_type",
                label: "Type",
                accessorKey: "amendment_type",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "effective_date",
                label: "Effective",
                accessorKey: "effective_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── e_signature ───

export const E_SIGNATURES_PAGE: ListPageConfig = {
    entityKey: "e_signature",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "pending", label: "Pending", value: "pending" },
            { id: "signed", label: "Signed", value: "signed" },
            { id: "declined", label: "Declined", value: "declined" },
        ],
    },
    description: "Electronic signature requests and completed signatures",
    icon: PenTool,
    createConfig: CREATE_E_SIGNATURE_CONFIG,
    searchKeys: ["document_title", "signer_name"],
    columns: [
        { id: "document_title", header: "Document", accessorKey: "document_title" },
        { id: "signer_name", header: "Signer", accessorKey: "signer_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "signed_at", header: "Signed", accessorKey: "signed_at", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "document_title",
        cardSubtitleKey: "signer_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "document_title", label: "Document", accessorKey: "document_title" },
            { id: "signer_name", label: "Signer", accessorKey: "signer_name" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "signed_at", label: "Signed", accessorKey: "signed_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── insurance_requirement ───

export const INSURANCE_REQUIREMENTS_PAGE: ListPageConfig = {
    entityKey: "insurance_requirement",
    description: "Insurance coverage requirements for projects, events, and vendors",
    icon: Shield,
    createConfig: CREATE_INSURANCE_REQUIREMENT_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Requirement", accessorKey: "name" },
        {
            id: "insurance_type",
            header: "Type",
            accessorKey: "insurance_type",
            fieldType: "status",
        },
        {
            id: "min_coverage",
            header: "Min Coverage",
            accessorKey: "min_coverage",
            fieldType: "currency",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Requirement", accessorKey: "name" },
            {
                id: "insurance_type",
                label: "Type",
                accessorKey: "insurance_type",
                fieldType: "status",
            },
            {
                id: "min_coverage",
                label: "Min Coverage",
                accessorKey: "min_coverage",
                fieldType: "currency",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── legal_hold ───

export const LEGAL_HOLDS_PAGE: ListPageConfig = {
    entityKey: "legal_hold",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "active", label: "Active", value: "active" },
            { id: "released", label: "Released", value: "released" },
        ],
    },
    description: "Track litigation holds and data preservation requirements",
    icon: Scale,
    createConfig: CREATE_LEGAL_HOLD_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Hold", accessorKey: "title" },
        { id: "hold_type", header: "Type", accessorKey: "hold_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "effective_date",
            header: "Effective",
            accessorKey: "effective_date",
            fieldType: "date",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Hold", accessorKey: "title" },
            { id: "hold_type", label: "Type", accessorKey: "hold_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "effective_date",
                label: "Effective",
                accessorKey: "effective_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── rfq ───

export const RFQS_PAGE: ListPageConfig = {
    entityKey: "rfq",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "open", label: "Open", value: "open" },
            { id: "closed", label: "Closed", value: "closed" },
            { id: "awarded", label: "Awarded", value: "awarded" },
        ],
    },
    description: "Requests for quotation to source vendors and suppliers",
    icon: FileText,
    createConfig: CREATE_RFQ_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "RFQ", accessorKey: "title" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "response_count", header: "Responses", accessorKey: "response_count" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "RFQ", accessorKey: "title" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
            { id: "response_count", label: "Responses", accessorKey: "response_count" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── rights ───

export const RIGHTS_PAGE: ListPageConfig = {
    entityKey: "rights",
    description: "Intellectual property rights, licensing, and usage permissions",
    icon: KeyRound,
    createConfig: CREATE_RIGHTS_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Right", accessorKey: "title" },
        { id: "rights_type", header: "Type", accessorKey: "rights_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expiry_date", header: "Expires", accessorKey: "expiry_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Right", accessorKey: "title" },
            { id: "rights_type", label: "Type", accessorKey: "rights_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "expiry_date", label: "Expires", accessorKey: "expiry_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── risk_assessment ───

export const RISK_ASSESSMENTS_PAGE: ListPageConfig = {
    entityKey: "risk_assessment",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "open", label: "Open", value: "open" },
            { id: "mitigated", label: "Mitigated", value: "mitigated" },
            { id: "accepted", label: "Accepted", value: "accepted" },
        ],
    },
    description: "Risk identification, analysis, and mitigation tracking",
    icon: AlertTriangle,
    createConfig: CREATE_RISK_ASSESSMENT_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Assessment", accessorKey: "title" },
        { id: "risk_level", header: "Level", accessorKey: "risk_level", fieldType: "status" },
        { id: "likelihood", header: "Likelihood", accessorKey: "likelihood", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board", "chart"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "risk_level",
    },
    chartConfig: {
        type: "pie",
        categoryKey: "risk_level",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Assessment", accessorKey: "title" },
            { id: "risk_level", label: "Level", accessorKey: "risk_level", fieldType: "status" },
            {
                id: "likelihood",
                label: "Likelihood",
                accessorKey: "likelihood",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── vendor_compliance_document ───

export const VENDOR_COMPLIANCE_DOCUMENTS_PAGE: ListPageConfig = {
    entityKey: "vendor_compliance_document",
    description: "Vendor compliance documentation, certifications, and insurance records",
    icon: FileCheck,
    createConfig: CREATE_VENDOR_COMPLIANCE_DOCUMENT_CONFIG,
    searchKeys: ["title", "vendor_name"],
    columns: [
        { id: "title", header: "Document", accessorKey: "title" },
        { id: "vendor_name", header: "Vendor", accessorKey: "vendor_name" },
        { id: "document_type", header: "Type", accessorKey: "document_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expiry_date", header: "Expires", accessorKey: "expiry_date", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Document", accessorKey: "title" },
            { id: "vendor_name", label: "Vendor", accessorKey: "vendor_name" },
            {
                id: "document_type",
                label: "Type",
                accessorKey: "document_type",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "expiry_date", label: "Expires", accessorKey: "expiry_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── compliance_template ───

export const COMPLIANCE_TEMPLATES_PAGE: ListPageConfig = {
    entityKey: "compliance_template",
    description: "Reusable compliance checklist templates",
    icon: ClipboardCheck,
    createConfig: CREATE_COMPLIANCE_TEMPLATE_CONFIG,
    searchKeys: ["name", "category"],
    columns: [
        { id: "name", header: "Template", accessorKey: "name" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "items_count", header: "Items", accessorKey: "items_count" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Template", accessorKey: "name" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "items_count", label: "Items", accessorKey: "items_count" },
            { id: "is_active", label: "Active", accessorKey: "is_active", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── contract_obligation ───

export const CONTRACT_OBLIGATIONS_PAGE: ListPageConfig = {
    entityKey: "contract_obligation",
    description: "Obligations and deliverables within contracts",
    icon: Scale,
    createConfig: CREATE_OBLIGATION_CONFIG,
    searchKeys: ["description", "obligation_type"],
    columns: [
        { id: "description", header: "Obligation", accessorKey: "description" },
        {
            id: "obligation_type",
            header: "Type",
            accessorKey: "obligation_type",
            fieldType: "status",
        },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "contract_name", header: "Contract", accessorKey: "contract_name" },
    ],
    views: ["table", "board", "calendar"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "description",
        cardSubtitleKey: "obligation_type",
    },
    calendarConfig: {
        titleKey: "description",
        dateKey: "due_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "description", label: "Obligation", accessorKey: "description" },
            {
                id: "obligation_type",
                label: "Type",
                accessorKey: "obligation_type",
                fieldType: "status",
            },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "contract_name", label: "Contract", accessorKey: "contract_name" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── engagement_term ───

export const ENGAGEMENT_TERMS_PAGE: ListPageConfig = {
    entityKey: "engagement_term",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "active", label: "Active", value: "active" },
            { id: "draft", label: "Draft", value: "draft" },
            { id: "expired", label: "Expired", value: "expired" },
        ],
    },
    description: "Terms and conditions for engagements and contracts",
    icon: FileSignature,
    createConfig: CREATE_ENGAGEMENT_TERM_CONFIG,
    searchKeys: ["name", "term_type"],
    columns: [
        { id: "name", header: "Term", accessorKey: "name" },
        { id: "term_type", header: "Type", accessorKey: "term_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "effective_date",
            header: "Effective",
            accessorKey: "effective_date",
            fieldType: "date",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Term", accessorKey: "name" },
            { id: "term_type", label: "Type", accessorKey: "term_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "effective_date",
                label: "Effective",
                accessorKey: "effective_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── vendor_communication ───

export const VENDOR_COMMUNICATIONS_PAGE: ListPageConfig = {
    entityKey: "vendor_communication",
    description: "Communications and correspondence with vendors",
    icon: Mail,
    createConfig: CREATE_VENDOR_COMMUNICATION_CONFIG,
    searchKeys: ["subject", "vendor_name"],
    columns: [
        { id: "subject", header: "Subject", accessorKey: "subject" },
        { id: "vendor_name", header: "Vendor", accessorKey: "vendor_name" },
        {
            id: "communication_type",
            header: "Type",
            accessorKey: "communication_type",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "sent_at", header: "Date", accessorKey: "sent_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "subject", label: "Subject", accessorKey: "subject" },
            { id: "vendor_name", label: "Vendor", accessorKey: "vendor_name" },
            {
                id: "communication_type",
                label: "Type",
                accessorKey: "communication_type",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "sent_at", label: "Date", accessorKey: "sent_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};
