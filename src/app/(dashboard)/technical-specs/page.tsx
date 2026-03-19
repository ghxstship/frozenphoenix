import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function TechnicalSpecsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="TECHNICAL_SPECS_PAGE" />
        </Suspense>
    );
}
