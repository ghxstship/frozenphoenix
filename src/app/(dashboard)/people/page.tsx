"use client";

import { ListPageShell } from "@/components/shells";
import { usePeople } from "@/lib/supabase";
import { PEOPLE_PAGE } from "@/config/list-page-configs";
import { useCreatePerson } from "@/lib/supabase/hooks-admin";

export default function PeoplePage() {
    const { data: rawData, isLoading } = usePeople();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreatePerson();

    return <ListPageShell config={PEOPLE_PAGE} data={data} isLoading={isLoading} />;
}
