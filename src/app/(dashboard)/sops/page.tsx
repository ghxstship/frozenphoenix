"use client";

import { ListPageShell } from "@/components/shells";
import { useSOPs } from "@/lib/supabase";
import { useCreateSOP, useDeleteSOP, useUpdateSOP } from "@/lib/supabase/hooks-documents";
import { SOPS_PAGE } from "@/config/list-page-configs";

export default function SOPsPage() {
    const { data: rawData, isLoading } = useSOPs();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateSOP();
    const _update = useUpdateSOP();
    const _delete = useDeleteSOP();

    return <ListPageShell config={SOPS_PAGE} data={data} isLoading={isLoading} />;
}
