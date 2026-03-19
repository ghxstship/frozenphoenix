import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { SERVICE_HEALTH_CHECKS_PAGE } from "@/config/list-page-configs";

export default async function Page() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SERVICE_HEALTH_CHECKS_PAGE} />
        </Suspense>
    );
}
