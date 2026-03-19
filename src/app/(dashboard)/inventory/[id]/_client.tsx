"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Boxes } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "inventory_item",
    titleKey: "name",
    statusKey: "status",
    icon: Boxes,
    backHref: "/inventory",
    backLabel: "Inventory",
    chatterRecordType: "inventory_item",
    fields: [],
    tabs: [],
};

export function InventoryDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
