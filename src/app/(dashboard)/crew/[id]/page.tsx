"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { MOCK_CREW, MOCK_PROJECTS } from "@/lib/demo-data";
import { CERTIFICATION_TYPE_MAP } from "@/config/domain-config";
import { useUpdateCrewMember, useCrewMembers, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Edit,
    Phone,
    Mail,
    DollarSign,
    Calendar,
    Award,
    AlertTriangle,
    HardHat,
    Clock,
} from "lucide-react";

type TabId = "overview" | "certifications" | "schedule" | "history";

export default function CrewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const crewId = params.id as string;
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignProjectId, setAssignProjectId] = useState("");
    const [certOpen, setCertOpen] = useState(false);
    const [certName, setCertName] = useState("");
    const [certExpiry, setCertExpiry] = useState("");
    const updateCrewMember = useUpdateCrewMember();
    const { data: sbCrew } = useCrewMembers();

    const sbMember = sbCrew?.find((c) => c.id === crewId);
    const crewMember = isSupabaseConfigured && sbMember
        ? {
            id: sbMember.id,
            name: sbMember.name,
            email: sbMember.email,
            phone: sbMember.phone ?? "",
            role: sbMember.role,
            hourlyRate: sbMember.hourly_rate ?? 0,
            status: sbMember.status as string,
            certifications: [] as { id: string; type: string; label: string; expiryDate: string; isValid: boolean }[],
        }
        : MOCK_CREW.find((c) => c.id === crewId);

    const handleDeactivate = async () => {
        if (!isSupabaseConfigured) return;
        try {
            await updateCrewMember.mutateAsync({ id: crewId, status: "inactive" } as unknown as Parameters<typeof updateCrewMember.mutateAsync>[0]);
        } catch (error) {
            console.error("Failed to deactivate crew member:", error);
        }
    };

    const handleAssignToProject = async () => {
        if (!assignProjectId.trim() || !isSupabaseConfigured) return;
        // In production, this would create a project_members record
        // For now, we log and close the dialog
        console.log("Assigning crew member", crewId, "to project", assignProjectId);
        setAssignOpen(false);
        setAssignProjectId("");
    };

    const handleAddCertification = async () => {
        if (!certName.trim() || !isSupabaseConfigured) return;
        // In production, this would insert into a certifications table
        console.log("Adding certification", certName, "expiry", certExpiry, "for crew member", crewId);
        setCertOpen(false);
        setCertName("");
        setCertExpiry("");
    };

    if (!crewMember) {
        return (
            <EmptyState
                icon={HardHat}
                title="Crew member not found"
                description="The crew member you're looking for doesn't exist."
                action={{ label: "Back to Crew", onClick: () => router.push("/crew") }}
            />
        );
    }

    const expiredCerts = crewMember.certifications.filter((c) => !c.isValid);
    const validCerts = crewMember.certifications.filter((c) => c.isValid);
    const assignedProjects = MOCK_PROJECTS.filter((p) => p.teamIds.includes(crewId));

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "certifications" as const, label: "Certifications", count: crewMember.certifications.length },
        { id: "schedule" as const, label: "Schedule" },
        { id: "history" as const, label: "History" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Contact Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${crewMember.email}`} className="text-primary hover:underline">
                            {crewMember.email}
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${crewMember.phone}`} className="hover:underline">
                            {crewMember.phone}
                        </a>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Employment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <span className="font-medium">{crewMember.role}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Hourly Rate</span>
                        <span className="font-medium">{formatCurrency(crewMember.hourlyRate)}/hr</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <StatusBadge status={crewMember.status} />
                    </div>
                </CardContent>
            </Card>

            {expiredCerts.length > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Expired Certifications</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {expiredCerts.length} certification{expiredCerts.length > 1 ? "s" : ""} expired
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    return (
        <>
        <DetailLayout
            backHref="/crew"
            backLabel="Crew"
            title={crewMember.name}
            subtitle={crewMember.role}
            status={crewMember.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    {crewMember.name.split(" ").map((n) => n[0]).join("")}
                </div>
            }
            actions={
                <Button onClick={() => router.push(`/crew/${crewId}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
            menuItems={[
                { label: "Assign to Project", onClick: () => setAssignOpen(true) },
                { label: "View Time Entries", onClick: () => router.push(`/crew/${crewId}/time`) },
                { label: updateCrewMember.isPending ? "Deactivating..." : "Deactivate", onClick: handleDeactivate, variant: "destructive" },
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-xs">Hourly Rate</span>
                                </div>
                                <p className="text-xl font-bold">{formatCurrency(crewMember.hourlyRate)}</p>
                                <p className="text-xs text-muted-foreground">per hour</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Award className="h-4 w-4" />
                                    <span className="text-xs">Certifications</span>
                                </div>
                                <p className="text-xl font-bold">{validCerts.length}/{crewMember.certifications.length}</p>
                                <p className="text-xs text-muted-foreground">valid</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <HardHat className="h-4 w-4" />
                                    <span className="text-xs">Projects</span>
                                </div>
                                <p className="text-xl font-bold">{assignedProjects.length}</p>
                                <p className="text-xs text-muted-foreground">assigned</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs">This Month</span>
                                </div>
                                <p className="text-xl font-bold">0h</p>
                                <p className="text-xs text-muted-foreground">logged</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Assigned Projects */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Assigned Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignedProjects.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Not assigned to any projects</p>
                            ) : (
                                <div className="space-y-3">
                                    {assignedProjects.map((project) => (
                                        <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                            <div>
                                                <p className="text-sm font-medium">{project.name}</p>
                                                <p className="text-xs text-muted-foreground">{project.client}</p>
                                            </div>
                                            <StatusBadge status={project.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "certifications" && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Certifications</CardTitle>
                        <Button size="sm" onClick={() => setCertOpen(true)}>Add Certification</Button>
                    </CardHeader>
                    <CardContent>
                        {crewMember.certifications.length === 0 ? (
                            <EmptyState
                                icon={Award}
                                title="No certifications"
                                description="Add certifications to track compliance"
                                action={{ label: "Add Certification", onClick: () => setCertOpen(true) }}
                            />
                        ) : (
                            <div className="space-y-3">
                                {crewMember.certifications.map((cert) => {
                                    const config = CERTIFICATION_TYPE_MAP[cert.type as keyof typeof CERTIFICATION_TYPE_MAP];
                                    return (
                                        <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-2 w-2 rounded-full ${cert.isValid ? "bg-success" : "bg-destructive"}`} />
                                                <div>
                                                    <p className="text-sm font-medium">{config?.label || cert.label}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Expires: {formatDate(cert.expiryDate)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={cert.isValid ? "success" : "destructive"}>
                                                {cert.isValid ? "Valid" : "Expired"}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "schedule" && (
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
            )}

            {activeTab === "history" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Work History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Work history will be available when connected to Supabase
                        </p>
                    </CardContent>
                </Card>
            )}
        </DetailLayout>

            {/* Assign to Project Dialog */}
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
                        <Button variant="ghost" onClick={() => setAssignOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignToProject} disabled={!assignProjectId.trim()}>Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Certification Dialog */}
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
                        <Button variant="ghost" onClick={() => setCertOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCertification} disabled={!certName.trim()}>Add Certification</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
