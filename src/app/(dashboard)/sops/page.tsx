"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSOPs, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { Plus, BookOpen, CheckCircle2, Clock, User, Loader2 } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PermissionGate } from "@/components/permission-guard";

const MOCK_SOPS = [
    { id: "sop1", title: "Load-In Safety Protocol", role: "Lead Fabricator", version: "2.1", lastUpdated: "2026-02-10", acknowledged: 4, total: 5 },
    { id: "sop2", title: "Forklift Operation Procedure", role: "General Labor", version: "1.3", lastUpdated: "2026-01-15", acknowledged: 3, total: 3 },
    { id: "sop3", title: "Electrical Rigging Checklist", role: "Electrician", version: "3.0", lastUpdated: "2026-02-01", acknowledged: 1, total: 2 },
    { id: "sop4", title: "Client Site Access Protocol", role: "All Roles", version: "1.0", lastUpdated: "2026-02-20", acknowledged: 8, total: 12 },
];

export default function SOPsPage() {
    const { data: sbSOPs, isLoading } = useSOPs();

    const sops = isSupabaseConfigured && sbSOPs ? sbSOPs.map(sop => ({
        id: sop.id,
        title: sop.title,
        role: sop.role,
        version: sop.version,
        lastUpdated: sop.updated_at,
        acknowledged: ((sop as unknown as { sop_acknowledgments?: { user_id: string }[] }).sop_acknowledgments || []).length,
        total: 5, // Would need a separate query for total users per role
    })) : MOCK_SOPS;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }
    return (
        <PermissionGate resource="sops" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Standard Operating Procedures" description="Role-based SOPs for instant onboarding and compliance">
                <Button size="sm"><Plus className="h-4 w-4" /> New SOP</Button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sops.map((sop, i) => (
                    <StaggerItem key={sop.id} index={i} stagger="relaxed">
                    <Card>
                        <CardContent>
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold">{sop.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="ghost" className="text-[9px]">
                                            <User className="h-2.5 w-2.5 mr-0.5" />
                                            {sop.role}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">v{sop.version}</span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Updated {sop.lastUpdated}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            {sop.acknowledged}/{sop.total} acknowledged
                                        </span>
                                    </div>
                                    <ProgressBar value={(sop.acknowledged / sop.total) * 100} size="xs" className="mt-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    </StaggerItem>
                ))}
            </div>
        </div>
        </PermissionGate>
    );
}
