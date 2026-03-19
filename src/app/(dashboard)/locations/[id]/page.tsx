import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { LocationDetailClient } from "./_client";

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("location", id);
    return <LocationDetailClient id={id} initialRecord={record} />;
}
