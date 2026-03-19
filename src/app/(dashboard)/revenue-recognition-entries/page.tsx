import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function Page() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="REVENUE_RECOGNITION_ENTRIES_PAGE" />
        </Suspense>
    );
}
