"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Boxes } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "catalog_item",
    titleKey: "name",
    statusKey: "status",
    icon: Boxes,
    backHref: "/inventory",
    backLabel: "Inventory",
    chatterRecordType: "catalog_item",
    fields: [],
    tabs: [],
};

export function InventoryDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord?: Record<string, unknown> | null;
}) {
    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={initialRecord as Record<string, unknown> | undefined}
        />
    );
}
