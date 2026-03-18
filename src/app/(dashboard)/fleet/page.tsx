"use client";

import { ListPageShell } from "@/components/shells";
import { useVehicles } from "@/lib/supabase";
import { FLEET_PAGE } from "@/config/list-page-configs";
import {
    useCreateFleetVehicle,
    useCreateVehicle,
    useDeleteVehicle,
    useFleetVehicles,
    useUpdateVehicle,
} from "@/lib/supabase/hooks-assets-inventory";

export default function FleetPage() {
    const { data: rawData, isLoading } = useVehicles();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const { data: _fleet } = useFleetVehicles();
    const _createFleet = useCreateFleetVehicle();
    const _createVehicle = useCreateVehicle();
    const _updateVehicle = useUpdateVehicle();
    const _deleteVehicle = useDeleteVehicle();

    return <ListPageShell config={FLEET_PAGE} data={data} isLoading={isLoading} />;
}
