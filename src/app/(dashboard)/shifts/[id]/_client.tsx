"use client";

import { useDeleteShift, useShift, useUpdateShift } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Clock } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "crew_shift",
    titleKey: "name",
    statusKey: "status",
    icon: Clock,
    backHref: "/shifts",
    backLabel: "Shifts",
    chatterRecordType: "crew_shift",
    fields: [],
    relatedEntities: [
        {
            title: "Crew Members",
            entityKey: "crew_shift_assignment",
            foreignKey: "crew_shift_id",
            columns: [
                { id: "crew_member_name", header: "Name", accessorKey: "crew_member_name" },
                { id: "role", header: "Role", accessorKey: "role" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
        },
    ],
    tabs: [],
};

export function ShiftsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useShift(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Shift",
        listPath: "/shifts",
        useUpdateHook: useUpdateShift,
        useDeleteHook: useDeleteShift,
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
