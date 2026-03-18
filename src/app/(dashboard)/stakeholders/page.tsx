"use client";

import { ListPageShell } from "@/components/shells";
import { STAKEHOLDERS_PAGE } from "@/config/list-page-configs";
import {
    useCreateStakeholder,
    useDeleteStakeholder,
    useUpdateStakeholder,
} from "@/lib/supabase/hooks-crm";

export default function StakeholdersPage() {
    const _create = useCreateStakeholder();
    const _update = useUpdateStakeholder();
    const _delete = useDeleteStakeholder();
    return <ListPageShell config={STAKEHOLDERS_PAGE} />;
}
