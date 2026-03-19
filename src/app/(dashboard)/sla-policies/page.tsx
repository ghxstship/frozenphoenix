import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function SlaPoliciesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SLA_POLICIES_PAGE" />
        </Suspense>
    );
}
