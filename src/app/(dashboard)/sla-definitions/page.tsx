import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function SlaDefinitionsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SLA_DEFINITIONS_PAGE" />
        </Suspense>
    );
}
