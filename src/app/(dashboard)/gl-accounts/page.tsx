"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CircleDollarSign, Plus,
} from "lucide-react";
import { MOCK_GL_ACCOUNTS } from "@/lib/mock-data-governance";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
    asset: "Asset", liability: "Liability", equity: "Equity",
    revenue: "Revenue", expense: "Expense",
};

const ACCOUNT_TYPE_VARIANTS: Record<string, string> = {
    asset: "info", liability: "warning", equity: "secondary",
    revenue: "success", expense: "destructive",
};

export default function GLAccountsPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const accounts = MOCK_GL_ACCOUNTS;

    const filtered = accounts.filter(a => {
        const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search);
        const matchesType = typeFilter === "all" || a.account_type === typeFilter;
        return matchesSearch && matchesType;
    });

    const revenueAccounts = accounts.filter(a => a.account_type === "revenue").length;
    const expenseAccounts = accounts.filter(a => a.account_type === "expense").length;
    const assetAccounts = accounts.filter(a => a.account_type === "asset").length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="GL Accounts" description="Chart of accounts for financial reporting — maps budgets, expenses, invoices, and payments to GL codes">
                <Button size="sm"><Plus className="h-4 w-4" /> Add Account</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Accounts" value={accounts.length} icon={CircleDollarSign} />
                <StatCard title="Revenue" value={revenueAccounts} icon={CircleDollarSign} />
                <StatCard title="Expense" value={expenseAccounts} icon={CircleDollarSign} />
                <StatCard title="Asset" value={assetAccounts} icon={CircleDollarSign} />
            </div>

            <div className="flex items-center gap-3">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search by name or code..." className="flex-1 max-w-sm" />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">All Types</option>
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="equity">Equity</option>
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><CircleDollarSign className="h-4 w-4" /> Chart of Accounts ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left p-3 font-medium">Code</th>
                                    <th className="text-left p-3 font-medium">Name</th>
                                    <th className="text-left p-3 font-medium">Type</th>
                                    <th className="text-left p-3 font-medium">CapEx / OpEx</th>
                                    <th className="text-left p-3 font-medium">Department</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(a => (
                                    <tr key={a.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                                        <td className="p-3 font-mono font-medium">{a.code}</td>
                                        <td className="p-3">
                                            <div className="font-medium">{a.name}</div>
                                            {a.description && <div className="text-xs text-muted-foreground">{a.description}</div>}
                                        </td>
                                        <td className="p-3">
                                            <Badge variant={(ACCOUNT_TYPE_VARIANTS[a.account_type] || "ghost") as "info" | "warning" | "secondary" | "success" | "destructive"} className="text-[10px]">
                                                {ACCOUNT_TYPE_LABELS[a.account_type]}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-xs">{a.capex_opex ? a.capex_opex.toUpperCase() : "—"}</td>
                                        <td className="p-3 text-xs text-muted-foreground">{a.department || "—"}</td>
                                        <td className="p-3">
                                            <Badge variant={a.is_active ? "success" : "ghost"} className="text-[10px]">
                                                {a.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
