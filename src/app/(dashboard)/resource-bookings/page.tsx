"use client";

import { ListPageShell } from "@/components/shells";
import { RESOURCE_BOOKINGS_PAGE } from "@/config/list-page-configs";
import { useDeleteResourceBooking } from "@/lib/supabase/hooks-workforce";

export default function ResourceBookingsPage() {
    const _delete = useDeleteResourceBooking();
    return <ListPageShell config={RESOURCE_BOOKINGS_PAGE} />;
}
