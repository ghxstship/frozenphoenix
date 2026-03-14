"use client";

import { ListPageShell } from "@/components/shells";
import { INSURANCE_REQUIREMENTS_PAGE } from "@/config/list-page-configs";

export default function InsuranceRequirementsPage() {
    return <ListPageShell config={INSURANCE_REQUIREMENTS_PAGE} />;
}
