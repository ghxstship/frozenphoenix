import { ResilienceTargetsDetailClient } from "./_client";

export default async function ResilienceTargetsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ResilienceTargetsDetailClient id={id} />;
}
