"use client";

import { ListPageShell } from "@/components/shells";
import { SPACE_BOOKINGS_PAGE } from "@/config/list-page-configs";

export default function SpaceBookingsPage() {
    return <ListPageShell config={SPACE_BOOKINGS_PAGE} />;
}
