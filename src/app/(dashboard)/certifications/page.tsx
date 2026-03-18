"use client";

import { ListPageShell } from "@/components/shells";
import { useCertifications } from "@/lib/supabase";
import { CERTIFICATIONS_PAGE } from "@/config/list-page-configs";
import {
    useCreateCertification,
    useCreateHrCertification,
    useCreateUserCertification,
    useDeleteUserCertification,
    useUpdateHrCertification,
    useUpdateUserCertification,
} from "@/lib/supabase/hooks-workforce";

export default function CertificationsPage() {
    const { data: rawData, isLoading } = useCertifications();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateCertification();
    const _createHr = useCreateHrCertification();
    const _updateHr = useUpdateHrCertification();
    const _createUser = useCreateUserCertification();
    const _updateUser = useUpdateUserCertification();
    const _deleteUser = useDeleteUserCertification();

    return <ListPageShell config={CERTIFICATIONS_PAGE} data={data} isLoading={isLoading} />;
}
