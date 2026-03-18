"use client";

import { ListPageShell } from "@/components/shells";
import { RISK_ASSESSMENTS_PAGE } from "@/config/list-page-configs";
import { useCreateRiskAssessment } from "@/lib/supabase/hooks-admin";

export default function RiskAssessmentsPage() {
    const _create = useCreateRiskAssessment();
    return <ListPageShell config={RISK_ASSESSMENTS_PAGE} />;
}
