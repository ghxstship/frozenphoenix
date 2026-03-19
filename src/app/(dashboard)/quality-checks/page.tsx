import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function QualityChecksPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="QUALITY_CHECKS_PAGE" />
        </Suspense>
    );
}
