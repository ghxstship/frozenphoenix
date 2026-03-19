import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function TagsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="TAGS_PAGE" />
        </Suspense>
    );
}
