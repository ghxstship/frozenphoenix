import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ClauseLibraryDetailClient } from "./_client";

export default async function ClauseLibraryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("contract_clauses", id);
    return <ClauseLibraryDetailClient id={id} initialRecord={initialRecord} />;
}
