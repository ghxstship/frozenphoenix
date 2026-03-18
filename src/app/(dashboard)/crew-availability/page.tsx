"use client";

import { ListPageShell } from "@/components/shells";
import { CREW_AVAILABILITY_PAGE } from "@/config/list-page-configs";
import {
    useCreateCrewAvailability,
    useCrewAvailability,
    useUpdateCrewAvailability,
} from "@/lib/supabase/hooks-workforce";

export default function Page() {
    const { data: _items } = useCrewAvailability();
    const _create = useCreateCrewAvailability();
    const _update = useUpdateCrewAvailability();
    return <ListPageShell config={CREW_AVAILABILITY_PAGE} />;
}
