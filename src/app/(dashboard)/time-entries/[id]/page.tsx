import { TimeEntriesDetailClient } from "./_client";

export default async function TimeEntriesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <TimeEntriesDetailClient id={id} />;
}
