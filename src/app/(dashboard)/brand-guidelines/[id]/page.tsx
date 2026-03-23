import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { BrandGuidelineDetailClient } from "./_client";

export default async function BrandGuidelineDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("brand-guidelines", id);
    return <BrandGuidelineDetailClient id={id} initialRecord={initialRecord} />;
}
