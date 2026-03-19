import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { UPSELL_TRIGGERS_PAGE } from "@/config/list-page-configs";

export default async function UpsellTriggersPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={UPSELL_TRIGGERS_PAGE} />
        </Suspense>
    );
}
