import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function UpsellTriggersPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="UPSELL_TRIGGERS_PAGE" />
        </Suspense>
    );
}
