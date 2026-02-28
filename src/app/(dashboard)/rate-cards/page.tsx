"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
    CreditCard, Plus, Copy, Pencil,
    DollarSign, Users, Loader2,
} from "lucide-react";
import { useRateCards, isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

interface RateCardItem {
    id: string;
    role: string;
    rate: number;
    unit: string;
    costRate: number;
}

interface RateCard {
    id: string;
    name: string;
    description: string;
    currency: string;
    isDefault: boolean;
    clientCount: number;
    items: RateCardItem[];
    updatedAt: string;
}

const mockRateCards: RateCard[] = [
    {
        id: "1", name: "Standard Rate Card", description: "Default rates for all new clients", currency: "USD", isDefault: true, clientCount: 12, updatedAt: "2026-02-15",
        items: [
            { id: "a1", role: "Creative Director", rate: 225, unit: "hour", costRate: 95 },
            { id: "a2", role: "Senior Producer", rate: 185, unit: "hour", costRate: 80 },
            { id: "a3", role: "Production Manager", rate: 150, unit: "hour", costRate: 65 },
            { id: "a4", role: "Technical Director", rate: 200, unit: "hour", costRate: 90 },
            { id: "a5", role: "Junior Designer", rate: 95, unit: "hour", costRate: 40 },
            { id: "a6", role: "Project Coordinator", rate: 110, unit: "hour", costRate: 45 },
        ],
    },
    {
        id: "2", name: "Nike Preferred Rates", description: "Negotiated rates for Nike account", currency: "USD", isDefault: false, clientCount: 1, updatedAt: "2026-01-20",
        items: [
            { id: "b1", role: "Creative Director", rate: 200, unit: "hour", costRate: 95 },
            { id: "b2", role: "Senior Producer", rate: 170, unit: "hour", costRate: 80 },
            { id: "b3", role: "Production Manager", rate: 140, unit: "hour", costRate: 65 },
            { id: "b4", role: "Technical Director", rate: 185, unit: "hour", costRate: 90 },
        ],
    },
    {
        id: "3", name: "Retainer Rates", description: "Discounted rates for retainer clients", currency: "USD", isDefault: false, clientCount: 4, updatedAt: "2026-02-01",
        items: [
            { id: "c1", role: "Creative Director", rate: 195, unit: "hour", costRate: 95 },
            { id: "c2", role: "Senior Producer", rate: 160, unit: "hour", costRate: 80 },
            { id: "c3", role: "Production Manager", rate: 130, unit: "hour", costRate: 65 },
        ],
    },
];

export default function RateCardsPage() {
    const [search, setSearch] = useState("");
    const [expandedCard, setExpandedCard] = useState<string | null>("1");

    const { data: sbCards, isLoading } = useRateCards();

    const rateCards: RateCard[] = isSupabaseConfigured && sbCards
        ? sbCards.map((rc: Record<string, unknown>) => ({
            id: (rc.id as string) ?? "",
            name: (rc.name as string) ?? "",
            description: (rc.description as string) ?? "",
            currency: (rc.currency as string) ?? "USD",
            isDefault: (rc.is_default as boolean) ?? false,
            clientCount: (rc.client_count as number) ?? 0,
            items: (rc.items as RateCardItem[]) ?? [],
            updatedAt: (rc.updated_at as string) ?? "",
        }))
        : mockRateCards;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = rateCards.filter((rc) =>
        !search || rc.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PermissionGate resource="rate_cards" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Rate Cards" description="Manage billing rates by role for different clients and scenarios">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Rate Card
                </Button>
            </PageHeader>

            {/* Search */}
            <div className="flex items-center gap-4">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search rate cards..." className="flex-1 max-w-sm" />
                <span className="text-sm text-muted-foreground">{filtered.length} rate card{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Rate Cards */}
            <div className="space-y-4">
                {filtered.map((rc) => {
                    const isExpanded = expandedCard === rc.id;
                    const avgRate = rc.items.reduce((s, i) => s + i.rate, 0) / rc.items.length;
                    const avgMargin = rc.items.reduce((s, i) => s + ((i.rate - i.costRate) / i.rate) * 100, 0) / rc.items.length;

                    return (
                        <Card key={rc.id} className="overflow-hidden">
                            <CardHeader
                                className="cursor-pointer hover:bg-secondary/30 transition-colors"
                                onClick={() => setExpandedCard(isExpanded ? null : rc.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base">{rc.name}</CardTitle>
                                                {rc.isDefault && <Badge variant="info" className="text-[10px]">Default</Badge>}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{rc.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <DollarSign className="h-3 w-3" />
                                                Avg {formatCurrency(avgRate)}/hr
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Users className="h-3 w-3" />
                                                {rc.clientCount} client{rc.clientCount !== 1 ? "s" : ""}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Copy className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            {isExpanded && (
                                <CardContent className="pt-0">
                                    <div className="border-t pt-4">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-xs text-muted-foreground border-b">
                                                    <th className="text-left pb-2 font-medium">Role</th>
                                                    <th className="text-right pb-2 font-medium">Bill Rate</th>
                                                    <th className="text-right pb-2 font-medium">Cost Rate</th>
                                                    <th className="text-right pb-2 font-medium">Margin</th>
                                                    <th className="text-right pb-2 font-medium">Unit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rc.items.map((item) => {
                                                    const margin = ((item.rate - item.costRate) / item.rate) * 100;
                                                    return (
                                                        <tr key={item.id} className="border-b last:border-0 hover:bg-secondary/30">
                                                            <td className="py-2.5 font-medium">{item.role}</td>
                                                            <td className="py-2.5 text-right font-semibold">{formatCurrency(item.rate)}</td>
                                                            <td className="py-2.5 text-right text-muted-foreground">{formatCurrency(item.costRate)}</td>
                                                            <td className="py-2.5 text-right">
                                                                <span className={margin >= 50 ? "text-success font-medium" : margin >= 30 ? "text-warning" : "text-destructive"}>
                                                                    {Math.round(margin)}%
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 text-right text-muted-foreground">/{item.unit}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot>
                                                <tr className="font-semibold bg-muted/30">
                                                    <td className="py-2.5">Average</td>
                                                    <td className="py-2.5 text-right">{formatCurrency(avgRate)}</td>
                                                    <td className="py-2.5 text-right text-muted-foreground">
                                                        {formatCurrency(rc.items.reduce((s, i) => s + i.costRate, 0) / rc.items.length)}
                                                    </td>
                                                    <td className="py-2.5 text-right">{Math.round(avgMargin)}%</td>
                                                    <td />
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
        </PermissionGate>
    );
}
