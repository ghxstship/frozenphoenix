import { BudgetDetailClient } from "./_client";

export default async function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BudgetDetailClient id={id} initialRecord={null} />;
}
