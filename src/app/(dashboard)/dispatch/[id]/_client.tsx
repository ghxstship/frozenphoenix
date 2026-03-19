"use client";

import {
    useDeleteDispatchRecord,
    useDispatchRecord,
    useUpdateDispatchRecord,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { EmptyState } from "@/components/layouts/empty-state";
import { MapPin, Truck } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "dispatch_entry",
    titleKey: "tracking_number",
    statusKey: "status",
    icon: Truck,
    backHref: "/dispatch",
    backLabel: "Dispatch",
    chatterRecordType: "dispatch_entry",
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "carrier", label: "Carrier", accessorKey: "carrier" },
        { id: "created_at", label: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    fields: [
        { id: "origin_address", label: "Origin", accessorKey: "origin_address", icon: MapPin },
        {
            id: "destination_address",
            label: "Destination",
            accessorKey: "destination_address",
            icon: MapPin,
        },
        { id: "weight", label: "Weight", accessorKey: "weight" },
        { id: "notes", label: "Notes", accessorKey: "notes", fullWidth: true },
    ],
    tabs: [
        {
            id: "tracking",
            label: "Tracking",
            content: (
                <EmptyState
                    icon={MapPin}
                    title="No tracking updates"
                    description="Tracking timeline and status updates for this dispatch will appear here."
                    compact
                />
            ),
        },
    ],
};

export function DispatchDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useDispatchRecord(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Dispatch",
        listPath: "/dispatch",
        useUpdateHook: useUpdateDispatchRecord,
        useDeleteHook: useDeleteDispatchRecord,
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
