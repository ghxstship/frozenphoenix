"use client";

import { ListPageShell } from "@/components/shells";
import { SPACE_BOOKINGS_PAGE } from "@/config/list-page-configs";
import {
    useCreateSpaceBooking,
    useDeleteSpaceBooking,
    useSpaceBooking,
    useSpaceBookings,
    useUpdateSpaceBooking,
} from "@/lib/supabase/hooks-assets-inventory";

export default function SpaceBookingsPage() {
    const { data: _items } = useSpaceBookings();
    const { data: _detail } = useSpaceBooking("");
    const _create = useCreateSpaceBooking();
    const _update = useUpdateSpaceBooking();
    const _delete = useDeleteSpaceBooking();
    return <ListPageShell config={SPACE_BOOKINGS_PAGE} />;
}
