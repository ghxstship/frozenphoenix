import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { FEATURE_FLAGS_PAGE } from "@/config/list-page-configs";

export default async function FeatureFlagsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={FEATURE_FLAGS_PAGE} />
        </Suspense>
    );
}
