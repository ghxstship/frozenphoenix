"use client";

import { useParams } from "next/navigation";
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
    entityKey: "dispatch",
    titleKey: "tracking_number",
    statusKey: "status",
    icon: Truck,
    backHref: "/dispatch",
    backLabel: "Dispatch",
    chatterRecordType: "dispatch",
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

export default function DispatchDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: record, isLoading } = useDispatchRecord(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Dispatch",
        listPath: "/dispatch",
        useUpdateHook: useUpdateDispatchRecord,
        useDeleteHook: useDeleteDispatchRecord,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={record as Record<string, unknown> | null}
            isLoading={isLoading}
            menuItems={crudMenuItems}
        />
    );
}
