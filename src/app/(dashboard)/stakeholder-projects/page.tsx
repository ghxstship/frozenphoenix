import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { STAKEHOLDER_PROJECTS_PAGE } from "@/config/list-page-configs";

export default async function StakeholderProjectsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={STAKEHOLDER_PROJECTS_PAGE} />
        </Suspense>
    );
}
