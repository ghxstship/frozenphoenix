"use client";

import { ListPageShell } from "@/components/shells";
import { NOTIFICATIONS_PAGE } from "@/config/list-page-configs";
import { useCreateNotification } from "@/lib/supabase/hooks-automation";

export default function Page() {
    const _create = useCreateNotification();
    return <ListPageShell config={NOTIFICATIONS_PAGE} />;
}
