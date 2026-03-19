import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { TEMPORARY_ACCESS_GRANTS_PAGE } from "@/config/list-page-configs";

export default async function TemporaryAccessGrantsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TEMPORARY_ACCESS_GRANTS_PAGE} />
        </Suspense>
    );
}
