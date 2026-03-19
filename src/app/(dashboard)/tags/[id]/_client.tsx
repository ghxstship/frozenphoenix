"use client";

import { useDeleteTag, useTag, useUpdateTag } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Tag } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "tag",
    titleKey: "name",
    statusKey: "status",
    icon: Tag,
    backHref: "/tags",
    backLabel: "Tags",
    chatterRecordType: "tag",
    fields: [],
    tabs: [],
};

export function TagsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useTag(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Tag",
        listPath: "/tags",
        useUpdateHook: useUpdateTag,
        useDeleteHook: useDeleteTag,
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
