import { QualityChecksDetailClient } from "./_client";

export default async function QualityChecksDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <QualityChecksDetailClient id={id} />;
}
