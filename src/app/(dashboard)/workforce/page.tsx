import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { WORKFORCE_PAGE } from "@/config/list-page-configs";

export default async function WorkforcePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WORKFORCE_PAGE} />
        </Suspense>
    );
}
