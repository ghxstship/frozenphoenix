import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PROJECT_ASSIGNMENTS_PAGE } from "@/config/list-page-configs";

export default async function ProjectAssignmentsPage() {
    const data = await fetchEntityList("project_assignment");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PROJECT_ASSIGNMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
