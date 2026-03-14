"use client";

import { ListPageShell } from "@/components/shells";
import { RESOURCE_BOOKINGS_PAGE } from "@/config/list-page-configs";

export default function ResourceBookingsPage() {
    return <ListPageShell config={RESOURCE_BOOKINGS_PAGE} />;
}
