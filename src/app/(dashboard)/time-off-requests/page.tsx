import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function TimeOffRequestsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="TIME_OFF_REQUESTS_PAGE" />
        </Suspense>
    );
}
