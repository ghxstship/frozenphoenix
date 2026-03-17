"use client";

import { ListPageShell } from "@/components/shells";
import { useProviderConnections } from "@/lib/supabase/hooks-external-sync";
import { INTEGRATIONS_PAGE } from "@/config/list-page-configs";

export default function IntegrationsPage() {
    const { data: rawData, isLoading } = useProviderConnections();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={INTEGRATIONS_PAGE} data={data} isLoading={isLoading} />;
}
