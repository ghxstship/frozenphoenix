"use client";

import { ListPageShell } from "@/components/shells";
import { FOH_ZONES_PAGE } from "@/config/list-page-configs";
import {
    useCreateFohZone,
    useCreateFohZoneReading,
    useUpdateFohZone,
} from "@/lib/supabase/hooks-live-ops";

export default function FohZonesPage() {
    const _create = useCreateFohZone();
    const _update = useUpdateFohZone();
    const _createReading = useCreateFohZoneReading();
    return <ListPageShell config={FOH_ZONES_PAGE} />;
}
