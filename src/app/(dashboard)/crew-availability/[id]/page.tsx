import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { CrewAvailabilityDetailClient } from "./_client";

export default async function CrewAvailabilityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("crew_availability", id);
    return <CrewAvailabilityDetailClient id={id} initialRecord={initialRecord} />;
}
