import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TestimonialsDetailClient } from "./_client";

export default async function TestimonialsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("testimonials", id);
    return <TestimonialsDetailClient id={id} initialRecord={initialRecord} />;
}
