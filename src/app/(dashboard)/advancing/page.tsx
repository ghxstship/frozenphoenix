import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function AdvancingPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="PRODUCTION_ADVANCES_PAGE" />
        </Suspense>
    );
}
