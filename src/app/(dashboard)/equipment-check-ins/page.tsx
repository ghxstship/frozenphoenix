"use client";

import { ListPageShell } from "@/components/shells";
import { EQUIPMENT_CHECK_INS_PAGE } from "@/config/list-page-configs";
import { useCreateEquipmentCheckIn } from "@/lib/supabase/hooks-live-ops";

export default function Page() {
    const _create = useCreateEquipmentCheckIn();
    return <ListPageShell config={EQUIPMENT_CHECK_INS_PAGE} />;
}
