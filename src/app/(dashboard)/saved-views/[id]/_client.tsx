"use client";

import { useSavedView } from "@/lib/supabase";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Bookmark } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "saved_view",
    titleKey: "name",
    statusKey: "status",
    icon: Bookmark,
    backHref: "/saved-views",
    backLabel: "Saved Views",
    chatterRecordType: "saved_view",
    fields: [],
    tabs: [],
};

export function SavedViewsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useSavedView(id);

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={(record ?? initialRecord) as Record<string, unknown> | null}
            isLoading={isLoading && !initialRecord}
        />
    );
}
