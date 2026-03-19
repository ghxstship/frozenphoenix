import { CrewAvailabilityDetailClient } from "./_client";

export default async function CrewAvailabilityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CrewAvailabilityDetailClient id={id} />;
}
