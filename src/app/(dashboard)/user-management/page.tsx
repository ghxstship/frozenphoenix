"use client";

import { ListPageShell } from "@/components/shells";
import { useUserDirectory } from "@/lib/supabase/hooks-pages";
import { CREATE_USER_INVITE_CONFIG } from "@/config/create-entity-configs";
import { Clock } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "user_management",
    title: "User Management",
    description: "Manage users, roles, and access across your organization",
    icon: Clock,
    createConfig: CREATE_USER_INVITE_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function UserManagementPage() {
    const { data: rawData, isLoading } = useUserDirectory();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
