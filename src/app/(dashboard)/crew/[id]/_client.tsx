"use client";

import { logger } from "@/lib/logger";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useCrewMembers,
    useDeleteCrewMember,
    useRecordActivityLog,
    useUpdateCrewMember,
} from "@/lib/supabase";
import { useUpdateCrewMember as useUpdateCrewMemberHook } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { CERTIFICATION_TYPE_MAP } from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    AlertTriangle,
    Award,
    Calendar,
    Clock,
    DollarSign,
    Edit,
    HardHat,
    Mail,
    Phone,
} from "lucide-react";

function CrewHistoryTab({ crewId }: { crewId: string }) {
    const { data: activity } = useRecordActivityLog("crew_member", crewId);
    const items = (activity ?? []) as unknown as Array<Record<string, unknown>>;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Work History</CardTitle>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="No history yet"
                        description="Activity will appear here as work is logged"
                    />
                ) : (
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div
                                key={String(item.id)}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {String(item.action ?? "Activity")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {(item.metadata as Record<string, unknown> | null)
                                            ?.description
                                            ? String(
                                                  (item.metadata as Record<string, unknown>)
                                                      .description
                                              )
                                            : String(item.entity_type ?? "")}
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {item.created_at ? formatDate(String(item.created_at)) : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "crew_member",
    titleKey: "name",
    statusKey: "status",
    icon: HardHat,
    backHref: "/crew",
    backLabel: "Crew",
    chatterRecordType: "crew_member",
    fields: [
        { id: "email", label: "Email", accessorKey: "email", fieldType: "email", icon: Mail },
        { id: "phone", label: "Phone", accessorKey: "phone", fieldType: "phone", icon: Phone },
        { id: "role", label: "Role", accessorKey: "role" },
        {
            id: "hourly_rate",
            label: "Hourly Rate",
            accessorKey: "hourly_rate",
            fieldType: "currency",
            icon: DollarSign,
        },
    ],
    sidebarFields: [
        { id: "email", label: "Email", accessorKey: "email", fieldType: "email" },
        { id: "phone", label: "Phone", accessorKey: "phone", fieldType: "phone" },
        { id: "role", label: "Role", accessorKey: "role" },
        {
            id: "hourly_rate",
            label: "Hourly Rate",
            accessorKey: "hourly_rate",
            fieldType: "currency",
        },
    ],
    tabs: [],
};

export function CrewDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Crew Member",
        listPath: "/crew",
        useUpdateHook: useUpdateCrewMemberHook,
        useDeleteHook: useDeleteCrewMember,
    });
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignProjectId, setAssignProjectId] = useState("");
    const [certOpen, setCertOpen] = useState(false);
    const [certName, setCertName] = useState("");
    const [certExpiry, setCertExpiry] = useState("");
    const updateCrewMember = useUpdateCrewMember();
    const { data: sbCrew, isLoading } = useCrewMembers();

    const sbMember = sbCrew?.find((c) => c.id === id);
    const crewMember = sbMember
        ? {
              id: sbMember.id,
              name: sbMember.name,
              email: sbMember.email,
              phone: sbMember.phone ?? "",
              role: sbMember.role,
              hourlyRate: sbMember.hourly_rate ?? 0,
              status: sbMember.status as string,
              certifications: [] as {
                  id: string;
                  type: string;
                  label: string;
                  expiryDate: string;
                  isValid: boolean;
              }[],
          }
        : null;

    const handleDeactivate = async () => {
        try {
            await updateCrewMember.mutateAsync({ id, status: "inactive" } as unknown as Parameters<
                typeof updateCrewMember.mutateAsync
            >[0]);
        } catch (error) {
            logger.error("Failed to deactivate crew member", { error });
        }
    };
    const handleAssignToProject = async () => {
        if (!assignProjectId.trim()) return;
        logger.info("Assigning crew member", { crewId: id, projectId: assignProjectId });
        setAssignOpen(false);
        setAssignProjectId("");
    };
    const handleAddCertification = async () => {
        if (!certName.trim()) return;
        logger.info("Adding certification", { certName, certExpiry, crewId: id });
        setCertOpen(false);
        setCertName("");
        setCertExpiry("");
    };

    const expiredCerts = crewMember?.certifications.filter((c) => !c.isValid) ?? [];
    const validCerts = crewMember?.certifications.filter((c) => c.isValid) ?? [];
    // Assigned projects are resolved via work_order_crew junction → work_order → project_id
    const assignedProjects: Record<string, unknown>[] = [];

    const sidebarSlot =
        expiredCerts.length > 0 ? (
            <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Expired Certifications</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {expiredCerts.length} certification{expiredCerts.length > 1 ? "s" : ""}{" "}
                        expired
                    </p>
                </CardContent>
            </Card>
        ) : undefined;

    const overviewSlot = crewMember ? (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Assigned Projects</CardTitle>
            </CardHeader>
            <CardContent>
                {assignedProjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Not assigned to any projects
                    </p>
                ) : (
                    <div className="space-y-3">
                        {assignedProjects.map((project) => (
                            <div
                                key={String(project.id)}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {String(project.name ?? "")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {String(project.client ?? "")}
                                    </p>
                                </div>
                                <StatusBadge status={String(project.status ?? "")} />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => crewMember?.role ?? "",
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Hourly Rate",
                icon: DollarSign,
                compute: (r) => `${formatCurrency(Number(r.hourly_rate ?? 0))}/hr`,
            },
            {
                label: "Certifications",
                icon: Award,
                compute: () =>
                    `${validCerts.length}/${crewMember?.certifications.length ?? 0} valid`,
            },
            { label: "Projects", icon: HardHat, compute: () => assignedProjects.length },
            { label: "This Month", icon: Clock, compute: () => "0h logged" },
        ],
        tabs: [
            {
                id: "certifications",
                label: "Certifications",
                content: crewMember ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Certifications</CardTitle>
                            <Button size="sm" onClick={() => setCertOpen(true)}>
                                Add Certification
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {crewMember.certifications.length === 0 ? (
                                <EmptyState
                                    icon={Award}
                                    title="No certifications"
                                    description="Add certifications to track compliance"
                                    action={{
                                        label: "Add Certification",
                                        onClick: () => setCertOpen(true),
                                    }}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {crewMember.certifications.map((cert) => {
                                        const certConfig =
                                            CERTIFICATION_TYPE_MAP[
                                                cert.type as keyof typeof CERTIFICATION_TYPE_MAP
                                            ];
                                        return (
                                            <div
                                                key={cert.id}
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`h-2 w-2 rounded-full ${cert.isValid ? "bg-success" : "bg-destructive"}`}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {certConfig?.label || cert.label}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Expires: {formatDate(cert.expiryDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        cert.isValid ? "success" : "destructive"
                                                    }
                                                >
                                                    {cert.isValid ? "Valid" : "Expired"}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : null,
            },
            {
                id: "schedule",
                label: "Schedule",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Upcoming Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EmptyState
                                icon={Calendar}
                                title="No upcoming shifts"
                                description="Schedule shifts from the Scheduling page"
                            />
                        </CardContent>
                    </Card>
                ),
            },
            { id: "history", label: "History", content: <CrewHistoryTab crewId={id} /> },
        ],
    };

    const record = crewMember
        ? { ...(crewMember as unknown as Record<string, unknown>) }
        : initialRecord;

    return (
        <>
            <DetailPageShell
                config={config}
                id={id}
                record={record as Record<string, unknown> | null}
                isLoading={isLoading && !initialRecord}
                menuItems={[
                    { label: "Assign to Project", onClick: () => setAssignOpen(true) },
                    { label: "View Time Entries", onClick: () => router.push(`/crew/${id}/time`) },
                    {
                        label: updateCrewMember.isPending ? "Deactivating..." : "Deactivate",
                        onClick: handleDeactivate,
                        variant: "destructive",
                    },
                    ...crudMenuItems,
                ]}
                avatar={
                    crewMember ? (
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                            {crewMember.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </div>
                    ) : undefined
                }
                actions={
                    <Button onClick={() => router.push(`/crew/${id}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                }
            />
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign to Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Project ID</label>
                        <Input
                            placeholder="Enter project ID"
                            value={assignProjectId}
                            onChange={(e) => setAssignProjectId(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAssignOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignToProject} disabled={!assignProjectId.trim()}>
                            Assign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={certOpen} onOpenChange={setCertOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Certification</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">Certification Name</label>
                            <Input
                                placeholder="e.g., OSHA 30-Hour"
                                value={certName}
                                onChange={(e) => setCertName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Expiry Date</label>
                            <Input
                                type="date"
                                value={certExpiry}
                                onChange={(e) => setCertExpiry(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCertOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddCertification} disabled={!certName.trim()}>
                            Add Certification
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
