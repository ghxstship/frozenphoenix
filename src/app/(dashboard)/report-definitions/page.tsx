import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { REPORT_DEFINITIONS_PAGE } from "@/config/list-page-configs";

export default async function ReportDefinitionsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={REPORT_DEFINITIONS_PAGE} />
        </Suspense>
    );
}
