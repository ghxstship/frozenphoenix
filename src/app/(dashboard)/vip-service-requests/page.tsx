"use client";

import { ListPageShell } from "@/components/shells";
import { VIP_SERVICE_REQUESTS_PAGE } from "@/config/list-page-configs";

export default function VipServiceRequestsPage() {
    return <ListPageShell config={VIP_SERVICE_REQUESTS_PAGE} />;
}
