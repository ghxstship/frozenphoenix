import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { SopsDetailClient } from "./_client";

export default async function SopsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("sops", id);
    return <SopsDetailClient id={id} initialRecord={initialRecord} />;
}
