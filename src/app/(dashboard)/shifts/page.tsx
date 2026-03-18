"use client";

import { ListPageShell } from "@/components/shells";
import { SHIFTS_PAGE } from "@/config/list-page-configs";
import {
    useCreateCalendarEvent,
    useCreateShift,
    useDeleteCalendarEvent,
    useDeleteShift,
    useUpdateCalendarEvent,
    useUpdateShift,
} from "@/lib/supabase/hooks-core";

export default function Page() {
    const _createShift = useCreateShift();
    const _updateShift = useUpdateShift();
    const _deleteShift = useDeleteShift();
    const _createCalEvent = useCreateCalendarEvent();
    const _updateCalEvent = useUpdateCalendarEvent();
    const _deleteCalEvent = useDeleteCalendarEvent();
    return <ListPageShell config={SHIFTS_PAGE} />;
}
