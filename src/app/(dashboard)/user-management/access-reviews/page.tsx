"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PERMISSION_LEVEL_MAP } from "@/config/domain-config";
import { MOCK_ACCESS_REVIEWS, MOCK_TEMP_GRANTS } from "@/lib/demo-data-user-lifecycle";
import {
    ShieldQuestion, AlertTriangle, CheckCircle2, Clock, Users, ShieldAlert, Eye,
} from "lucide-react";
import type { PermissionLevel } from "@/types";

const RISK_COLORS: Record<string, string> = {
    low: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    high: "bg-destructive/10 text-destructive",
};

export default function AccessReviewsPage() {
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");

    const filtered = useMemo(() => {
        return MOCK_ACCESS_REVIEWS.filter((r) => {
            const matchesSearch =
                !search ||
                r.userName.toLowerCase().includes(search.toLowerCase()) ||
                r.email.toLowerCase().includes(search.toLowerCase());
            const matchesRisk = riskFilter === "all" || r.riskLevel === riskFilter;
            return matchesSearch && matchesRisk;
        });
    }, [search, riskFilter]);

    const highRisk = MOCK_ACCESS_REVIEWS.filter((r) => r.riskLevel === "high").length;
    const mediumRisk = MOCK_ACCESS_REVIEWS.filter((r) => r.riskLevel === "medium").length;
    const activeGrants = MOCK_TEMP_GRANTS.filter((g) => g.status === "active").length;
    const staleAccess = MOCK_ACCESS_REVIEWS.filter((r) => r.daysSinceActive > 30).length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Access Reviews" description="Periodic review of user permissions, stale access, and temporary grants">
                <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Export Report
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="High Risk" value={highRisk} icon={AlertTriangle} />
                <StatCard title="Medium Risk" value={mediumRisk} icon={ShieldAlert} />
                <StatCard title="Active Temp Grants" value={activeGrants} icon={Clock} />
                <StatCard title="Stale Access (30d+)" value={staleAccess} icon={Users} />
            </div>

            {/* Temporary Access Grants */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Active Temporary Access Grants
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {MOCK_TEMP_GRANTS.filter((g) => g.status === "active").map((grant) => (
                            <div key={grant.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-secondary/30">
                                <div>
                                    <p className="text-sm font-medium">{grant.userName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-medium">{grant.resourceType}</span> access ({grant.actions.join(", ")}) — granted by {grant.grantedByName}
                                    </p>
                                    <p className="text-xs text-muted-foreground italic mt-0.5">{grant.reason}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-muted-foreground">
                                        Expires {new Date(grant.expiresAt).toLocaleDateString()}
                                    </span>
                                    <Button variant="ghost" size="sm">Revoke</Button>
                                </div>
                            </div>
                        ))}
                        {MOCK_TEMP_GRANTS.filter((g) => g.status === "active").length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No active temporary grants</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Access Review Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ShieldQuestion className="h-4 w-4" />
                        User Access Review
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <SearchInput value={search} onValueChange={setSearch} placeholder="Search users..." className="flex-1" />
                        <div className="flex gap-2">
                            {(["all", "high", "medium", "low"] as const).map((level) => (
                                <Button
                                    key={level}
                                    variant={riskFilter === level ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setRiskFilter(level)}
                                >
                                    {level === "all" ? "All" : `${level.charAt(0).toUpperCase() + level.slice(1)} Risk`}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">User</th>
                                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Role</th>
                                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Projects</th>
                                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Inactive</th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Risk</th>
                                    <th className="text-right py-2 pl-3 font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((review) => {
                                    const roleConfig = PERMISSION_LEVEL_MAP[review.role as PermissionLevel];
                                    return (
                                        <tr key={review.userId} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                            <td className="py-2.5 pr-4">
                                                <div>
                                                    <p className="font-medium text-xs">{review.userName}</p>
                                                    <p className="text-[10px] text-muted-foreground">{review.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                {roleConfig && <Badge variant={roleConfig.variant} className="text-[10px]">{roleConfig.label}</Badge>}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <StatusBadge status={review.membershipStatus} />
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-xs">{review.projectCount}</td>
                                            <td className="py-2.5 px-3 text-right text-xs">
                                                <span className={review.daysSinceActive > 30 ? "text-destructive font-medium" : "text-muted-foreground"}>
                                                    {review.daysSinceActive}d
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${RISK_COLORS[review.riskLevel]}`}>
                                                    {review.riskLevel.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-2.5 pl-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {review.riskLevel !== "low" && (
                                                        <Button variant="ghost" size="sm" className="text-xs h-7">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Confirm
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
