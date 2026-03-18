"use client";

import { ListPageShell } from "@/components/shells";
import { useProviderConnections } from "@/lib/supabase/hooks-external-sync";
import {
    useCreateIntegration,
    useIntegration,
    useIntegrations,
    useUpdateIntegration,
} from "@/lib/supabase/hooks-core";
import { INTEGRATIONS_PAGE } from "@/config/list-page-configs";

export default function IntegrationsPage() {
    const { data: rawData, isLoading } = useProviderConnections();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const { data: _integrations } = useIntegrations();
    const { data: _detail } = useIntegration("");
    const _create = useCreateIntegration();
    const _update = useUpdateIntegration();

    return <ListPageShell config={INTEGRATIONS_PAGE} data={data} isLoading={isLoading} />;
}
