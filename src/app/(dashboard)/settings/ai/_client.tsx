"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { csrfHeaders } from "@/lib/security/csrf";
import { formatCurrency } from "@/lib/utils";
import { getStatusVariant } from "@/config/ui-variants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";
import { SettingsPageShell } from "@/components/shells/settings-page-shell";
import type { SettingsPageConfig } from "@/types/settings-page-config";
import {
    Bot,
    Brain,
    Database,
    Eye,
    EyeOff,
    FileText,
    Gauge,
    Key,
    Loader2,
    Plus,
    RefreshCw,
    Save,
    Shield,
    Sparkles,
    Trash2,
    Upload,
    Zap,
} from "lucide-react";

// ─── Tab Config ──────────────────────────────────────────────

const AI_TABS: SettingsPageConfig["tabs"] = [
    { id: "providers", label: "Providers", icon: Zap, content: <ProvidersPanel /> },
    { id: "models", label: "Models", icon: Brain, content: <ModelsPanel /> },
    { id: "prompts", label: "System Prompts", icon: FileText, content: <SystemPromptsPanel /> },
    { id: "usage", label: "Usage", icon: Gauge, content: <UsagePanel /> },
    { id: "knowledge", label: "Knowledge Base", icon: Database, content: <KnowledgeBasePanel /> },
    { id: "limits", label: "Limits", icon: Shield, content: <LimitsPanel /> },
];

// ─── Types ───────────────────────────────────────────────────

interface ProviderRow {
    id: string;
    provider_key: string;
    display_name: string;
    is_active: boolean;
    base_url: string | null;
    has_api_key: boolean;
}

interface ModelRow {
    id: string;
    provider_id: string;
    model_key: string;
    display_name: string;
    is_active: boolean;
    context_window: number;
    cost_per_1k_input: number;
    cost_per_1k_output: number;
    supports_streaming: boolean;
    supports_tools: boolean;
    supports_vision: boolean;
    provider_display_name?: string | undefined;
}

interface PromptRow {
    id: string;
    name: string;
    role_scope: string | null;
    prompt_text: string;
    is_default: boolean;
    active: boolean;
}

interface UsageRow {
    date: string;
    total_input_tokens: number;
    total_output_tokens: number;
    total_cost: number;
    request_count: number;
}

interface DocumentRow {
    id: string;
    title: string;
    source_type: string;
    file_name: string;
    file_size: number;
    processing_status: string;
    chunk_count: number;
    total_tokens: number;
    created_at: string;
}

interface LimitRow {
    id: string;
    role_id: string | null;
    daily_token_limit: number;
    monthly_token_limit: number;
    max_context_per_request: number;
    active: boolean;
}

// ─── Inline Setting Row (label + description + children) ─────

