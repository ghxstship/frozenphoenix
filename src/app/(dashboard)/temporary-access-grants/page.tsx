import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function TemporaryAccessGrantsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="TEMPORARY_ACCESS_GRANTS_PAGE" />
        </Suspense>
    );
}
