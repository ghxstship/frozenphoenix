"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
    BarChart2,
    Calendar,
    Copy,
    Download,
    Link2,
    Loader2,
    Plus,
    Power,
    PowerOff,
    QrCode,
    Users,
} from "lucide-react";
import type { InviteCode } from "@/types/harbor-master";

export default function InviteCodesPage() {
    const { activeOrg } = useAuth();
    const { addToast } = useToast();

    const [codes, setCodes] = useState<InviteCode[]>([]);
    const [roles, setRoles] = useState<Array<{ id: string; name: string; slug: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [generateOpen, setGenerateOpen] = useState(false);

    // Generate form state
    const [genRoleId, setGenRoleId] = useState("");
    const [genCount, setGenCount] = useState(1);
    const [genMaxUses, setGenMaxUses] = useState<number | "">("");
    const [genExpiry, setGenExpiry] = useState("");
    const [genRequiresApproval, setGenRequiresApproval] = useState(false);

    const orgId = activeOrg?.organization_id;

    const fetchCodes = useCallback(async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const res = await fetch(
                `/api/invite-codes?organization_id=${encodeURIComponent(orgId)}`
            );
            if (!res.ok) throw new Error("Failed to load");
            const data = (await res.json()) as { codes: InviteCode[] };
            setCodes(data.codes ?? []);
        } catch {
            addToast({ title: "Failed to load invite codes", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [orgId, addToast]);

    const fetchRoles = useCallback(async () => {
        if (!orgId) return;
        try {
            const res = await fetch(`/api/roles?organization_id=${encodeURIComponent(orgId)}`);
            if (!res.ok) return;
            const data = (await res.json()) as {
                roles: Array<{ id: string; name: string; slug: string }>;
            };
            setRoles(data.roles ?? []);
        } catch {
            // silently ignore
        }
    }, [orgId]);

    useEffect(() => {
        void fetchCodes();
        void fetchRoles();
    }, [fetchCodes, fetchRoles]);

    const handleGenerate = async () => {
        if (!orgId || !genRoleId) return;
        setGenerating(true);
        try {
            const payload = {
                organization_id: orgId,
                role_id: genRoleId,
                count: genCount,
                requires_approval: genRequiresApproval,
                ...(genMaxUses !== "" ? { max_uses: Number(genMaxUses) } : {}),
                ...(genExpiry ? { expires_at: new Date(genExpiry).toISOString() } : {}),
            };
            const res = await fetch("/api/invite-codes/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = (await res.json()) as {
                codes?: Array<{ id: string; code: string; url: string }>;
            };
            if (!res.ok) {
                addToast({
                    title: "Failed to generate codes",
                    description: (data as { error?: string }).error,
                    variant: "destructive",
                });
                return;
            }
            addToast({
                title: `${(data.codes ?? []).length} code${genCount > 1 ? "s" : ""} generated`,
                description: "Codes are ready to share or distribute.",
            });
            setGenerateOpen(false);
            void fetchCodes();
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (url: string, code: string) => {
        void navigator.clipboard.writeText(url);
        addToast({ title: "Copied", description: `Link for ${code} copied to clipboard.` });
    };

    const exportCsv = async () => {
        if (!orgId) return;
        const codeIds = codes.filter((c) => c.is_active).map((c) => c.id);
        if (codeIds.length === 0) {
            addToast({ title: "No active codes to export", variant: "destructive" });
            return;
        }
        const res = await fetch("/api/invite-codes/distribute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invite_code_ids: codeIds, method: "csv" }),
        });
        if (!res.ok) {
            addToast({ title: "Export failed", variant: "destructive" });
            return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invite-codes-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleCode = async (codeId: string, currentState: boolean) => {
        const res = await fetch(`/api/invite-codes/${encodeURIComponent(codeId)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: !currentState }),
        });
        if (!res.ok) {
            addToast({ title: "Failed to update code status", variant: "destructive" });
            return;
        }
        setCodes((prev) =>
            prev.map((c) => (c.id === codeId ? { ...c, is_active: !currentState } : c))
        );
    };

    const appUrl = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <div className="harbor-codes-page">
            <div className="harbor-codes-header">
                <div>
                    <h1 className="harbor-codes-title">Invite Codes</h1>
                    <p className="harbor-codes-subtitle">
                        Generate and manage shareable codes that let people join your organization.
                    </p>
                </div>
                <div className="harbor-codes-actions">
                    <Button
                        id="export-invite-codes-csv"
                        variant="outline"
                        size="sm"
                        onClick={() => void exportCsv()}
                    >
                        <Download className="harbor-action-icon" />
                        Export CSV
                    </Button>
                    <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
                        <DialogTrigger asChild>
                            <Button id="generate-invite-codes-btn" size="sm">
                                <Plus className="harbor-action-icon" />
                                Generate Codes
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="harbor-dialog">
                            <DialogHeader>
                                <DialogTitle>Generate Invite Codes</DialogTitle>
                                <DialogDescription>
                                    Create one or more codes people can use to join your
                                    organization.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="harbor-dialog-form">
                                <div className="harbor-field">
                                    <Label htmlFor="gen-role">Role assigned on join</Label>
                                    <Select value={genRoleId} onValueChange={setGenRoleId}>
                                        <SelectTrigger id="gen-role">
                                            <SelectValue placeholder="Select a role…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    {r.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="harbor-field-row">
                                    <div className="harbor-field">
                                        <Label htmlFor="gen-count">Number of codes</Label>
                                        <Input
                                            id="gen-count"
                                            type="number"
                                            min={1}
                                            max={500}
                                            value={genCount}
                                            onChange={(e) => setGenCount(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="harbor-field">
                                        <Label htmlFor="gen-max-uses">Max uses per code</Label>
                                        <Input
                                            id="gen-max-uses"
                                            type="number"
                                            min={1}
                                            placeholder="Unlimited"
                                            value={genMaxUses}
                                            onChange={(e) =>
                                                setGenMaxUses(
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="harbor-field">
                                    <Label htmlFor="gen-expiry">Expiry date (optional)</Label>
                                    <Input
                                        id="gen-expiry"
                                        type="datetime-local"
                                        value={genExpiry}
                                        onChange={(e) => setGenExpiry(e.target.value)}
                                    />
                                </div>

                                <div className="harbor-toggle-row">
                                    <div>
                                        <p className="harbor-toggle-label">
                                            Require admin approval
                                        </p>
                                        <p className="harbor-toggle-desc">
                                            Redeemers join as pending until an admin approves.
                                        </p>
                                    </div>
                                    <Checkbox
                                        id="gen-requires-approval"
                                        checked={genRequiresApproval}
                                        onCheckedChange={(checked) =>
                                            setGenRequiresApproval(checked === true)
                                        }
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setGenerateOpen(false)}
                                    disabled={generating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    id="confirm-generate-codes"
                                    onClick={() => void handleGenerate()}
                                    disabled={!genRoleId || generating}
                                >
                                    {generating ? <Loader2 className="harbor-spinner" /> : null}
                                    Generate {genCount > 1 ? `${genCount} Codes` : "Code"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Code list */}
            {loading ? (
                <div className="harbor-loading">
                    <Loader2 className="harbor-spinner-lg" />
                    <span>Loading codes…</span>
                </div>
            ) : codes.length === 0 ? (
                <div className="harbor-empty">
                    <QrCode className="harbor-empty-icon" />
                    <p className="harbor-empty-title">No invite codes yet</p>
                    <p className="harbor-empty-desc">
                        Generate codes and share them to let people join without individual
                        invitations.
                    </p>
                    <Button
                        id="empty-generate-codes-btn"
                        size="sm"
                        onClick={() => setGenerateOpen(true)}
                    >
                        <Plus className="harbor-action-icon" />
                        Generate your first code
                    </Button>
                </div>
            ) : (
                <div className="harbor-codes-grid">
                    {codes.map((code) => {
                        const codeUrl = `${appUrl}/join?code=${encodeURIComponent(code.code)}`;
                        const isExpired =
                            code.expires_at != null && new Date(code.expires_at) < new Date();
                        const isDepleted =
                            code.max_uses != null && code.current_uses >= code.max_uses;

                        return (
                            <div
                                key={code.id}
                                className={`harbor-code-card${!code.is_active ? " harbor-code-card--inactive" : ""}`}
                            >
                                <div className="harbor-code-top">
                                    <div className="harbor-code-name">
                                        <code className="harbor-code-text">{code.code}</code>
                                        <div className="harbor-code-badges">
                                            {!code.is_active && (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                            {isExpired && (
                                                <Badge variant="destructive">Expired</Badge>
                                            )}
                                            {isDepleted && (
                                                <Badge variant="destructive">Depleted</Badge>
                                            )}
                                            {code.requires_approval && (
                                                <Badge variant="outline">Approval required</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="harbor-code-controls">
                                        <Button
                                            id={`toggle-code-${code.id}`}
                                            variant="ghost"
                                            size="icon"
                                            className="harbor-icon-btn"
                                            title={code.is_active ? "Deactivate" : "Activate"}
                                            onClick={() => void toggleCode(code.id, code.is_active)}
                                        >
                                            {code.is_active ? (
                                                <Power className="harbor-control-icon text-success" />
                                            ) : (
                                                <PowerOff className="harbor-control-icon" />
                                            )}
                                        </Button>
                                        <Button
                                            id={`copy-code-${code.id}`}
                                            variant="ghost"
                                            size="icon"
                                            className="harbor-icon-btn"
                                            title="Copy invite link"
                                            onClick={() => copyToClipboard(codeUrl, code.code)}
                                        >
                                            <Copy className="harbor-control-icon" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="harbor-code-meta">
                                    <span className="harbor-meta-item">
                                        <BarChart2 className="harbor-meta-icon" />
                                        {code.current_uses}
                                        {code.max_uses != null ? ` / ${code.max_uses}` : ""} uses
                                    </span>
                                    {code.expires_at && (
                                        <span className="harbor-meta-item">
                                            <Calendar className="harbor-meta-icon" />
                                            Expires{" "}
                                            {new Date(code.expires_at).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                    )}
                                    {code.role && (
                                        <span className="harbor-meta-item">
                                            <Users className="harbor-meta-icon" />
                                            {(code.role as { name?: string } | null)?.name ?? "—"}
                                        </span>
                                    )}
                                </div>

                                <div className="harbor-code-url">
                                    <Link2 className="harbor-url-icon" />
                                    <span className="harbor-url-text">{codeUrl}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .harbor-codes-page {
                    padding: 1.5rem;
                    max-width: 1100px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .harbor-codes-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .harbor-codes-title {
                    font-size: 1.375rem;
                    font-weight: 700;
                    letter-spacing: -0.015em;
                    color: var(--color-text-primary, #f4f4f5);
                    margin: 0;
                }
                .harbor-codes-subtitle {
                    font-size: 0.875rem;
                    color: var(--color-text-muted, #a1a1aa);
                    margin: 0.25rem 0 0;
                }
                .harbor-codes-actions {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                    flex-shrink: 0;
                }
                .harbor-action-icon {
                    width: 0.875rem;
                    height: 0.875rem;
                    margin-right: 0.375rem;
                }
                .harbor-dialog {
                    max-width: 480px;
                }
                .harbor-dialog-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 0.25rem 0;
                }
                .harbor-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.375rem;
                    flex: 1;
                }
                .harbor-field-row {
                    display: flex;
                    gap: 0.75rem;
                }
                .harbor-toggle-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    background: var(--color-surface-subtle, rgba(255,255,255,0.04));
                    border: 1px solid var(--color-border, rgba(255,255,255,0.08));
                }
                .harbor-toggle-label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin: 0;
                }
                .harbor-toggle-desc {
                    font-size: 0.75rem;
                    color: var(--color-text-muted, #a1a1aa);
                    margin: 0.125rem 0 0;
                }
                .harbor-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 4rem 2rem;
                    color: var(--color-text-muted, #a1a1aa);
                    font-size: 0.875rem;
                }
                .harbor-spinner {
                    width: 1rem;
                    height: 1rem;
                    animation: spin 1s linear infinite;
                }
                .harbor-spinner-lg {
                    width: 1.5rem;
                    height: 1.5rem;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .harbor-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 4rem 2rem;
                    text-align: center;
                    border-radius: 0.75rem;
                    border: 1px dashed var(--color-border, rgba(255,255,255,0.1));
                }
                .harbor-empty-icon {
                    width: 2.5rem;
                    height: 2.5rem;
                    color: var(--color-text-muted, #71717a);
                }
                .harbor-empty-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                }
                .harbor-empty-desc {
                    font-size: 0.875rem;
                    color: var(--color-text-muted, #a1a1aa);
                    max-width: 360px;
                    margin: 0;
                }
                .harbor-codes-grid {
                    display: grid;
                    gap: 0.75rem;
                }
                .harbor-code-card {
                    border-radius: 0.75rem;
                    border: 1px solid var(--color-border, rgba(255,255,255,0.1));
                    background: var(--color-surface-card, rgba(255,255,255,0.03));
                    padding: 1rem 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.625rem;
                    transition: border-color 0.15s ease, background 0.15s ease;
                }
                .harbor-code-card:hover {
                    border-color: var(--color-border-hover, rgba(255,255,255,0.18));
                    background: var(--color-surface-card-hover, rgba(255,255,255,0.055));
                }
                .harbor-code-card--inactive {
                    opacity: 0.55;
                }
                .harbor-code-top {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 0.75rem;
                }
                .harbor-code-name {
                    display: flex;
                    flex-direction: column;
                    gap: 0.375rem;
                    min-width: 0;
                }
                .harbor-code-text {
                    font-family: ui-monospace, 'Cascadia Code', monospace;
                    font-size: 0.9rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    color: var(--color-accent, #a78bfa);
                    word-break: break-all;
                }
                .harbor-code-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.375rem;
                }
                .harbor-code-controls {
                    display: flex;
                    gap: 0.25rem;
                    flex-shrink: 0;
                }
                .harbor-icon-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 0.375rem;
                    background: transparent;
                    border: 1px solid transparent;
                    cursor: pointer;
                    transition: background 0.12s, border-color 0.12s;
                    color: var(--color-text-muted, #a1a1aa);
                }
                .harbor-icon-btn:hover {
                    background: var(--color-surface-subtle, rgba(255,255,255,0.06));
                    border-color: var(--color-border, rgba(255,255,255,0.1));
                    color: var(--color-text-primary, #f4f4f5);
                }
                .harbor-control-icon {
                    width: 0.875rem;
                    height: 0.875rem;
                }
                .harbor-control-icon--active {
                    color: hsl(var(--success));
                }
                .harbor-code-meta {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .harbor-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.75rem;
                    color: var(--color-text-muted, #a1a1aa);
                }
                .harbor-meta-icon {
                    width: 0.75rem;
                    height: 0.75rem;
                }
                .harbor-code-url {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.4rem 0.6rem;
                    border-radius: 0.375rem;
                    background: var(--color-surface-subtle, rgba(255,255,255,0.04));
                    border: 1px solid var(--color-border, rgba(255,255,255,0.06));
                    min-width: 0;
                }
                .harbor-url-icon {
                    width: 0.75rem;
                    height: 0.75rem;
                    color: var(--color-text-muted, #71717a);
                    flex-shrink: 0;
                }
                .harbor-url-text {
                    font-size: 0.72rem;
                    font-family: ui-monospace, monospace;
                    color: var(--color-text-muted, #a1a1aa);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `}</style>
        </div>
    );
}
