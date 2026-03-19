import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ENGAGEMENT_TERMS_PAGE } from "@/config/list-page-configs";

export default async function EngagementTermsPage() {
    const data = await fetchEntityList("engagement_term");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ENGAGEMENT_TERMS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
