"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layouts/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusBgColor, getStatusLabel } from "@/config/ui-variants";
import { EmptyState } from "@/components/layouts/empty-state";
import { useLeadPipelineStats, useLeads } from "@/lib/supabase/hooks-crm";
import { isSupabaseConfigured } from "@/lib/supabase/hooks";
import { formatRelativeTime } from "@/lib/utils";
import {
    Building2,
    ChevronRight,
    Clock,
    DollarSign,
    Loader2,
    Mail,
    Phone,
    Plus,
    TrendingUp,
    Users,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

const BUDGET_LABELS: Record<string, string> = {
    under_50k: "Under $50K",
    "50k_150k": "$50K - $150K",
    "150k_500k": "$150K - $500K",
    "500k_1m": "$500K - $1M",
    "1m_5m": "$1M - $5M",
    over_5m: "$5M+",
};

const DEMO_LEADS = [
    {
        id: "lead-1",
        first_name: "Sarah",
        last_name: "Mitchell",
        email: "sarah@techcorp.com",
        phone: "+1 (555) 123-4567",
        company: "TechCorp Global",
        job_title: "VP of Marketing",
        project_type: "brand_activation",
        budget_range: "500k_1m",
        status: "qualified",
        score: 85,
        source: "website",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        last_contacted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "lead-2",
        first_name: "Marcus",
        last_name: "Chen",
        email: "mchen@festivalprod.com",
        phone: "+1 (555) 987-6543",
        company: "Festival Productions Inc",
        job_title: "Event Director",
        project_type: "festival_production",
        budget_range: "1m_5m",
        status: "new",
        score: 72,
        source: "referral",
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        last_contacted_at: null,
    },
    {
        id: "lead-3",
        first_name: "Jennifer",
        last_name: "Walsh",
        email: "jwalsh@luxuryauto.com",
        phone: null,
        company: "Luxury Auto Group",
        job_title: "Brand Manager",
        project_type: "immersive_installation",
        budget_range: "150k_500k",
        status: "proposal_sent",
        score: 68,
        source: "trade_show",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        last_contacted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

export default function LeadsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbLeads, isLoading } = useLeads(
        statusFilter !== "all" ? statusFilter : undefined
    );
    const { data: pipelineStats } = useLeadPipelineStats();

    const leads = isSupabaseConfigured && sbLeads ? sbLeads : DEMO_LEADS;

    const filteredLeads = leads.filter((lead) => {
        const fullName = `${lead.first_name} ${lead.last_name || ""}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchQuery.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statuses = ["all", "new", "contacted", "qualified", "proposal_sent", "won", "lost"];

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === "new").length;
    const qualifiedLeads = leads.filter(
        (l) => l.status === "qualified" || l.status === "proposal_sent"
    ).length;
    const avgScore =
        leads.length > 0
            ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length)
            : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="leads" action="read">
            <PageShell
                title="Leads"
                description="Manage incoming leads and opportunities"
                actions={
                    <Link href="/leads/new">
                        <Button>
                            <Plus className="h-4 w-4" />
                            Add Lead
                        </Button>
                    </Link>
                }
            >
                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search leads..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-2">
                        {statuses.map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                            >
                                {status === "all" ? "All" : getStatusLabel(status)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard title="Total Leads" value={totalLeads} icon={Users} />
                    <StatCard
                        title="New (Uncontacted)"
                        value={newLeads}
                        icon={Clock}
                        className={newLeads > 0 ? "border-info/50 bg-info/5" : ""}
                    />
                    <StatCard title="Qualified" value={qualifiedLeads} icon={TrendingUp} />
                    <StatCard title="Avg. Lead Score" value={avgScore} icon={DollarSign} />
                </div>

                {/* Pipeline Stats */}
                {pipelineStats && pipelineStats.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-base">Pipeline Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                {pipelineStats.map((stat) => {
                                    return (
                                        <div
                                            key={stat.status}
                                            className="flex-1 p-3 rounded-lg bg-secondary/30"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div
                                                    className={`h-2 w-2 rounded-full ${stat.status ? getStatusBgColor(stat.status) : "bg-muted"}`}
                                                />
                                                <span className="text-xs font-medium">
                                                    {stat.status
                                                        ? getStatusLabel(stat.status)
                                                        : "Unknown"}
                                                </span>
                                            </div>
                                            <p className="text-xl font-bold">{stat.count}</p>
                                            {(stat.new_this_week ?? 0) > 0 && (
                                                <p className="text-[10px] text-muted-foreground">
                                                    +{stat.new_this_week} this week
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Leads List */}
                {filteredLeads.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No leads found"
                        description={
                            searchQuery
                                ? "Try adjusting your search"
                                : "No leads have been captured yet"
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredLeads.map((lead) => {
                            const budgetLabel = lead.budget_range
                                ? BUDGET_LABELS[lead.budget_range]
                                : null;

                            return (
                                <Link key={lead.id} href={`/leads/${lead.id}`}>
                                    <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                                        <CardContent className="flex items-center gap-4 py-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-lg font-bold text-primary">
                                                    {lead.first_name[0]}
                                                    {lead.last_name?.[0] || ""}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">
                                                        {lead.first_name} {lead.last_name}
                                                    </h3>
                                                    <StatusBadge
                                                        status={lead.status || "new"}
                                                        className="text-[10px]"
                                                    />
                                                    {(lead.score ?? 0) >= 70 && (
                                                        <Badge
                                                            variant="success"
                                                            className="text-[10px]"
                                                        >
                                                            Hot Lead
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    {lead.company && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            {lead.company}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {lead.email}
                                                    </span>
                                                    {lead.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {lead.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm">
                                                {budgetLabel && (
                                                    <div className="text-center">
                                                        <p className="text-muted-foreground text-xs">
                                                            Budget
                                                        </p>
                                                        <p className="font-medium">{budgetLabel}</p>
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">
                                                        Score
                                                    </p>
                                                    <p
                                                        className={`font-medium ${(lead.score ?? 0) >= 70 ? "text-success" : (lead.score ?? 0) >= 40 ? "text-warning" : ""}`}
                                                    >
                                                        {lead.score}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">
                                                        Created
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatRelativeTime(lead.created_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </PageShell>
        </PermissionGate>
    );
}
