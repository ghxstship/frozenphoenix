import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { BomsDetailClient } from "./_client";

export default async function BomsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("boms", id);
    return <BomsDetailClient id={id} initialRecord={initialRecord} />;
}
