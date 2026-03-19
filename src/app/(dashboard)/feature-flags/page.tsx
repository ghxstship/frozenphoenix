import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function FeatureFlagsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="FEATURE_FLAGS_PAGE" />
        </Suspense>
    );
}
