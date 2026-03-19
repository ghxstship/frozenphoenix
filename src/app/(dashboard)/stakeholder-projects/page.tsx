import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function StakeholderProjectsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="STAKEHOLDER_PROJECTS_PAGE" />
        </Suspense>
    );
}
