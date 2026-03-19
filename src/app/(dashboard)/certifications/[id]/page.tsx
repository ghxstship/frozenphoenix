import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { CertificationDetailClient } from "./_client";

export default async function CertificationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("certification", id);
    return <CertificationDetailClient id={id} initialRecord={record} />;
}
