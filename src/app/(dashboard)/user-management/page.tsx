"use client";

import { ListPageShell } from "@/components/shells";
import { useUserDirectory } from "@/lib/supabase";
import { USER_MANAGEMENT_PAGE } from "@/config/list-page-configs";

export default function UserManagementPage() {
    const { data: rawData, isLoading } = useUserDirectory();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={USER_MANAGEMENT_PAGE} data={data} isLoading={isLoading} />;
}
