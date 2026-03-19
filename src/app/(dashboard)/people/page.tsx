import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { PEOPLE_PAGE } from "@/config/list-page-configs";

export default async function PeoplePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PEOPLE_PAGE} />
        </Suspense>
    );
}
