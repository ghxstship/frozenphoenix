import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { SLA_DEFINITIONS_PAGE } from "@/config/list-page-configs";

export default async function SlaDefinitionsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SLA_DEFINITIONS_PAGE} />
        </Suspense>
    );
}
