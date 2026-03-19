import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CUSTOM_FIELD_DEFINITIONS_PAGE } from "@/config/list-page-configs";

export default async function CustomFieldDefinitionsPage() {
    const data = await fetchEntityList("custom_field_definition");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CUSTOM_FIELD_DEFINITIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
