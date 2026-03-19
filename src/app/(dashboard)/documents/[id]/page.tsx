import { DocumentDetailClient } from "./_client";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DocumentDetailClient id={id} initialRecord={null} />;
}
