import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CredentialAssignmentsPage() {
    const data = await fetchEntityList("credential_assignment");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CREDENTIAL_ASSIGNMENTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
