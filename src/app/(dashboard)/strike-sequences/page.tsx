import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function StrikeSequencesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="STRIKE_SEQUENCES_PAGE" />
        </Suspense>
    );
}
