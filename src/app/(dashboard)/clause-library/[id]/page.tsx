import { ClauseLibraryDetailClient } from "./_client";

export default async function ClauseLibraryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ClauseLibraryDetailClient id={id} />;
}
