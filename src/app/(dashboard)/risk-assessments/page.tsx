import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { RISK_ASSESSMENTS_PAGE } from "@/config/list-page-configs";

export default async function RiskAssessmentsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={RISK_ASSESSMENTS_PAGE} />
        </Suspense>
    );
}
