"use client";

import { ListPageShell } from "@/components/shells";
import { useTeamMembersPage } from "@/lib/supabase";
import { TEAMS_PAGE } from "@/config/list-page-configs";

export default function TeamsPage() {
    const { data: rawData, isLoading } = useTeamMembersPage();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={TEAMS_PAGE} data={data} isLoading={isLoading} />;
}
