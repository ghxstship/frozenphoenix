"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PERMISSION_LEVEL_MAP } from "@/config/domain-config";
import type { Invitation } from "@/types/user-lifecycle";
import { CheckCircle2, Clock, Mail, RotateCcw, Send, UserPlus, XCircle } from "lucide-react";
import type { InvitationStatus, PermissionLevel } from "@/types";

const STATUS_FILTERS: { value: InvitationStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "expired", label: "Expired" },
    { value: "revoked", label: "Revoked" },
];

function daysUntil(dateStr: string): number {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function InvitationsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<InvitationStatus | "all">("all");

    // NEXT: Wire to useInvitations() when hook is available
    const invitations = useMemo<Invitation[]>(() => [], []);

    const filtered = useMemo(() => {
        return invitations.filter((inv) => {
            const matchesSearch =
                !search ||
                inv.email.toLowerCase().includes(search.toLowerCase()) ||
                (inv.invitedByName ?? "").toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [invitations, search, statusFilter]);

    const pendingCount = invitations.filter((i) => i.status === "pending").length;
    const acceptedCount = invitations.filter((i) => i.status === "accepted").length;
    const expiredCount = invitations.filter((i) => i.status === "expired").length;
    const revokedCount = invitations.filter((i) => i.status === "revoked").length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Invitations"
                description="Manage pending, accepted, and expired user invitations"
            >
                <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invitation
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Pending" value={pendingCount} icon={Clock} />
                <StatCard title="Accepted" value={acceptedCount} icon={CheckCircle2} />
                <StatCard title="Expired" value={expiredCount} icon={XCircle} />
                <StatCard title="Revoked" value={revokedCount} icon={XCircle} />
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <SearchInput
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Search by email or inviter..."
                            className="flex-1"
                        />
                        <div className="flex gap-2 flex-wrap">
                            {STATUS_FILTERS.map((f) => (
                                <Button
                                    key={f.value}
                                    variant={statusFilter === f.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter(f.value)}
                                >
                                    {f.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filtered.map((inv) => {
                            const roleConfig = PERMISSION_LEVEL_MAP[inv.role as PermissionLevel];
                            const isPending = inv.status === "pending";
                            const remaining = isPending ? daysUntil(inv.expiresAt) : 0;

                            return (
                                <Card key={inv.id} className="border">
                                    <CardContent className="py-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center shrink-0">
                                                    <Mail className="h-5 w-5 text-info" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {inv.email}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        {roleConfig && (
                                                            <Badge
                                                                variant={roleConfig.variant}
                                                                className="text-[10px]"
                                                            >
                                                                {roleConfig.label}
                                                            </Badge>
                                                        )}
                                                        <StatusBadge status={inv.status} />
                                                        {isPending && remaining > 0 && (
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Expires in {remaining}d
                                                            </span>
                                                        )}
                                                    </div>
                                                    {inv.personalMessage && (
                                                        <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
                                                            &ldquo;{inv.personalMessage}&rdquo;
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                                                <div className="text-right">
                                                    <p>
                                                        Invited by{" "}
                                                        <span className="font-medium text-foreground">
                                                            {inv.invitedByName}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {new Date(
                                                            inv.createdAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {isPending && (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Resend"
                                                        >
                                                            <RotateCcw className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Revoke"
                                                        >
                                                            <XCircle className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {filtered.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No invitations found</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
