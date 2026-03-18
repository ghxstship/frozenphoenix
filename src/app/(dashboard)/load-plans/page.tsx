"use client";

import { ListPageShell } from "@/components/shells";
import { LOAD_PLANS_PAGE } from "@/config/list-page-configs";
import {
    useCreateLoadPlan,
    useLoadPlan,
    useLoadPlans,
    useUpdateLoadPlan,
} from "@/lib/supabase/hooks-assets-inventory";

export default function LoadPlansPage() {
    const { data: _items } = useLoadPlans();
    const { data: _detail } = useLoadPlan("");
    const _create = useCreateLoadPlan();
    const _update = useUpdateLoadPlan();
    return <ListPageShell config={LOAD_PLANS_PAGE} />;
}
