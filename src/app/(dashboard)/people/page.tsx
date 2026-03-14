"use client";

import { ListPageShell } from "@/components/shells";
import { usePeople } from "@/lib/supabase/hooks-pages";
import { CREATE_PERSON_CONFIG } from "@/config/create-entity-configs";
import { Mail } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "people",
    title: "Stakeholder Matrix",
    description: "CRM for Internal Team, Clients, Freelance Crew, and Subcontractors",
    icon: Mail,
    createConfig: CREATE_PERSON_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function PeoplePage() {
    const { data: rawData, isLoading } = usePeople();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
