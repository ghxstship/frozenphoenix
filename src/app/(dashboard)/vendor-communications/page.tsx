"use client";

import { ListPageShell } from "@/components/shells";
import { VENDOR_COMMUNICATIONS_PAGE } from "@/config/list-page-configs";
import {
    useCreateVendorCommunication,
    useVendorCommunication,
    useVendorCommunications,
} from "@/lib/supabase/hooks-admin";

export default function Page() {
    const { data: _items } = useVendorCommunications();
    const { data: _detail } = useVendorCommunication("");
    const _create = useCreateVendorCommunication();
    return <ListPageShell config={VENDOR_COMMUNICATIONS_PAGE} />;
}
