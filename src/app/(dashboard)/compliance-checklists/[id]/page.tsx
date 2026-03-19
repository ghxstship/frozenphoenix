import { ComplianceChecklistDetailClient } from "./_client";

export default async function ComplianceChecklistDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ComplianceChecklistDetailClient id={id} initialRecord={null} />;
}
