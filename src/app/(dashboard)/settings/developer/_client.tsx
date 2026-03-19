"use client";

import { useCallback, useEffect, useState } from "react";
import { csrfHeaders } from "@/lib/csrf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layouts/empty-state";
import { formatDate } from "@/lib/utils";
import { BookOpen, Copy, Eye, EyeOff, Key, Plus, Trash2, Webhook } from "lucide-react";
import { SettingsPageShell } from "@/components/shells/settings-page-shell";
import type { SettingsPageConfig } from "@/types/settings-page-config";

interface ApiKeyView {
    id: string;
    name: string;
    key_prefix: string;
    scopes: string[];
    rate_limit_rpm: number;
    is_active: boolean;
    last_used_at: string | null;
    expires_at: string | null;
    created_at: string;
}

export function DeveloperPortalPageClient() {
    const [apiKeys, setApiKeys] = useState<ApiKeyView[]>([]);
    const [newKeyName, setNewKeyName] = useState("");
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [showKey, setShowKey] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const fetchKeys = useCallback(async () => {
        try {
            const res = await fetch("/api/api-keys");
            if (res.ok) {
                const data = await res.json();
                setApiKeys(data.data ?? []);
            }
        } catch {
            // Silently handle
        }
    }, []);

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    async function handleCreateKey() {
        if (!newKeyName.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch("/api/api-keys", {
                method: "POST",
                headers: csrfHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({ name: newKeyName, scopes: ["read", "write"] }),
            });
            if (res.ok) {
                const data = await res.json();
                setCreatedKey(data.data.key);
                setNewKeyName("");
                await fetchKeys();
            }
        } finally {
            setIsCreating(false);
        }
    }

    const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

    const handleRevokeKey = useCallback((keyId: string) => {
        setRevokeTarget(keyId);
    }, []);

    const handleConfirmRevoke = useCallback(async () => {
        if (!revokeTarget) return;
        await fetch(`/api/api-keys?id=${revokeTarget}`, { method: "DELETE" });
        setRevokeTarget(null);
        await fetchKeys();
    }, [revokeTarget, fetchKeys]);

    const activeKeys = apiKeys.filter((k) => k.is_active);

    const apiKeysContent = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Create API Key</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Key Name
                            </label>
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="e.g., Production Backend"
                                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <Button
                            size="sm"
                            onClick={handleCreateKey}
                            disabled={isCreating || !newKeyName.trim()}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {isCreating ? "Creating..." : "Create Key"}
                        </Button>
                    </div>

                    {createdKey && (
                        <div className="mt-4 rounded-lg border border-warning/40 bg-warning/5 p-4">
                            <p className="text-xs font-medium text-warning mb-2">
                                Store this key securely — it will not be shown again.
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all">
                                    {showKey
                                        ? createdKey
                                        : createdKey.slice(0, 12) +
                                          "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowKey(!showKey)}
                                >
                                    {showKey ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(createdKey)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {activeKeys.length === 0 ? (
                <EmptyState
                    icon={Key}
                    title="No API keys"
                    description="Create an API key to start using the API programmatically."
                />
            ) : (
                <div className="space-y-2">
                    {activeKeys.map((key) => (
                        <Card key={key.id}>
                            <CardContent className="py-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold">{key.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <code className="text-xs text-muted-foreground font-mono">
                                                    {key.key_prefix}\u2022\u2022\u2022\u2022
                                                </code>
                                                {key.scopes.map((s) => (
                                                    <Badge
                                                        key={s}
                                                        variant="ghost"
                                                        className="text-[10px]"
                                                    >
                                                        {s}
                                                    </Badge>
                                                ))}
                                                <span className="text-[10px] text-muted-foreground">
                                                    {key.rate_limit_rpm} req/min
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right text-xs text-muted-foreground">
                                            <div>Created {formatDate(key.created_at)}</div>
                                            {key.last_used_at && (
                                                <div>Last used {formatDate(key.last_used_at)}</div>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRevokeKey(key.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                    {revokeTarget === key.id && (
                                        <div
                                            role="alert"
                                            className="mt-2 flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
                                        >
                                            <p>
                                                Are you sure you want to revoke this API key? This
                                                action cannot be undone.
                                            </p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setRevokeTarget(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleConfirmRevoke}
                                                >
                                                    Revoke
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    const webhooksContent = (
        <EmptyState
            icon={Webhook}
            title="Webhook Subscriptions"
            description="Subscribe to events and receive real-time notifications at your endpoint. Configure subscriptions via the API: POST /api/webhook-subscriptions"
        />
    );

    const docsContent = (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">API Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-semibold text-sm mb-2">Base URL</h4>
                    <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                        {typeof window !== "undefined" ? window.location.origin : ""}
                        /api/v1
                    </code>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-semibold text-sm mb-2">Authentication</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                        Include your API key in the Authorization header:
                    </p>
                    <code className="text-xs font-mono bg-background px-2 py-1 rounded block">
                        Authorization: Bearer fpx_your_api_key_here
                    </code>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-semibold text-sm mb-2">Rate Limits</h4>
                    <p className="text-xs text-muted-foreground">
                        Default: 60 requests per minute. Check response headers for current limits:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <li>
                            <code className="font-mono">X-RateLimit-Limit</code> — Maximum requests
                            per window
                        </li>
                        <li>
                            <code className="font-mono">X-RateLimit-Remaining</code> — Remaining
                            requests
                        </li>
                        <li>
                            <code className="font-mono">X-RateLimit-Reset</code> — Window reset
                            timestamp
                        </li>
                    </ul>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-semibold text-sm mb-2">Available Endpoints</h4>
                    <div className="space-y-2 text-xs">
                        {[
                            { method: "GET", path: "/api/projects", desc: "List projects" },
                            { method: "GET", path: "/api/tasks", desc: "List tasks" },
                            { method: "GET", path: "/api/events", desc: "List events" },
                            { method: "GET", path: "/api/contacts", desc: "List contacts" },
                            { method: "GET", path: "/api/deals", desc: "List deals" },
                            { method: "GET", path: "/api/invoices", desc: "List invoices" },
                            {
                                method: "POST",
                                path: "/api/automations/execute",
                                desc: "Trigger automation",
                            },
                            {
                                method: "POST",
                                path: "/api/approval-engine/initiate",
                                desc: "Start approval workflow",
                            },
                        ].map((ep, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Badge
                                    variant={ep.method === "GET" ? "success" : ("info" as "ghost")}
                                    className="text-[10px] w-12 justify-center"
                                >
                                    {ep.method}
                                </Badge>
                                <code className="font-mono flex-1">{ep.path}</code>
                                <span className="text-muted-foreground">{ep.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const config: SettingsPageConfig = {
        resource: "settings",
        action: "read",
        title: "Developer Portal",
        description: "Manage API keys, webhook subscriptions, and access API documentation",
        tabs: [
            { id: "api-keys", label: "API Keys", icon: Key, content: apiKeysContent },
            {
                id: "webhooks",
                label: "Webhook Subscriptions",
                icon: Webhook,
                content: webhooksContent,
            },
            { id: "docs", label: "API Documentation", icon: BookOpen, content: docsContent },
        ],
    };

    return <SettingsPageShell config={config} />;
}
