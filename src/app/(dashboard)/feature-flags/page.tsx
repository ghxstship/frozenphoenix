"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PermissionGate } from "@/components/permission-guard";
import { useFeatureFlags, useUpdateFeatureFlag } from "@/lib/settings/hooks";
import { Flag, Globe, Loader2, Percent, Search, ToggleLeft, Users } from "lucide-react";

export default function FeatureFlagsPage() {
    const { data: flags, isLoading } = useFeatureFlags();
    const updateFlag = useUpdateFeatureFlag();
    const [search, setSearch] = useState("");

    const filtered = (flags ?? []).filter(
        (f) =>
            f.key.toLowerCase().includes(search.toLowerCase()) ||
            f.label.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = (flags ?? []).filter((f) => f.is_active).length;

    return (
        <PermissionGate resource="settings" action="manage">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Feature Flags"
                    description="Control feature rollout across organizations, roles, and users"
                >
                    <Badge variant="ghost">{flags?.length ?? 0} flags</Badge>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="py-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Flag className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{flags?.length ?? 0}</p>
                                <p className="text-xs text-muted-foreground">Total Flags</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                                <ToggleLeft className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{activeCount}</p>
                                <p className="text-xs text-muted-foreground">Active</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                                <Percent className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {
                                        (flags ?? []).filter((f) => f.flag_type === "percentage")
                                            .length
                                    }
                                </p>
                                <p className="text-xs text-muted-foreground">Percentage Rollouts</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">All Feature Flags</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search flags…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12 text-sm text-muted-foreground">
                                {search
                                    ? "No flags match your search."
                                    : "No feature flags defined yet."}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filtered.map((flag) => (
                                    <div
                                        key={flag.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors gap-4"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium">{flag.label}</p>
                                                <Badge variant="ghost" className="text-[10px]">
                                                    {flag.flag_type}
                                                </Badge>
                                                {flag.target_orgs.length > 0 && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                                        <Globe className="h-3 w-3" />
                                                        {flag.target_orgs.length}
                                                    </span>
                                                )}
                                                {flag.target_roles.length > 0 && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                                        <Users className="h-3 w-3" />
                                                        {flag.target_roles.length}
                                                    </span>
                                                )}
                                                {flag.flag_type === "percentage" && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                                        <Percent className="h-3 w-3" />
                                                        {flag.rollout_percentage}%
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                {flag.description ?? flag.key}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                updateFlag.mutate({
                                                    id: flag.id,
                                                    is_active: !flag.is_active,
                                                })
                                            }
                                            disabled={updateFlag.isPending}
                                            className={`h-6 w-11 rounded-full transition-colors shrink-0 ${
                                                flag.is_active ? "bg-primary" : "bg-muted"
                                            }`}
                                            role="switch"
                                            aria-checked={flag.is_active}
                                            aria-label={`Toggle ${flag.label}`}
                                        >
                                            <div
                                                className={`h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${
                                                    flag.is_active
                                                        ? "translate-x-5"
                                                        : "translate-x-0.5"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PermissionGate>
    );
}
