"use client";

import { ListPageShell } from "@/components/shells";
import { CREW_SHIFTS_PAGE } from "@/config/list-page-configs";
import {
    useCreateCrewShift,
    useDeleteCrewShift,
    useUpdateCrewShift,
} from "@/lib/supabase/hooks-workforce";

export default function Page() {
    const _create = useCreateCrewShift();
    const _update = useUpdateCrewShift();
    const _delete = useDeleteCrewShift();
    return <ListPageShell config={CREW_SHIFTS_PAGE} />;
}
