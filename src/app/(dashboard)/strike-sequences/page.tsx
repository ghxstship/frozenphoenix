import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { STRIKE_SEQUENCES_PAGE } from "@/config/list-page-configs";

export default async function StrikeSequencesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={STRIKE_SEQUENCES_PAGE} />
        </Suspense>
    );
}
