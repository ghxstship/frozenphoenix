"use client";

import { ListPageShell } from "@/components/shells";
import { useIpRights } from "@/lib/supabase";
import { IP_RIGHTS_PAGE } from "@/config/list-page-configs";

export default function IPRightsPage() {
    const { data: rawData, isLoading } = useIpRights();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={IP_RIGHTS_PAGE} data={data} isLoading={isLoading} />;
}
