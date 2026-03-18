"use client";

import { ListPageShell } from "@/components/shells";
import { ENVIRONMENTAL_READINGS_PAGE } from "@/config/list-page-configs";
import { useCreateEnvironmentalReading } from "@/lib/supabase/hooks-live-ops";

export default function Page() {
    const _create = useCreateEnvironmentalReading();
    return <ListPageShell config={ENVIRONMENTAL_READINGS_PAGE} />;
}
