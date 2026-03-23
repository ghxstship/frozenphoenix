import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { UserManagementDetailClient } from "./_client";

export default async function UserManagementDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("user_profiles", id);
    return <UserManagementDetailClient id={id} initialRecord={initialRecord} />;
}
