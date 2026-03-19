import { StakeholdersDetailClient } from "./_client";

export default async function StakeholdersDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <StakeholdersDetailClient id={id} />;
}
