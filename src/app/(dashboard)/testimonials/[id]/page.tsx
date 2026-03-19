import { TestimonialsDetailClient } from "./_client";

export default async function TestimonialsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <TestimonialsDetailClient id={id} />;
}
