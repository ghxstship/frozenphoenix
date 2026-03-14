"use client";

import { ListPageShell } from "@/components/shells";
import { RISK_ASSESSMENTS_PAGE } from "@/config/list-page-configs";

export default function RiskAssessmentsPage() {
    return <ListPageShell config={RISK_ASSESSMENTS_PAGE} />;
}
