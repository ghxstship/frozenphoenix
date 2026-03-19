import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CHECKLIST_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default async function ChecklistTemplatesPage() {
    const data = await fetchEntityList("checklist_template");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CHECKLIST_TEMPLATES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
