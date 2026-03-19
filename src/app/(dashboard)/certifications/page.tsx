import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CERTIFICATIONS_PAGE } from "@/config/list-page-configs";

export default async function CertificationsPage() {
    const data = await fetchEntityList("certification");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CERTIFICATIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
