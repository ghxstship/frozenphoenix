"use client";

import { useDeleteVehicle, useUpdateVehicle, useVehicle } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Truck } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "vehicle",
    titleKey: "name",
    statusKey: "status",
    icon: Truck,
    backHref: "/fleet",
    backLabel: "Fleet",
    chatterRecordType: "vehicle",
    fields: [],
    relatedEntities: [
        {
            title: "Maintenance Records",
            entityKey: "maintenance_schedule",
            foreignKey: "vehicle_id",
            columns: [
                { id: "title", header: "Title", accessorKey: "title" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
                {
                    id: "next_date",
                    header: "Next Date",
                    accessorKey: "next_date",
                    fieldType: "date",
                },
            ],
            linkPattern: "/maintenance-schedules/{id}",
        },
    ],
    tabs: [],
};

export function FleetDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useVehicle(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Vehicle",
        listPath: "/fleet",
        useUpdateHook: useUpdateVehicle,
        useDeleteHook: useDeleteVehicle,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={(record ?? initialRecord) as Record<string, unknown> | null}
            isLoading={isLoading && !initialRecord}
            menuItems={crudMenuItems}
        />
    );
}
