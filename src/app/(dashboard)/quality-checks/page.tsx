import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { QUALITY_CHECKS_PAGE } from "@/config/list-page-configs";

export default async function QualityChecksPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={QUALITY_CHECKS_PAGE} />
        </Suspense>
    );
}
