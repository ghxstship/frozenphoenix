"use client";

import { ListPageShell } from "@/components/shells";
import { DEPRECIATION_SCHEDULES_PAGE } from "@/config/list-page-configs";
import {
    useCreateDepreciationSchedule,
    useDepreciationSchedule,
    useDepreciationSchedules,
    useUpdateDepreciationSchedule,
} from "@/lib/supabase/hooks-finance";

export default function DepreciationSchedulesPage() {
    const { data: _items } = useDepreciationSchedules();
    const { data: _detail } = useDepreciationSchedule("");
    const _create = useCreateDepreciationSchedule();
    const _update = useUpdateDepreciationSchedule();
    return <ListPageShell config={DEPRECIATION_SCHEDULES_PAGE} />;
}
