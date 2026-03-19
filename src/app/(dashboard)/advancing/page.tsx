import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { PRODUCTION_ADVANCES_PAGE } from "@/config/list-page-configs";

export default async function AdvancingPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PRODUCTION_ADVANCES_PAGE} />
        </Suspense>
    );
}
