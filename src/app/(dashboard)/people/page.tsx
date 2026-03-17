"use client";

import { ListPageShell } from "@/components/shells";
import { usePeople } from "@/lib/supabase";
import { PEOPLE_PAGE } from "@/config/list-page-configs";

export default function PeoplePage() {
    const { data: rawData, isLoading } = usePeople();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={PEOPLE_PAGE} data={data} isLoading={isLoading} />;
}
