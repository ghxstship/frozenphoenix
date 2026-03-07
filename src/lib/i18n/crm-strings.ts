/**
 * CRM & Sales — i18n string definitions
 * Covers: deals, leads, opportunities, contacts, accounts, companies,
 *         proposals, people, client-portal, case-studies
 */

export const CRM_STRINGS = {
    // ─── Deals ─────────────────────────────────────────────────
    deals_title: "Deals",
    deals_empty: "No deals",
    deals_search: "Search deals...",
    deals_create: "New Deal",
    deal_name: "Deal Name",
    deal_stage: "Stage",
    deal_value: "Value",
    deal_close_date: "Expected Close Date",
    deal_probability: "Probability",
    deal_owner: "Owner",
    deal_company: "Company",

    // ─── Leads ─────────────────────────────────────────────────
    leads_title: "Leads",
    leads_empty: "No leads",
    leads_create: "New Lead",
    lead_name: "Lead Name",
    lead_source: "Source",
    lead_status: "Status",
    lead_score: "Score",
    lead_company: "Company",
    lead_email: "Email",

    // ─── Opportunities ─────────────────────────────────────────
    opportunities_title: "Opportunities",
    opportunities_empty: "No opportunities",
    opportunities_create: "New Opportunity",
    opportunity_name: "Name",
    opportunity_stage: "Stage",
    opportunity_value: "Value",
    opportunity_probability: "Win Probability",
    opportunity_close_date: "Expected Close",

    // ─── Contacts ──────────────────────────────────────────────
    contacts_title: "Contacts",
    contacts_empty: "No contacts",
    contacts_search: "Search contacts...",
    contacts_create: "New Contact",
    contact_name: "Name",
    contact_email: "Email",
    contact_phone: "Phone",
    contact_company: "Company",
    contact_role: "Role",

    // ─── Accounts ──────────────────────────────────────────────
    accounts_title: "Accounts",
    accounts_empty: "No accounts",
    accounts_create: "New Account",
    account_name: "Account Name",
    account_type: "Type",
    account_industry: "Industry",
    account_revenue: "Annual Revenue",
    account_owner: "Account Owner",

    // ─── Companies ─────────────────────────────────────────────
    companies_title: "Companies",
    companies_empty: "No companies",
    companies_create: "New Company",
    company_name: "Company Name",
    company_industry: "Industry",
    company_website: "Website",
    company_size: "Size",

    // ─── Proposals ─────────────────────────────────────────────
    proposals_title: "Proposals",
    proposals_empty: "No proposals",
    proposals_create: "New Proposal",
    proposal_title_field: "Proposal Title",
    proposal_client: "Client",
    proposal_value: "Value",
    proposal_status: "Status",
    proposal_deadline: "Deadline",

    // ─── People ────────────────────────────────────────────────
    people_title: "People",
    people_empty: "No people",
    people_create: "New Person",
    person_name: "Name",
    person_email: "Email",
    person_phone: "Phone",
    person_organization: "Organization",

    // ─── Client Portal ─────────────────────────────────────────
    client_portal_title: "Client Portal",
    client_portal_empty: "No client portal items",
    client_portal_projects: "Your Projects",
    client_portal_invoices: "Your Invoices",
    client_portal_approvals: "Pending Approvals",

    // ─── Case Studies ──────────────────────────────────────────
    case_studies_title: "Case Studies",
    case_studies_empty: "No case studies",
    case_studies_create: "New Case Study",
    case_study_title: "Title",
    case_study_client: "Client",
    case_study_industry: "Industry",

    // ─── Deal Stages ───────────────────────────────────────────
    stage_qualifying: "Qualifying",
    stage_proposal: "Proposal",
    stage_negotiation: "Negotiation",
    stage_closed_won: "Closed Won",
    stage_closed_lost: "Closed Lost",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_deal_list: "Deal list",
    a11y_lead_list: "Lead list",
    a11y_pipeline_board: "Pipeline board",
    a11y_deal_stage: "Deal stage: {stage}",
} as const;

export type CrmStringKey = keyof typeof CRM_STRINGS;
