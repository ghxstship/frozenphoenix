import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { PersonDetailClient } from "./_client";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("people", id);
    return <PersonDetailClient id={id} initialRecord={initialRecord} />;
}
