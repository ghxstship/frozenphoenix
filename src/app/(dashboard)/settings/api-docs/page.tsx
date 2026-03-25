"use client";

/* ═══════════════════════════════════════════════════════════════
   API DOCS PAGE — Interactive API Documentation & Key Management

   Developer-facing page with endpoint documentation,
   API key management, and request/response examples.
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Clock, Code, Globe, Key, Lock, Plus, Trash2 } from "lucide-react";
import { useApiKeys, useRevokeApiKey } from "@/lib/data-hooks/hooks-api-keys";

type Tab = "keys" | "endpoints" | "examples";

const TABS = [
    { value: "keys" as Tab, label: "API Keys" },
    { value: "endpoints" as Tab, label: "Endpoints" },
    { value: "examples" as Tab, label: "Examples" },
];

const ENDPOINTS = [
    {
        method: "GET",
        path: "/api/projects",
        description: "List all projects",
        scope: "projects:read",
    },
    {
        method: "POST",
        path: "/api/projects",
        description: "Create a project",
        scope: "projects:write",
    },
    { method: "GET", path: "/api/tasks", description: "List tasks", scope: "tasks:read" },
    { method: "POST", path: "/api/tasks", description: "Create a task", scope: "tasks:write" },
    { method: "GET", path: "/api/crew", description: "List crew members", scope: "crew:read" },
    { method: "GET", path: "/api/events", description: "List events", scope: "events:read" },
    { method: "GET", path: "/api/budgets", description: "List budgets", scope: "budgets:read" },
    { method: "GET", path: "/api/invoices", description: "List invoices", scope: "invoices:read" },
    { method: "GET", path: "/api/vendors", description: "List vendors", scope: "vendors:read" },
    { method: "GET", path: "/api/assets", description: "List assets", scope: "assets:read" },
    { method: "GET", path: "/api/reports", description: "List reports", scope: "reports:read" },
];

const METHOD_COLORS: Record<string, string> = {
    GET: "text-green-400 bg-green-400/10",
    POST: "text-blue-400 bg-blue-400/10",
    PUT: "text-amber-400 bg-amber-400/10",
    PATCH: "text-amber-400 bg-amber-400/10",
    DELETE: "text-red-400 bg-red-400/10",
};

export default function ApiDocsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("keys");
    const { data: keys } = useApiKeys();
    const revoke = useRevokeApiKey();

    return (
        <div className="space-y-6">
            <PageHeader
                title="API & Developer Tools"
                description="Manage API keys, explore endpoints, and integrate with external systems."
            />

            <SegmentedControl
                options={TABS}
                value={activeTab}
                onValueChange={setActiveTab}
                ariaLabel="API Docs tabs"
            />

            {/* API Keys Tab */}
            {activeTab === "keys" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {(keys ?? []).filter((k) => !k.revoked).length} active keys
                        </p>
                        <Button size="sm" className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            Create API Key
                        </Button>
                    </div>

                    {(keys ?? []).length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">No API keys</p>
                                <p className="text-xs mt-1">
                                    Create a key to get started with the API
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {(keys ?? []).map((key) => (
                                <Card key={key.id} className={key.revoked ? "opacity-50" : ""}>
                                    <CardContent className="py-3 flex items-center gap-4">
                                        <Key className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {key.name}
                                                </span>
                                                {key.revoked && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-[10px]"
                                                    >
                                                        Revoked
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                                                <code className="bg-muted px-1 rounded">
                                                    {key.prefix}•••
                                                </code>
                                                <span className="flex items-center gap-0.5">
                                                    <Lock className="h-2.5 w-2.5" />
                                                    {key.scopes.length} scopes
                                                </span>
                                                {key.last_used_at && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        Last used{" "}
                                                        {new Date(
                                                            key.last_used_at
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!key.revoked && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => revoke.mutate(key.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Endpoints Tab */}
            {activeTab === "endpoints" && (
                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm">Available Endpoints</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {ENDPOINTS.map((ep) => (
                                <div
                                    key={`${ep.method}-${ep.path}`}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30 transition-colors"
                                >
                                    <Badge
                                        className={`${METHOD_COLORS[ep.method] ?? ""} font-mono text-[10px] min-w-[46px] justify-center`}
                                    >
                                        {ep.method}
                                    </Badge>
                                    <code className="text-xs font-mono flex-1">{ep.path}</code>
                                    <span className="text-xs text-muted-foreground hidden sm:inline">
                                        {ep.description}
                                    </span>
                                    <Badge variant="outline" className="text-[9px]">
                                        {ep.scope}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Examples Tab */}
            {activeTab === "examples" && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Code className="h-4 w-4" />
                                Authentication
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted/50 rounded p-3 overflow-x-auto">
                                {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.atlvs.com/api/projects`}
                            </pre>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                List Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <pre className="text-xs bg-muted/50 rounded p-3 overflow-x-auto">
                                {`GET /api/projects?status=active&limit=10

Response:
{
  "data": [
    {
      "id": "proj_abc123",
      "name": "Summer Festival 2026",
      "status": "active",
      "start_date": "2026-06-15",
      "end_date": "2026-06-18",
      "budget_total": 250000
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10
}`}
                            </pre>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Create Task
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted/50 rounded p-3 overflow-x-auto">
                                {`POST /api/tasks
Content-Type: application/json

{
  "title": "Confirm venue walkthrough",
  "project_id": "proj_abc123",
  "assignee_id": "user_xyz",
  "priority": "high",
  "due_date": "2026-04-01"
}

Response: 201 Created
{
  "id": "task_def456",
  "title": "Confirm venue walkthrough",
  "status": "todo",
  ...
}`}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
