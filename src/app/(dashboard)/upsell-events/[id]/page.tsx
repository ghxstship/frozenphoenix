import { UpsellEventsDetailClient } from "./_client";

export default async function UpsellEventsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <UpsellEventsDetailClient id={id} />;
}
