import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { PermitDetailClient } from "./_client";

export default async function PermitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("permits", id);
    return <PermitDetailClient id={id} initialRecord={initialRecord} />;
}
