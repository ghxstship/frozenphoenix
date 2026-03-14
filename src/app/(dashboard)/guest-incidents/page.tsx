"use client";

import { ListPageShell } from "@/components/shells";
import { GUEST_INCIDENTS_PAGE } from "@/config/list-page-configs";

export default function GuestIncidentsPage() {
    return <ListPageShell config={GUEST_INCIDENTS_PAGE} />;
}
