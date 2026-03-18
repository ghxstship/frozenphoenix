"use client";

import { ListPageShell } from "@/components/shells";
import { VIP_SERVICE_REQUESTS_PAGE } from "@/config/list-page-configs";
import {
    useCreateVipGuest,
    useCreateVipServiceRequest,
    useUpdateVipGuest,
    useUpdateVipServiceRequest,
    useVipServiceRequest,
    useVipServiceRequests,
} from "@/lib/supabase/hooks-live-ops";

export default function VipServiceRequestsPage() {
    const _createVip = useCreateVipGuest();
    const _updateVip = useUpdateVipGuest();
    const { data: _requests } = useVipServiceRequests();
    const { data: _request } = useVipServiceRequest("");
    const _createRequest = useCreateVipServiceRequest();
    const _updateRequest = useUpdateVipServiceRequest();
    return <ListPageShell config={VIP_SERVICE_REQUESTS_PAGE} />;
}
