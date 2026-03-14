"use client";

import { ListPageShell } from "@/components/shells";
import { PROVIDER_CONNECTIONS_PAGE } from "@/config/list-page-configs";

export default function ProviderConnectionsPage() {
    return <ListPageShell config={PROVIDER_CONNECTIONS_PAGE} />;
}
