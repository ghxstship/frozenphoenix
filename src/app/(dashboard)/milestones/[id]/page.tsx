import { MilestonesDetailClient } from "./_client";

export default async function MilestonesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <MilestonesDetailClient id={id} initialRecord={null} />;
}
