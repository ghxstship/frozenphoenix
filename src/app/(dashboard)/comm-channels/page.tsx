"use client";

import { ListPageShell } from "@/components/shells";
import { COMM_CHANNELS_PAGE } from "@/config/list-page-configs";
import { useCreateCommChannel, useUpdateCommChannel } from "@/lib/supabase/hooks-live-ops";

export default function Page() {
    const _create = useCreateCommChannel();
    const _update = useUpdateCommChannel();
    return <ListPageShell config={COMM_CHANNELS_PAGE} />;
}
