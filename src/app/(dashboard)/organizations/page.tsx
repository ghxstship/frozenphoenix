"use client";

import { ListPageShell } from "@/components/shells";
import { ORGANIZATIONS_PAGE } from "@/config/list-page-configs";
import { useOrganizations } from "@/lib/supabase/hooks-admin";

export default function Page() {
    const { data: _items } = useOrganizations();
    return <ListPageShell config={ORGANIZATIONS_PAGE} />;
}
