import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { ROLE_CHANGE_LOG_PAGE } from "@/config/list-page-configs";

export default async function Page() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ROLE_CHANGE_LOG_PAGE} />
        </Suspense>
    );
}
