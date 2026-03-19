import { UserManagementDetailClient } from "./_client";

export default async function UserManagementDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <UserManagementDetailClient id={id} />;
}
