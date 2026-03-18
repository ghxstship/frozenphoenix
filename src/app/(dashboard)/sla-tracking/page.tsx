"use client";

import { ListPageShell } from "@/components/shells";
import { SLA_TRACKING_PAGE } from "@/config/list-page-configs";
import { useSlaTracking } from "@/lib/supabase/hooks-admin";

export default function Page() {
    const { data: _items } = useSlaTracking();
    return <ListPageShell config={SLA_TRACKING_PAGE} />;
}
