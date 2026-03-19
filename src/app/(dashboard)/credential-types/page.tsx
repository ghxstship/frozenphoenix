import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CredentialTypesPage() {
    const data = await fetchEntityList("credential_type");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CREDENTIAL_TYPES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
