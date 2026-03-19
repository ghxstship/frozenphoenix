import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { TECHNICAL_SPECS_PAGE } from "@/config/list-page-configs";

export default async function TechnicalSpecsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TECHNICAL_SPECS_PAGE} />
        </Suspense>
    );
}
