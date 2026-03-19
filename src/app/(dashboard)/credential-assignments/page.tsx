import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CREDENTIAL_ASSIGNMENTS_PAGE } from "@/config/list-page-configs";

export default async function CredentialAssignmentsPage() {
    const data = await fetchEntityList("credential_assignment");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CREDENTIAL_ASSIGNMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
