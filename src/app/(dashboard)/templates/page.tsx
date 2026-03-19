import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { TEMPLATES_PAGE } from "@/config/list-page-configs";

export default async function TemplatesPage() {
    const data = await fetchEntityList("project_template");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TEMPLATES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
