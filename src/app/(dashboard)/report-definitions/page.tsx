import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function ReportDefinitionsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="REPORT_DEFINITIONS_PAGE" />
        </Suspense>
    );
}
