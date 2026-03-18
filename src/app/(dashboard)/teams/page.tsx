"use client";

import { ListPageShell } from "@/components/shells";
import { useAddTeamMember, useRemoveTeamMember, useTeamMembersPage } from "@/lib/supabase";
import {
    useCreateTeam,
    useDeleteTeam,
    useTeamDetail,
    useUpdateTeam,
} from "@/lib/supabase/hooks-admin";
import { TEAMS_PAGE } from "@/config/list-page-configs";

export default function TeamsPage() {
    const { data: rawData, isLoading } = useTeamMembersPage();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _addMember = useAddTeamMember();
    const _removeMember = useRemoveTeamMember();
    const { data: _teamDetail } = useTeamDetail();
    const _createTeam = useCreateTeam();
    const _updateTeam = useUpdateTeam();
    const _deleteTeam = useDeleteTeam();

    return <ListPageShell config={TEAMS_PAGE} data={data} isLoading={isLoading} />;
}
