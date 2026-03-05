"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MOCK_STAKEHOLDERS } from "@/lib/demo-data";
import { usePeople } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import { Building2, Loader2, Mail, Phone, Plus, UserCircle, Users, Wrench } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import type { StakeholderType } from "@/types";

const typeConfig: Record<
    StakeholderType,
    { label: string; variant: "default" | "info" | "warning" | "success"; icon: typeof Users }
> = {
    internal: { label: "Internal", variant: "default", icon: Building2 },
    client: { label: "Client", variant: "info", icon: UserCircle },
    freelance: { label: "Freelance", variant: "warning", icon: Wrench },
    subcontractor: { label: "Subcontractor", variant: "success", icon: Users },
};

export default function PeoplePage() {
    const { data: sbPeople, isLoading } = usePeople();
    const stakeholders = (sbPeople ?? []) as typeof MOCK_STAKEHOLDERS;

    const grouped = {
        internal: stakeholders.filter((s) => s.type === "internal"),
        client: stakeholders.filter((s) => s.type === "client"),
        freelance: stakeholders.filter((s) => s.type === "freelance"),
        subcontractor: stakeholders.filter((s) => s.type === "subcontractor"),
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="people" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Stakeholder Matrix"
                    description="CRM for Internal Team, Clients, Freelance Crew, and Subcontractors"
                >
                    <Link href="/people/new">
                        <Button size="sm">
                            <Plus className="h-4 w-4" /> Add Contact
                        </Button>
                    </Link>
                </PageHeader>

                {/* Type filters */}
                <div className="flex items-center gap-2">
                    {(
                        Object.entries(typeConfig) as [
                            StakeholderType,
                            (typeof typeConfig)[StakeholderType],
                        ][]
                    ).map(([type, config]) => (
                        <div
                            key={type}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-xs font-medium"
                        >
                            <config.icon className="h-3.5 w-3.5" />
                            {config.label}
                            <span className="text-muted-foreground">({grouped[type].length})</span>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stakeholders.map((person, i) => {
                        const config = typeConfig[person.type];
                        return (
                            <StaggerItem key={person.id} index={i} stagger="relaxed">
                                <Card>
                                    <CardContent>
                                        <div className="flex items-start gap-3">
                                            <Avatar name={person.name} size="lg" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold truncate">
                                                        {person.name}
                                                    </h3>
                                                    <Badge
                                                        variant={config.variant}
                                                        className="text-[9px]"
                                                    >
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {person.role}
                                                </p>
                                                <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                                                    <p className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {person.email}
                                                    </p>
                                                    {person.phone && (
                                                        <p className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {person.phone}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-[10px] text-muted-foreground">
                                                    {person.projectIds.length} project
                                                    {person.projectIds.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </div>
            </div>
        </PermissionGate>
    );
}
