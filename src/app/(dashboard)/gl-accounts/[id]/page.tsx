import { GlAccountsDetailClient } from "./_client";

export default async function GlAccountsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <GlAccountsDetailClient id={id} initialRecord={null} />;
}
