import { ExpenseDetailClient } from "./_client";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ExpenseDetailClient id={id} initialRecord={null} />;
}
