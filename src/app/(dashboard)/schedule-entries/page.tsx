"use client";

import { ListPageShell } from "@/components/shells";
import { SCHEDULE_ENTRIES_PAGE } from "@/config/list-page-configs";
import {
    useCreateScheduleEntry,
    useDeleteScheduleEntry,
    useScheduleEntries,
    useScheduleEntry,
    useUpdateScheduleEntry,
} from "@/lib/supabase/hooks-production";

export default function Page() {
    const { data: _items } = useScheduleEntries();
    const { data: _detail } = useScheduleEntry("");
    const _create = useCreateScheduleEntry();
    const _update = useUpdateScheduleEntry();
    const _delete = useDeleteScheduleEntry();
    return <ListPageShell config={SCHEDULE_ENTRIES_PAGE} />;
}
