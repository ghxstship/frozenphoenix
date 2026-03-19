import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { QUALITY_CHECK_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default async function Page() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={QUALITY_CHECK_TEMPLATES_PAGE} />
        </Suspense>
    );
}
