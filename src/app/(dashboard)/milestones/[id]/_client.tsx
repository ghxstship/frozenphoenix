"use client";

import { useMilestone } from "@/lib/supabase";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Flag } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "milestone",
    titleKey: "name",
    statusKey: "status",
    icon: Flag,
    backHref: "/milestones",
    backLabel: "Milestones",
    chatterRecordType: "milestone",
    fields: [],
    relatedEntities: [
        {
            title: "Tasks",
            entityKey: "task",
            foreignKey: "milestone_id",
            columns: [
                { id: "title", header: "Title", accessorKey: "title" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
                { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
                {
                    id: "priority",
                    header: "Priority",
                    accessorKey: "priority",
                    fieldType: "status",
                },
            ],
            linkPattern: "/tasks/{id}",
        },
    ],
    tabs: [],
};

export function MilestonesDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useMilestone(id);

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={(record ?? initialRecord) as Record<string, unknown> | null}
            isLoading={isLoading && !initialRecord}
        />
    );
}
