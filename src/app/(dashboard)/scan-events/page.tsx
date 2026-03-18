"use client";

import { ListPageShell } from "@/components/shells";
import { SCAN_EVENTS_PAGE } from "@/config/list-page-configs";
import { useCreateScanEvent, useScanEvents } from "@/lib/supabase/hooks-live-ops";

export default function Page() {
    const { data: _events } = useScanEvents();
    const _create = useCreateScanEvent();
    return <ListPageShell config={SCAN_EVENTS_PAGE} />;
}
