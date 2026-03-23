import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { VaultDetailClient } from "./_client";

export default async function VaultDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("vault_documents", id);
    return <VaultDetailClient id={id} initialRecord={initialRecord} />;
}
