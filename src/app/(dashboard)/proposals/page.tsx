"use client";

import { useState } from "react";
import {
    FileText,
    Plus,
    Send,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Building2,
    Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { BadgeVariant } from "@/config/ui-variants";

type ProposalStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";

interface Proposal {
    id: string;
    number: string;
    title: string;
    companyName: string;
    contactName: string;
    total: number;
    currency: string;
    status: ProposalStatus;
    validUntil: string;
    sentAt?: string;
    viewedAt?: string;
    createdAt: string;
    version: number;
}

const mockProposals: Proposal[] = [
    {
        id: "1",
        number: "PROP-2026-0001",
        title: "Nike Air Max Launch Experience",
        companyName: "Nike",
        contactName: "John Smith",
        total: 485000,
        currency: "USD",
        status: "accepted",
        validUntil: "2026-03-15",
        sentAt: "2026-02-10",
        viewedAt: "2026-02-11",
        createdAt: "2026-02-08",
        version: 2,
    },
    {
        id: "2",
        number: "PROP-2026-0002",
        title: "Red Bull Festival Activation",
        companyName: "Red Bull",
        contactName: "Maria Garcia",
        total: 320000,
        currency: "USD",
        status: "viewed",
        validUntil: "2026-03-20",
        sentAt: "2026-02-18",
        viewedAt: "2026-02-19",
        createdAt: "2026-02-15",
        version: 1,
    },
    {
        id: "3",
        number: "PROP-2026-0003",
        title: "Coachella Brand Experience",
        companyName: "Coachella Valley Music",
        contactName: "Alex Johnson",
        total: 750000,
        currency: "USD",
        status: "sent",
        validUntil: "2026-03-25",
        sentAt: "2026-02-22",
        createdAt: "2026-02-20",
        version: 1,
    },
    {
        id: "4",
        number: "PROP-2026-0004",
        title: "TechStart Product Launch",
        companyName: "TechStart Inc",
        contactName: "Sam Wilson",
        total: 125000,
        currency: "USD",
        status: "draft",
        validUntil: "2026-04-01",
        createdAt: "2026-02-24",
        version: 1,
    },
    {
        id: "5",
        number: "PROP-2026-0005",
        title: "Momentum Agency Partnership",
        companyName: "Momentum Worldwide",
        contactName: "Chris Lee",
        total: 95000,
        currency: "USD",
        status: "rejected",
        validUntil: "2026-02-28",
        sentAt: "2026-02-01",
        viewedAt: "2026-02-02",
        createdAt: "2026-01-28",
        version: 1,
    },
];

const statusConfig: Record<ProposalStatus, { label: string; variant: BadgeVariant; icon: React.ElementType }> = {
    draft: { label: "Draft", variant: "ghost", icon: FileText },
    sent: { label: "Sent", variant: "info", icon: Send },
    viewed: { label: "Viewed", variant: "default", icon: Eye },
    accepted: { label: "Accepted", variant: "success", icon: CheckCircle },
    rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
    expired: { label: "Expired", variant: "warning", icon: Clock },
};

export default function ProposalsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filteredProposals = mockProposals.filter((proposal) => {
        const matchesSearch =
            proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proposal.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proposal.number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: mockProposals.length,
        totalValue: mockProposals.reduce((sum, p) => sum + p.total, 0),
        accepted: mockProposals.filter((p) => p.status === "accepted").length,
        acceptedValue: mockProposals.filter((p) => p.status === "accepted").reduce((sum, p) => sum + p.total, 0),
        pending: mockProposals.filter((p) => ["sent", "viewed"].includes(p.status)).length,
        pendingValue: mockProposals.filter((p) => ["sent", "viewed"].includes(p.status)).reduce((sum, p) => sum + p.total, 0),
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
                    <p className="text-muted-foreground">
                        Create and manage client proposals and quotes
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Proposal
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Proposals" value={stats.total} icon={FileText} description={`${formatCurrency(stats.totalValue)} total value`} />
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                        <CheckCircle className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success">{stats.accepted}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(stats.acceptedValue)} won
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-info" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-info">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(stats.pendingValue)} in pipeline
                        </p>
                    </CardContent>
                </Card>
                <StatCard title="Win Rate" value={`${stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%`} icon={DollarSign} description="conversion rate" />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search proposals..." className="flex-1 max-w-sm" />
                <div className="flex gap-2">
                    {["all", "draft", "sent", "viewed", "accepted", "rejected"].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === "all" ? "All" : statusConfig[status as ProposalStatus]?.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Proposals List */}
            <div className="grid gap-4">
                {filteredProposals.map((proposal) => {
                    const StatusIcon = statusConfig[proposal.status].icon;
                    return (
                        <Card key={proposal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-mono text-muted-foreground">
                                                {proposal.number}
                                            </span>
                                            <Badge variant={statusConfig[proposal.status].variant}>
                                                <StatusIcon className="mr-1 h-3 w-3" />
                                                {statusConfig[proposal.status].label}
                                            </Badge>
                                            {proposal.version > 1 && (
                                                <Badge variant="outline">v{proposal.version}</Badge>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold mb-1">{proposal.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Building2 className="h-4 w-4" />
                                                {proposal.companyName}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Valid until {formatDate(proposal.validUntil)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">
                                            {formatCurrency(proposal.total, proposal.currency)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Created {formatDate(proposal.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Timeline */}
                                <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            proposal.sentAt ? "bg-info" : "bg-muted"
                                        )} />
                                        <span className={proposal.sentAt ? "text-foreground" : "text-muted-foreground"}>
                                            {proposal.sentAt ? `Sent ${formatDate(proposal.sentAt)}` : "Not sent"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            proposal.viewedAt ? "bg-primary" : "bg-muted"
                                        )} />
                                        <span className={proposal.viewedAt ? "text-foreground" : "text-muted-foreground"}>
                                            {proposal.viewedAt ? `Viewed ${formatDate(proposal.viewedAt)}` : "Not viewed"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            proposal.status === "accepted" ? "bg-success" : 
                                            proposal.status === "rejected" ? "bg-destructive" : "bg-muted"
                                        )} />
                                        <span className={
                                            proposal.status === "accepted" ? "text-success" :
                                            proposal.status === "rejected" ? "text-destructive" : "text-muted-foreground"
                                        }>
                                            {proposal.status === "accepted" ? "Accepted" :
                                             proposal.status === "rejected" ? "Rejected" : "Pending decision"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredProposals.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No proposals found</h3>
                        <p className="text-muted-foreground text-center">
                            {searchQuery || statusFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "Create your first proposal to get started"}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
