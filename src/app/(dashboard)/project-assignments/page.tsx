"use client";

import { ListPageShell } from "@/components/shells";
import { PROJECT_ASSIGNMENTS_PAGE } from "@/config/list-page-configs";
import {
    useCreateProjectAssignment,
    useDeleteProjectAssignment,
    useUpdateProjectAssignment,
} from "@/lib/supabase/hooks-production";

export default function Page() {
    const _create = useCreateProjectAssignment();
    const _update = useUpdateProjectAssignment();
    const _delete = useDeleteProjectAssignment();
    return <ListPageShell config={PROJECT_ASSIGNMENTS_PAGE} />;
}
