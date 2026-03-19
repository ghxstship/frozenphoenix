"use client";

import { useDeleteIpRight, useIpRight, useUpdateIpRight } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Shield } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "ip_right",
    titleKey: "title",
    statusKey: "status",
    icon: Shield,
    backHref: "/ip-rights",
    backLabel: "Ip Rights",
    chatterRecordType: "ip_right",
    fields: [],
    tabs: [],
};

export function IpRightsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useIpRight(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "IP Right",
        listPath: "/ip-rights",
        useUpdateHook: useUpdateIpRight,
        useDeleteHook: useDeleteIpRight,
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
