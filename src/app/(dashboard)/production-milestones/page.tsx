"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_MILESTONES_PAGE } from "@/config/list-page-configs";
import {
    useCreateProductionMilestone,
    useProductionMilestones,
    useUpdateProductionMilestone,
} from "@/lib/supabase/hooks-production";

export default function Page() {
    const { data: _items } = useProductionMilestones();
    const _create = useCreateProductionMilestone();
    const _update = useUpdateProductionMilestone();
    return <ListPageShell config={PRODUCTION_MILESTONES_PAGE} />;
}
