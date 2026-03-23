import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { BrandKitDetailClient } from "./_client";

export default async function BrandKitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("brand-kit", id);
    return <BrandKitDetailClient id={id} initialRecord={initialRecord} />;
}
