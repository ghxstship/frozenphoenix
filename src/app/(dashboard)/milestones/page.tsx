"use client";

import { ListPageShell } from "@/components/shells";
import { MILESTONES_PAGE } from "@/config/list-page-configs";
import {
    useCreateMilestone,
    useDeleteMilestone,
    useMilestone,
    useMilestones,
    useUpdateMilestone,
} from "@/lib/supabase/hooks-core";

export default function Page() {
    const { data: _items } = useMilestones();
    const { data: _detail } = useMilestone("");
    const _create = useCreateMilestone();
    const _update = useUpdateMilestone();
    const _delete = useDeleteMilestone();
    return <ListPageShell config={MILESTONES_PAGE} />;
}
