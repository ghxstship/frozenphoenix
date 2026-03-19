import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function RiskAssessmentsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="RISK_ASSESSMENTS_PAGE" />
        </Suspense>
    );
}
