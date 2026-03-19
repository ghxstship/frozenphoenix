import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { BRIEF_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default async function BriefTemplatesPage() {
    const data = await fetchEntityList("brief_template");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={BRIEF_TEMPLATES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
