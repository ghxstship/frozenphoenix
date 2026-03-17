"use client";

import { ListPageShell } from "@/components/shells";
import { useVehicles } from "@/lib/supabase";
import { FLEET_PAGE } from "@/config/list-page-configs";

export default function FleetPage() {
    const { data: rawData, isLoading } = useVehicles();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={FLEET_PAGE} data={data} isLoading={isLoading} />;
}
