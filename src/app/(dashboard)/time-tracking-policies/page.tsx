"use client";

import { ListPageShell } from "@/components/shells";
import { TIME_TRACKING_POLICIES_PAGE } from "@/config/list-page-configs";
import { useUpsertTimeTrackingPolicy } from "@/lib/supabase/hooks-automation";

export default function Page() {
    const _upsertPolicy = useUpsertTimeTrackingPolicy();
    return <ListPageShell config={TIME_TRACKING_POLICIES_PAGE} />;
}
