import { TemplateDetailClient } from "./_client";

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <TemplateDetailClient id={id} initialRecord={null} />;
}
