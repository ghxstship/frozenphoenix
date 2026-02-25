"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
    RefreshCw, Plus, DollarSign,
    Calendar, Pause, Play,
} from "lucide-react";

type RecurringStatus = "active" | "paused" | "completed" | "cancelled";
type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";

interface RecurringInvoice {
    id: string;
    title: string;
    client: string;
    project: string;
    amount: number;
    frequency: Frequency;
    status: RecurringStatus;
    nextDate: string;
    lastGenerated: string | null;
    totalGenerated: number;
    totalCollected: number;
    occurrencesLeft: number | null;
}


const FREQ_LABELS: Record<Frequency, string> = {
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    annually: "Annually",
};

const mockRecurring: RecurringInvoice[] = [
    { id: "1", title: "Nike Monthly Retainer", client: "Nike", project: "Nike Air Max Launch", amount: 25000, frequency: "monthly", status: "active", nextDate: "2026-03-01", lastGenerated: "2026-02-01", totalGenerated: 3, totalCollected: 50000, occurrencesLeft: 9 },
    { id: "2", title: "Red Bull T&M Billing", client: "Red Bull", project: "Red Bull Festival", amount: 80000, frequency: "monthly", status: "active", nextDate: "2026-03-01", lastGenerated: "2026-02-01", totalGenerated: 2, totalCollected: 80000, occurrencesLeft: 4 },
    { id: "3", title: "TechStart Retainer", client: "TechStart", project: "TechStart Launch", amount: 15000, frequency: "monthly", status: "paused", nextDate: "2026-04-01", lastGenerated: "2026-01-01", totalGenerated: 1, totalCollected: 15000, occurrencesLeft: null },
    { id: "4", title: "Glossier Quarterly Review", client: "Glossier", project: "Glossier Pop-Up", amount: 5000, frequency: "quarterly", status: "completed", nextDate: "", lastGenerated: "2026-01-01", totalGenerated: 4, totalCollected: 20000, occurrencesLeft: 0 },
];

export default function RecurringInvoicesPage() {
    const [search, setSearch] = useState("");

    const filtered = mockRecurring.filter((r) =>
        !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.client.toLowerCase().includes(search.toLowerCase())
    );

    const monthlyRecurring = mockRecurring.filter((r) => r.status === "active").reduce((s, r) => {
        const multiplier = r.frequency === "weekly" ? 4.33 : r.frequency === "biweekly" ? 2.17 : r.frequency === "monthly" ? 1 : r.frequency === "quarterly" ? 0.33 : 0.083;
        return s + r.amount * multiplier;
    }, 0);
    const totalCollected = mockRecurring.reduce((s, r) => s + r.totalCollected, 0);
    const activeCount = mockRecurring.filter((r) => r.status === "active").length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Recurring Invoices" description="Automate invoice generation on a schedule">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Recurring Invoice
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Monthly Recurring" value={formatCurrency(monthlyRecurring)} description="estimated monthly value" icon={RefreshCw} />
                <StatCard title="Total Collected" value={formatCurrency(totalCollected)} description="all time" icon={DollarSign} change={12} />
                <StatCard title="Active Schedules" value={activeCount} description="generating invoices" icon={Calendar} />
            </div>

            <div className="flex items-center gap-4">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search recurring invoices..." className="flex-1 max-w-sm" />
            </div>

            <div className="space-y-3">
                {filtered.map((r) => (
                    <Card key={r.id} className="hover:bg-secondary/30 transition-colors cursor-pointer">
                        <CardContent className="py-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold">{r.title}</p>
                                        <StatusBadge status={r.status} className="text-[10px]" />
                                        <Badge variant="ghost" className="text-[10px]">{FREQ_LABELS[r.frequency]}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{r.client} · {r.project}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        {r.nextDate && <span>Next: <strong className="text-foreground">{r.nextDate}</strong></span>}
                                        <span>Generated: <strong className="text-foreground">{r.totalGenerated}</strong> invoices</span>
                                        {r.occurrencesLeft !== null && r.occurrencesLeft > 0 && (
                                            <span>{r.occurrencesLeft} remaining</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{formatCurrency(r.amount)}</p>
                                        <p className="text-[10px] text-muted-foreground">per {r.frequency === "monthly" ? "month" : r.frequency}</p>
                                    </div>
                                    {r.status === "active" && (
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Pause">
                                            <Pause className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {r.status === "paused" && (
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Resume">
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
