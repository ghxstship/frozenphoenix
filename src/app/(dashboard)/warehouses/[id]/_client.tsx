"use client";

import { useWarehouse } from "@/lib/supabase";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Warehouse } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "warehouse",
    titleKey: "name",
    statusKey: "status",
    icon: Warehouse,
    backHref: "/warehouses",
    backLabel: "Warehouses",
    chatterRecordType: "warehouse",
    fields: [],
    tabs: [],
};

export function WarehousesDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useWarehouse(id);

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={(record ?? initialRecord) as Record<string, unknown> | null}
            isLoading={isLoading && !initialRecord}
        />
    );
}
