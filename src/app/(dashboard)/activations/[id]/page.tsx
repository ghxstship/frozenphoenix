import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ActivationDetailClient } from "./_client";

export default async function ActivationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("activation", id);
    return <ActivationDetailClient id={id} initialRecord={record} />;
}
