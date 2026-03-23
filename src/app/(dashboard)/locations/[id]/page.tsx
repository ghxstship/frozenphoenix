import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { LocationDetailClient } from "./_client";

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("locations", id);
    return <LocationDetailClient id={id} initialRecord={initialRecord} />;
}
