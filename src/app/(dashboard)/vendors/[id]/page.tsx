import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { VendorDetailClient } from "./_client";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("vendor", id);
    return <VendorDetailClient id={id} initialRecord={record} />;
}
