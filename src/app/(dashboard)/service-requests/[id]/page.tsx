import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ServiceRequestDetailClient } from "./_client";

export default async function ServiceRequestDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("service_request", id);
    return <ServiceRequestDetailClient id={id} initialRecord={record} />;
}
