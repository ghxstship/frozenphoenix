import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ServiceRequestDetailClient } from "./_client";

export default async function ServiceRequestDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("service-requests", id);
    return <ServiceRequestDetailClient id={id} initialRecord={initialRecord} />;
}
