import { EngineeringApprovalsDetailClient } from "./_client";

export default async function EngineeringApprovalsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <EngineeringApprovalsDetailClient id={id} />;
}
