import { QualityCheckTemplatesDetailClient } from "./_client";

export default async function QualityCheckTemplatesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <QualityCheckTemplatesDetailClient id={id} />;
}
