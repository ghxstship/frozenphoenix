"use client";

import { useBom, useDeleteBom, useUpdateBom } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Package } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "bom",
    titleKey: "name",
    statusKey: "status",
    icon: Package,
    backHref: "/boms",
    backLabel: "Boms",
    chatterRecordType: "bom",
    fields: [],
    tabs: [],
};

export function BomsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useBom(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Bill of Materials",
        listPath: "/boms",
        useUpdateHook: useUpdateBom,
        useDeleteHook: useDeleteBom,
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