function AISettingRow({
    label,
    description,
    children,
}: {
    label: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-2">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="flex-shrink-0">{children}</div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────

export function AISettingsPageClient() {
    const config: SettingsPageConfig = {
        resource: "settings",
        action: "manage",
        title: "AI Copilot Settings",
        description: "Configure AI providers, models, system prompts, and usage limits.",
        headerActions: (
            <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Admin Only
            </Badge>
        ),
        tabs: AI_TABS,
    };

    return <SettingsPageShell config={config} />;
}

// ═══════════════════════════════════════════════════════════════
// Providers Panel
// ═══════════════════════════════════════════════════════════════

function ProvidersPanel() {
    const [providers, setProviders] = useState<ProviderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [keyInput, setKeyInput] = useState("");
    const [keyVisible, setKeyVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    const fetchProviders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai/providers");
            if (res.ok) {
                const data = await res.json();
                setProviders(data.providers ?? []);
            }
        } catch {
            addToast({ title: "Failed to load providers", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const toggleActive = useCallback(
        async (id: string, active: boolean) => {
            try {
                await fetch(`/api/ai/providers/${id}`, {
                    method: "PATCH",
                    headers: csrfHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify({ is_active: active }),
                });
                setProviders((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, is_active: active } : p))
                );
                addToast({ title: `Provider ${active ? "enabled" : "disabled"}` });
            } catch {
                addToast({ title: "Failed to update provider", variant: "destructive" });
            }
        },
        [addToast]
    );

    const saveApiKey = useCallback(
        async (providerId: string) => {
            if (!keyInput.trim()) return;
            setSaving(true);
            try {
                const res = await fetch(`/api/ai/providers/${providerId}/key`, {
                    method: "PUT",
                    headers: csrfHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify({ api_key: keyInput }),
                });
                if (res.ok) {
                    addToast({ title: "API key saved and encrypted" });
                    setEditingKey(null);
                    setKeyInput("");
                    fetchProviders();
                } else {
                    addToast({ title: "Failed to save API key", variant: "destructive" });
                }
            } catch {
                addToast({ title: "Failed to save API key", variant: "destructive" });
            } finally {
                setSaving(false);
            }
        },
        [keyInput, addToast, fetchProviders]
    );

    if (loading) return <LoadingState />;

    return (
        <div className="density-gap-section">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Providers</h3>
                <Button variant="outline" size="sm" onClick={fetchProviders}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {providers.map((provider) => (
                <Card key={provider.id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bot className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <CardTitle className="text-base">
                                        {provider.display_name}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {provider.provider_key}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={provider.is_active ? "default" : "secondary"}>
                                    {provider.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleActive(provider.id, !provider.is_active)}
                                >
                                    {provider.is_active ? "Disable" : "Enable"}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <AISettingRow
                            label="API Key"
                            description={
                                provider.has_api_key
                                    ? "Key configured (encrypted)"
                                    : "No key configured"
                            }
                        >
                            {editingKey === provider.id ? (
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            type={keyVisible ? "text" : "password"}
                                            placeholder="Enter API key..."
                                            value={keyInput}
                                            onChange={(e) => setKeyInput(e.target.value)}
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-auto w-auto p-1"
                                            onClick={() => setKeyVisible(!keyVisible)}
                                        >
                                            {keyVisible ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => saveApiKey(provider.id)}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditingKey(null);
                                            setKeyInput("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditingKey(provider.id);
                                        setKeyInput("");
                                    }}
                                >
                                    <Key className="h-4 w-4 mr-2" />
                                    {provider.has_api_key ? "Update Key" : "Add Key"}
                                </Button>
                            )}
                        </AISettingRow>

                        {provider.base_url && (
                            <AISettingRow label="Base URL" description="Custom endpoint URL">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {provider.base_url}
                                </code>
                            </AISettingRow>
                        )}
                    </CardContent>
                </Card>
            ))}

            {providers.length === 0 && (
                <EmptyState
                    icon={<Bot className="h-10 w-10" />}
                    title="No providers found"
                    description="AI providers will appear here after running database migrations."
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Models Panel
// ═══════════════════════════════════════════════════════════════

function ModelsPanel() {
    const [models, setModels] = useState<ModelRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const { addToast } = useToast();

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/ai/models");
                if (res.ok) {
                    const data = await res.json();
                    setModels(data.models ?? []);
                }
            } catch {
                addToast({ title: "Failed to load models", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        })();
    }, [addToast]);

    const toggleModel = useCallback(
        async (id: string, active: boolean) => {
            try {
                await fetch(`/api/ai/models/${id}`, {
                    method: "PATCH",
                    headers: csrfHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify({ is_active: active }),
                });
                setModels((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, is_active: active } : m))
                );
                addToast({ title: `Model ${active ? "enabled" : "disabled"}` });
            } catch {
                addToast({ title: "Failed to update model", variant: "destructive" });
            }
        },
        [addToast]
    );

    const filtered = useMemo(() => {
        if (!filter) return models;
        const q = filter.toLowerCase();
        return models.filter(
            (m) => m.display_name.toLowerCase().includes(q) || m.model_key.toLowerCase().includes(q)
        );
    }, [models, filter]);

    if (loading) return <LoadingState />;

    return (
        <div className="density-gap-section">
            <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">AI Models</h3>
                <Input
                    placeholder="Filter models..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <div className="grid gap-3">
                {filtered.map((model) => (
                    <Card key={model.id} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <Brain className="h-5 w-5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{model.display_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {model.model_key}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="flex gap-1">
                                    {model.supports_streaming && (
                                        <Badge variant="outline" className="density-caption">
                                            Stream
                                        </Badge>
                                    )}
                                    {model.supports_tools && (
                                        <Badge variant="outline" className="density-caption">
                                            Tools
                                        </Badge>
                                    )}
                                    {model.supports_vision && (
                                        <Badge variant="outline" className="density-caption">
                                            Vision
                                        </Badge>
                                    )}
                                </div>
                                <Badge variant="secondary" className="density-caption">
                                    {(model.context_window / 1000).toFixed(0)}k ctx
                                </Badge>
                                <Button
                                    variant={model.is_active ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleModel(model.id, !model.is_active)}
                                >
                                    {model.is_active ? "Active" : "Enable"}
                                </Button>
                            </div>
                        </div>
                        {(model.cost_per_1k_input > 0 || model.cost_per_1k_output > 0) && (
                            <p className="text-xs text-muted-foreground mt-2 pl-8">
                                ${model.cost_per_1k_input.toFixed(4)}/1k in · $
                                {model.cost_per_1k_output.toFixed(4)}/1k out
                            </p>
                        )}
                    </Card>
                ))}
            </div>

            {filtered.length === 0 && (
                <EmptyState
                    icon={<Brain className="h-10 w-10" />}
                    title="No models found"
                    description={
                        filter ? "Try a different search." : "Models will appear after migration."
                    }
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// System Prompts Panel
// ═══════════════════════════════════════════════════════════════

function SystemPromptsPanel() {
    const [prompts, setPrompts] = useState<PromptRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    const fetchPrompts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai/prompts");
            if (res.ok) {
                const data = await res.json();
                setPrompts(data.prompts ?? []);
            }
        } catch {
            addToast({ title: "Failed to load prompts", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchPrompts();
    }, [fetchPrompts]);

    const savePrompt = useCallback(
        async (id: string) => {
            setSaving(true);
            try {
                const res = await fetch(`/api/ai/prompts/${id}`, {
                    method: "PATCH",
                    headers: csrfHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify({ prompt_text: editText }),
                });
                if (res.ok) {
                    addToast({ title: "Prompt saved" });
                    setEditing(null);
                    fetchPrompts();
                }
            } catch {
                addToast({ title: "Failed to save prompt", variant: "destructive" });
            } finally {
                setSaving(false);
            }
        },
        [editText, addToast, fetchPrompts]
    );

    if (loading) return <LoadingState />;

    return (
        <div className="density-gap-section">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">System Prompts</h3>
                <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Prompt
                </Button>
            </div>

            {prompts.map((prompt) => (
                <Card key={prompt.id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-base">{prompt.name}</CardTitle>
                                {prompt.is_default && <Badge>Default</Badge>}
                                {prompt.role_scope && (
                                    <Badge variant="outline">{prompt.role_scope}</Badge>
                                )}
                            </div>
                            <Badge variant={prompt.active ? "default" : "secondary"}>
                                {prompt.active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {editing === prompt.id ? (
                            <div className="space-y-3">
                                <Textarea
                                    className="w-full min-h-[200px] rounded-md border bg-background px-3 py-2 text-sm font-mono resize-y"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => savePrompt(prompt.id)}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 motion-safe:animate-spin mr-2" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditing(null)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <pre className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4 font-mono">
                                    {prompt.prompt_text}
                                </pre>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setEditing(prompt.id);
                                        setEditText(prompt.prompt_text);
                                    }}
                                >
                                    Edit Prompt
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}

            {prompts.length === 0 && (
                <EmptyState
                    icon={<FileText className="h-10 w-10" />}
                    title="No system prompts"
                    description="Create a system prompt to customize copilot behavior."
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Usage Panel
// ═══════════════════════════════════════════════════════════════

function UsagePanel() {
    const [usage, setUsage] = useState<UsageRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
    const { addToast } = useToast();

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/ai/usage?period=${period}`);
                if (res.ok) {
                    const data = await res.json();
                    setUsage(data.usage ?? []);
                }
            } catch {
                addToast({ title: "Failed to load usage data", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        })();
    }, [period, addToast]);

    const totals = useMemo(() => {
        return usage.reduce(
            (acc, row) => ({
                input_tokens: acc.input_tokens + row.total_input_tokens,
                output_tokens: acc.output_tokens + row.total_output_tokens,
                cost: acc.cost + row.total_cost,
                requests: acc.requests + row.request_count,
            }),
            { input_tokens: 0, output_tokens: 0, cost: 0, requests: 0 }
        );
    }, [usage]);

    if (loading) return <LoadingState />;

    return (
        <div className="density-gap-page">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Usage Dashboard</h3>
                <div className="flex gap-1">
                    {(["7d", "30d", "90d"] as const).map((p) => (
                        <Button
                            key={p}
                            variant={period === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPeriod(p)}
                        >
                            {p}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 density-gap-card sm:grid-cols-4">
                <MetricCard label="Total Requests" value={totals.requests.toLocaleString()} />
                <MetricCard label="Input Tokens" value={formatTokens(totals.input_tokens)} />
                <MetricCard label="Output Tokens" value={formatTokens(totals.output_tokens)} />
                <MetricCard label="Estimated Cost" value={formatCurrency(totals.cost)} />
            </div>

            {usage.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Daily Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 sm:grid-cols-5 text-xs font-medium text-muted-foreground pb-2 border-b">
                                <span>Date</span>
                                <span className="text-right">Requests</span>
                                <span className="text-right">Input Tokens</span>
                                <span className="text-right">Output Tokens</span>
                                <span className="text-right">Cost</span>
                            </div>
                            {usage.slice(0, 30).map((row) => (
                                <div
                                    key={row.date}
                                    className="grid grid-cols-2 sm:grid-cols-5 text-sm py-1"
                                >
                                    <span className="text-muted-foreground">
                                        {new Date(row.date).toLocaleDateString()}
                                    </span>
                                    <span className="text-right">{row.request_count}</span>
                                    <span className="text-right">
                                        {formatTokens(row.total_input_tokens)}
                                    </span>
                                    <span className="text-right">
                                        {formatTokens(row.total_output_tokens)}
                                    </span>
                                    <span className="text-right">${row.total_cost.toFixed(4)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <EmptyState
                    icon={<Gauge className="h-10 w-10" />}
                    title="No usage data"
                    description="Usage data will appear once the copilot is active."
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Knowledge Base Panel
// ═══════════════════════════════════════════════════════════════

function KnowledgeBasePanel() {
    const [documents, setDocuments] = useState<DocumentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    const fetchDocs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai/documents");
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents ?? []);
            }
        } catch {
            addToast({ title: "Failed to load documents", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchDocs();
    }, [fetchDocs]);

    const handleUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploading(true);
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("source_type", "upload");

                const res = await fetch("/api/ai/documents/upload", {
                    method: "POST",
                    headers: csrfHeaders(),
                    body: formData,
                });

                if (res.ok) {
                    addToast({ title: "Document uploaded and processing started" });
                    fetchDocs();
                } else {
                    const err = await res.json();
                    addToast({ title: err.error ?? "Upload failed", variant: "destructive" });
                }
            } catch {
                addToast({ title: "Upload failed", variant: "destructive" });
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        },
        [addToast, fetchDocs]
    );

    const deleteDoc = useCallback(
        async (id: string) => {
            try {
                await fetch(`/api/ai/documents/${id}`, {
                    method: "DELETE",
                    headers: csrfHeaders(),
                });
                setDocuments((prev) => prev.filter((d) => d.id !== id));
                addToast({ title: "Document deleted" });
            } catch {
                addToast({ title: "Failed to delete document", variant: "destructive" });
            }
        },
        [addToast]
    );

    if (loading) return <LoadingState />;

    return (
        <div className="density-gap-section">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Knowledge Base</h3>
                <div className="flex gap-2">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.xlsx,.txt,.md,.csv,.html"
                        onChange={handleUpload}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <Loader2 className="h-4 w-4 motion-safe:animate-spin mr-2" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Document
                    </Button>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Upload documents (PDF, DOCX, XLSX, TXT, MD, CSV, HTML) to build the copilot&apos;s
                knowledge base. Documents are chunked, embedded, and made available for semantic
                search.
            </p>

            <div className="grid gap-3">
                {documents.map((doc) => (
                    <Card key={doc.id} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <Database className="h-5 w-5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{doc.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {doc.source_type} · {formatFileSize(doc.file_size)} ·{" "}
                                        {doc.chunk_count} chunks · {formatTokens(doc.total_tokens)}{" "}
                                        tokens
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <StatusBadge status={doc.processing_status} />
                                <Button variant="ghost" size="sm" onClick={() => deleteDoc(doc.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {documents.length === 0 && (
                <EmptyState
                    icon={<Database className="h-10 w-10" />}
                    title="No documents"
                    description="Upload documents to build the copilot's knowledge base."
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Limits Panel
// ═══════════════════════════════════════════════════════════════

function LimitsPanel() {
    const [limits, setLimits] = useState<LimitRow[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/ai/limits");
                if (res.ok) {
                    const data = await res.json();
                    setLimits(data.limits ?? []);
                }
            } catch {
                addToast({ title: "Failed to load limits", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        })();
    }, [addToast]);

    if (loading) return <LoadingState />;

    return (
        <div className="density-gap-section">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Usage Limits</h3>
                <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Limit
                </Button>
            </div>

            <p className="text-sm text-muted-foreground">
                Set daily and monthly token budgets per role or organization-wide.
            </p>

            {limits.map((limit) => (
                <Card key={limit.id}>
                    <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {limit.role_id ? `Role: ${limit.role_id}` : "Organization-wide"}
                                </span>
                            </div>
                            <Badge variant={limit.active ? "default" : "secondary"}>
                                {limit.active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 density-gap-card text-sm">
                            <div>
                                <p className="text-muted-foreground">Daily Limit</p>
                                <p className="font-medium">
                                    {formatTokens(limit.daily_token_limit)} tokens
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Monthly Limit</p>
                                <p className="font-medium">
                                    {formatTokens(limit.monthly_token_limit)} tokens
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Max Context / Request</p>
                                <p className="font-medium">
                                    {formatTokens(limit.max_context_per_request)} tokens
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {limits.length === 0 && (
                <EmptyState
                    icon={<Shield className="h-10 w-10" />}
                    title="No limits configured"
                    description="Without limits, all users have unlimited copilot usage. Add limits to control token consumption."
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Shared Components
// ═══════════════════════════════════════════════════════════════

function LoadingState() {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 motion-safe:animate-spin text-muted-foreground" />
        </div>
    );
}

function EmptyState({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="text-muted-foreground">{icon}</div>
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        </div>
    );
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <Card className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
}

// ─── Formatters ──────────────────────────────────────────────

function formatTokens(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
    return count.toString();
}

function formatFileSize(bytes: number): string {
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
    return `${bytes} B`;
}
