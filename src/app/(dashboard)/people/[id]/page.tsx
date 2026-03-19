import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { PersonDetailClient } from "./_client";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("person", id);
    return <PersonDetailClient id={id} initialRecord={record} />;
}
