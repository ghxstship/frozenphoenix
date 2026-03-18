"use client";

import { ListPageShell } from "@/components/shells";
import { WORKER_PROFILES_PAGE } from "@/config/list-page-configs";
import { useCreateWorkerProfile } from "@/lib/supabase/hooks-workforce";

export default function Page() {
    const _create = useCreateWorkerProfile();
    return <ListPageShell config={WORKER_PROFILES_PAGE} />;
}
