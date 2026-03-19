"use client";

import { useDeleteSOP, useSOP, useUpdateSOP } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { FileText } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "sop",
    titleKey: "title",
    statusKey: "status",
    icon: FileText,
    backHref: "/sops",
    backLabel: "Sops",
    chatterRecordType: "sop",
    fields: [],
    tabs: [],
};

export function SopsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useSOP(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "SOP",
        listPath: "/sops",
        useUpdateHook: useUpdateSOP,
        useDeleteHook: useDeleteSOP,
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
