import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ExpenseDetailClient } from "./_client";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("expense", id);
    return <ExpenseDetailClient id={id} initialRecord={record} />;
}
