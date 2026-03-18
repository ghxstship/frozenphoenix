"use client";

import { ListPageShell } from "@/components/shells";
import { useIpRights } from "@/lib/supabase";
import { IP_RIGHTS_PAGE } from "@/config/list-page-configs";
import {
    useCreateIpRight,
    useCreateRightsLicense,
    useDeleteIpRight,
    useDeleteRightsLicense,
    useRightsLicense,
    useRightsLicenses,
    useUpdateIpRight,
    useUpdateRightsLicense,
} from "@/lib/supabase/hooks-legal";

export default function IPRightsPage() {
    const { data: rawData, isLoading } = useIpRights();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateIpRight();
    const _update = useUpdateIpRight();
    const _delete = useDeleteIpRight();
    const { data: _licenses } = useRightsLicenses();
    const { data: _licenseDetail } = useRightsLicense("");
    const _createLicense = useCreateRightsLicense();
    const _updateLicense = useUpdateRightsLicense();
    const _deleteLicense = useDeleteRightsLicense();

    return <ListPageShell config={IP_RIGHTS_PAGE} data={data} isLoading={isLoading} />;
}
