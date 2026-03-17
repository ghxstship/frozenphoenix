"use client";

import { ListPageShell } from "@/components/shells";
import { useCertifications } from "@/lib/supabase";
import { CERTIFICATIONS_PAGE } from "@/config/list-page-configs";

export default function CertificationsPage() {
    const { data: rawData, isLoading } = useCertifications();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={CERTIFICATIONS_PAGE} data={data} isLoading={isLoading} />;
}
