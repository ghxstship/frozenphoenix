"use client";

import { ListPageShell } from "@/components/shells";
import { TIME_ENTRIES_PAGE } from "@/config/list-page-configs";
import {
    useDeleteTimeEntry,
    useTimeEntry,
    useUpdateTimeEntry,
} from "@/lib/supabase/hooks-workforce";

export default function Page() {
    const { data: _detail } = useTimeEntry("");
    const _update = useUpdateTimeEntry();
    const _delete = useDeleteTimeEntry();
    return <ListPageShell config={TIME_ENTRIES_PAGE} />;
}
