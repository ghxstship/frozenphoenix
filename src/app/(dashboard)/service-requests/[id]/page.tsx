import { ServiceRequestDetailClient } from "./_client";

export default async function ServiceRequestDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ServiceRequestDetailClient id={id} initialRecord={null} />;
}
