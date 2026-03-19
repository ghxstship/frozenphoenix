import { AccountDetailClient } from "./_client";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <AccountDetailClient id={id} initialRecord={null} />;
}
