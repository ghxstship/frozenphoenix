"use client";

import { ListPageShell } from "@/components/shells";
import { STAKEHOLDER_PROJECTS_PAGE } from "@/config/list-page-configs";
import { useCreateStakeholderProject, useDeleteStakeholderProject } from "@/lib/supabase/hooks-crm";

export default function Page() {
    const _create = useCreateStakeholderProject();
    const _delete = useDeleteStakeholderProject();
    return <ListPageShell config={STAKEHOLDER_PROJECTS_PAGE} />;
}
