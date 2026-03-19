import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { TAGS_PAGE } from "@/config/list-page-configs";

export default async function TagsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TAGS_PAGE} />
        </Suspense>
    );
}
