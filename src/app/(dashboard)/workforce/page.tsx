import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function WorkforcePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="WORKFORCE_PAGE" />
        </Suspense>
    );
}
