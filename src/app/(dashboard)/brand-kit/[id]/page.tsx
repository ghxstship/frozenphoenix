import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { BrandKitDetailClient } from "./_client";

export default async function BrandKitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("brand_kit", id);
    return <BrandKitDetailClient id={id} initialRecord={record} />;
}
