"use client";

import { useParams } from "next/navigation";
import {
    useDeleteLiveEventInstance,
    useLiveEventInstance,
    useUpdateLiveEventInstance,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Clock, MapPin, Radio, Users } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "live_event_instances",
    titleKey: "name",
    subtitleKey: "event_name",
    statusKey: "status",
    icon: Radio,
    backHref: "/live-ops",
    backLabel: "Live Operations",
    chatterRecordType: "live_event_instance",
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "event_date", label: "Event Date", accessorKey: "event_date", fieldType: "date" },
        { id: "venue", label: "Venue", accessorKey: "venue" },
    ],
    fields: [
        { id: "location", label: "Location", accessorKey: "location_name", icon: MapPin },
        { id: "crew_count", label: "Crew Count", accessorKey: "crew_count", icon: Users },
        { id: "doors_time", label: "Doors Time", accessorKey: "doors_time", icon: Clock },
        { id: "notes", label: "Notes", accessorKey: "notes", fullWidth: true },
    ],
    tabs: [],
};

export default function LiveOpsDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: instance, isLoading } = useLiveEventInstance(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Live Event",
        listPath: "/live-ops",
        useUpdateHook: useUpdateLiveEventInstance,
        useDeleteHook: useDeleteLiveEventInstance,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={instance as Record<string, unknown> | null}
            isLoading={isLoading}
            menuItems={crudMenuItems}
        />
    );
}
