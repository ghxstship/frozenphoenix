import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CustomFieldDefinitionsPage() {
    const data = await fetchEntityList("custom_field_definition");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell
                configKey="CUSTOM_FIELD_DEFINITIONS_PAGE"
                data={data}
                isLoading={false}
            />
        </Suspense>
    );
}
