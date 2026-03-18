"use client";

import { ListPageShell } from "@/components/shells";
import { useDeals } from "@/lib/supabase";
import { PIPELINE_PAGE } from "@/config/list-page-configs";
import { useCreatePipeline, useDeletePipeline, useUpdatePipeline } from "@/lib/supabase/hooks-crm";

export default function PipelinePage() {
    const { data: rawData, isLoading } = useDeals();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _createPipeline = useCreatePipeline();
    const _updatePipeline = useUpdatePipeline();
    const _deletePipeline = useDeletePipeline();

    return <ListPageShell config={PIPELINE_PAGE} data={data} isLoading={isLoading} />;
}
