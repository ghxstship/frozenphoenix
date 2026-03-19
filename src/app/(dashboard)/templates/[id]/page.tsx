import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { TemplateDetailClient } from "./_client";

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("project_template", id);
    return <TemplateDetailClient id={id} initialRecord={record} />;
}
