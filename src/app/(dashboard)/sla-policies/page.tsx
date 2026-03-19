import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { SLA_POLICIES_PAGE } from "@/config/list-page-configs";

export default async function SlaPoliciesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SLA_POLICIES_PAGE} />
        </Suspense>
    );
}
