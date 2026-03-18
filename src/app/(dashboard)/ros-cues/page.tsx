"use client";

import { ListPageShell } from "@/components/shells";
import { ROS_CUES_PAGE } from "@/config/list-page-configs";
import { useCreateRosCue, useDeleteRosCue } from "@/lib/supabase/hooks-live-ops";

export default function Page() {
    const _create = useCreateRosCue();
    const _delete = useDeleteRosCue();
    return <ListPageShell config={ROS_CUES_PAGE} />;
}
