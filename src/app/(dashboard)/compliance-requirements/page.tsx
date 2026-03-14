"use client";

import { ListPageShell } from "@/components/shells";
import { COMPLIANCE_REQUIREMENTS_PAGE } from "@/config/list-page-configs";

export default function ComplianceRequirementsPage() {
    return <ListPageShell config={COMPLIANCE_REQUIREMENTS_PAGE} />;
}
