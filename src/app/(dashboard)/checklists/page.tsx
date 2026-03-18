"use client";

import { ListPageShell } from "@/components/shells";
import { useChecklists } from "@/lib/supabase";
import { CHECKLISTS_PAGE } from "@/config/list-page-configs";
import {
    useCreateChecklist,
    useDeleteChecklist,
    useUpdateChecklist,
} from "@/lib/supabase/hooks-admin";

export default function ChecklistsPage() {
    const { data: rawData, isLoading } = useChecklists();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateChecklist();
    const _update = useUpdateChecklist();
    const _delete = useDeleteChecklist();

    return <ListPageShell config={CHECKLISTS_PAGE} data={data} isLoading={isLoading} />;
}
