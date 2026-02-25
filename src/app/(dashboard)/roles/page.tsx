"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PERMISSION_MATRIX } from "@/config/rbac";
import {
    Shield, Users, CheckCircle2, XCircle, Eye, Pencil, Trash2, Settings,
} from "lucide-react";

type RoleKey = keyof typeof PERMISSION_MATRIX;

const ROLE_META: Record<RoleKey, { label: string; description: string; color: string; memberCount: number }> = {
    exec: { label: "Executive", description: "Full platform access with manage-level permissions across all resources", color: "bg-primary/10 text-primary", memberCount: 3 },
    pm: { label: "Project Manager", description: "Read/write access to projects, tasks, crew, scheduling, and production resources", color: "bg-info/10 text-info", memberCount: 12 },
    client: { label: "Client", description: "Read-only access to assigned projects, proposals, contracts, and approvals", color: "bg-success/10 text-success", memberCount: 28 },
    vendor: { label: "Vendor", description: "Task-specific access to assigned work, schedules, and relevant documents", color: "bg-warning/10 text-warning", memberCount: 45 },
};

const ACTION_ICONS: Record<string, React.ElementType> = {
    read: Eye,
    write: Pencil,
    delete: Trash2,
    manage: Settings,
};

export default function RolesPage() {
    const [selectedRole, setSelectedRole] = useState<RoleKey>("exec");

    const roles = Object.keys(PERMISSION_MATRIX) as RoleKey[];
    const totalMembers = Object.values(ROLE_META).reduce((sum, r) => sum + r.memberCount, 0);
    const selectedPermissions = PERMISSION_MATRIX[selectedRole];
    const allResources = [...new Set(Object.values(PERMISSION_MATRIX).flatMap(perms => perms.map(p => p.resource)))].sort();

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Role & Permission Management" description="Configure role-based access control across all platform resources">
                <Button variant="outline"><Settings className="mr-2 h-4 w-4" />Audit Log</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Roles Defined" value={roles.length} icon={Shield} />
                <StatCard title="Total Members" value={totalMembers} icon={Users} />
                <StatCard title="Resources" value={allResources.length} icon={CheckCircle2} />
                <StatCard title="Permission Rules" value={Object.values(PERMISSION_MATRIX).flatMap(p => p).length} icon={Settings} />
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {roles.map((role) => {
                    const meta = ROLE_META[role];
                    const perms = PERMISSION_MATRIX[role];
                    const isSelected = selectedRole === role;
                    return (
                        <Card
                            key={role}
                            className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary border-primary" : ""}`}
                            onClick={() => setSelectedRole(role)}
                        >
                            <CardContent className="py-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${meta.color}`}>
                                    <Shield className="h-5 w-5" />
                                </div>
                                <h3 className="text-sm font-semibold">{meta.label}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{meta.description}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <Badge variant="ghost">{perms.length} permissions</Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Users className="h-3 w-3" />{meta.memberCount}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Permission Matrix */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Permission Matrix — {ROLE_META[selectedRole].label}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Resource</th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Read</th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Write</th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Delete</th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Manage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allResources.map((resource) => {
                                    const perm = selectedPermissions.find(p => p.resource === resource);
                                    const actions = perm?.actions ?? [];
                                    return (
                                        <tr key={resource} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                            <td className="py-2.5 pr-4">
                                                <span className="font-medium text-xs">{resource.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                                            </td>
                                            {(["read", "write", "delete", "manage"] as const).map((action) => {
                                                const has = actions.includes(action);
                                                return (
                                                    <td key={action} className="text-center py-2.5 px-3">
                                                        {has ? (
                                                            <CheckCircle2 className="h-4 w-4 text-success inline-block" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-muted-foreground/30 inline-block" />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardContent className="py-3">
                    <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
                        <span className="font-medium">Permission Levels:</span>
                        {Object.entries(ACTION_ICONS).map(([action, Icon]) => (
                            <span key={action} className="flex items-center gap-1">
                                <Icon className="h-3 w-3" />
                                <span className="capitalize">{action}</span>
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
