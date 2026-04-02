"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Building2, CheckCircle, Clock, Inbox, Loader2, UserX } from "lucide-react";
import type { JoinRequest } from "@/types/harbor-master";

type ReviewAction = "approve" | "deny";

export default function JoinRequestsPage() {
    const { activeOrg } = useAuth();
    const { addToast } = useToast();

    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewTarget, setReviewTarget] = useState<JoinRequest | null>(null);
    const [reviewAction, setReviewAction] = useState<ReviewAction>("approve");
    const [denyReason, setDenyReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "denied">("pending");

    const orgId = activeOrg?.organization_id;

    const fetchRequests = useCallback(async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                organization_id: orgId,
                status: statusFilter,
            });
            const res = await fetch(`/api/join-requests/review?${params.toString()}`);
            const data = (await res.json()) as { join_requests: JoinRequest[] };
            setRequests(data.join_requests ?? []);
        } catch {
            addToast({ title: "Failed to load join requests", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [orgId, statusFilter, addToast]);

    useEffect(() => {
        void fetchRequests();
    }, [fetchRequests]);

    const openReview = (req: JoinRequest, action: ReviewAction) => {
        setReviewTarget(req);
        setReviewAction(action);
        setDenyReason("");
    };

    const submitReview = async () => {
        if (!reviewTarget) return;
        setSubmitting(true);
        try {
            const payload = {
                join_request_id: reviewTarget.id,
                action: reviewAction,
                ...(reviewAction === "deny" && denyReason ? { deny_reason: denyReason } : {}),
            };
            const res = await fetch("/api/join-requests/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = (await res.json()) as { error?: string };
            if (!res.ok) {
                addToast({
                    title: `Failed to ${reviewAction} request`,
                    description: data.error,
                    variant: "destructive",
                });
                return;
            }
            addToast({
                title: reviewAction === "approve" ? "Request approved" : "Request denied",
                description:
                    reviewAction === "approve"
                        ? `${reviewTarget?.user_profiles?.display_name ?? "User"} has been added to the organization.`
                        : `${reviewTarget?.user_profiles?.display_name ?? "User"}'s request was denied.`,
            });
            setReviewTarget(null);
            void fetchRequests();
        } finally {
            setSubmitting(false);
        }
    };

    const initials = (name?: string | null) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const STATUS_TABS: Array<{ key: "pending" | "approved" | "denied"; label: string }> = [
        { key: "pending", label: "Pending" },
        { key: "approved", label: "Approved" },
        { key: "denied", label: "Denied" },
    ];

    return (
        <div className="harbor-jr-page">
            <div className="harbor-jr-header">
                <div>
                    <h1 className="harbor-jr-title">Join Requests</h1>
                    <p className="harbor-jr-subtitle">
                        Review and approve requests from users who want to join your organization.
                    </p>
                </div>
            </div>

            {/* Status filter tabs */}
            <div className="harbor-jr-tabs" role="tablist">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        id={`join-requests-tab-${tab.key}`}
                        role="tab"
                        aria-selected={statusFilter === tab.key}
                        className={`harbor-jr-tab${statusFilter === tab.key ? " harbor-jr-tab--active" : ""}`}
                        onClick={() => setStatusFilter(tab.key)}
                    >
                        {tab.label}
                        {tab.key === "pending" &&
                            requests.length > 0 &&
                            statusFilter === "pending" && (
                                <span className="harbor-jr-count">{requests.length}</span>
                            )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="harbor-jr-loading">
                    <Loader2 className="harbor-spinner-lg" />
                    <span>Loading requests…</span>
                </div>
            ) : requests.length === 0 ? (
                <div className="harbor-jr-empty">
                    <Inbox className="harbor-jr-empty-icon" />
                    <p className="harbor-jr-empty-title">
                        {statusFilter === "pending"
                            ? "No pending requests"
                            : `No ${statusFilter} requests`}
                    </p>
                    <p className="harbor-jr-empty-desc">
                        {statusFilter === "pending"
                            ? "When users request to join your organization, they'll appear here for review."
                            : `Requests that were ${statusFilter} will appear here.`}
                    </p>
                </div>
            ) : (
                <div className="harbor-jr-list">
                    {requests.map((req) => {
                        const profile = req.user_profiles;
                        const requestedDate = new Date(req.requested_at).toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }
                        );

                        return (
                            <div key={req.id} className="harbor-jr-card">
                                <div className="harbor-jr-card-left">
                                    <Avatar className="harbor-jr-avatar">
                                        {profile?.avatar_url && (
                                            <AvatarImage
                                                src={profile.avatar_url}
                                                alt={profile.display_name ?? ""}
                                            />
                                        )}
                                        <AvatarFallback className="harbor-jr-avatar-fallback">
                                            {initials(profile?.display_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="harbor-jr-info">
                                        <p className="harbor-jr-name">
                                            {profile?.display_name ?? "Unknown user"}
                                        </p>
                                        <p className="harbor-jr-email">
                                            {profile?.email ?? req.user_id}
                                        </p>
                                        <div className="harbor-jr-meta">
                                            <span className="harbor-jr-meta-item">
                                                <Clock className="harbor-meta-icon" />
                                                Requested {requestedDate}
                                            </span>
                                            {req.project_id && (
                                                <Badge
                                                    variant="outline"
                                                    className="harbor-jr-badge"
                                                >
                                                    Project access
                                                </Badge>
                                            )}
                                            {!req.project_id && (
                                                <span className="harbor-jr-meta-item">
                                                    <Building2 className="harbor-meta-icon" />
                                                    Organization
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="harbor-jr-card-right">
                                    {req.status === "pending" ? (
                                        <>
                                            <Button
                                                id={`deny-request-${req.id}`}
                                                variant="outline"
                                                size="sm"
                                                className="harbor-deny-btn"
                                                onClick={() => openReview(req, "deny")}
                                            >
                                                <UserX className="harbor-btn-icon" />
                                                Deny
                                            </Button>
                                            <Button
                                                id={`approve-request-${req.id}`}
                                                size="sm"
                                                className="harbor-approve-btn"
                                                onClick={() => openReview(req, "approve")}
                                            >
                                                <CheckCircle className="harbor-btn-icon" />
                                                Approve
                                            </Button>
                                        </>
                                    ) : (
                                        <Badge
                                            variant={
                                                req.status === "approved" ? "default" : "secondary"
                                            }
                                            className={
                                                req.status === "approved"
                                                    ? "harbor-badge--approved"
                                                    : "harbor-badge--denied"
                                            }
                                        >
                                            {req.status === "approved" ? "Approved" : "Denied"}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Review dialog */}
            <Dialog open={!!reviewTarget} onOpenChange={(open) => !open && setReviewTarget(null)}>
                <DialogContent className="harbor-review-dialog">
                    <DialogHeader>
                        <DialogTitle>
                            {reviewAction === "approve"
                                ? "Approve join request"
                                : "Deny join request"}
                        </DialogTitle>
                        <DialogDescription>
                            {reviewAction === "approve"
                                ? `${reviewTarget?.user_profiles?.display_name ?? "This user"} will be added as a member with the organization's default role.`
                                : `${reviewTarget?.user_profiles?.display_name ?? "This user"}'s request will be declined. They can reapply.`}
                        </DialogDescription>
                    </DialogHeader>

                    {reviewAction === "deny" && (
                        <div className="harbor-deny-reason">
                            <p className="harbor-deny-reason-label">
                                Reason for denial{" "}
                                <span className="harbor-optional">(optional)</span>
                            </p>
                            <Textarea
                                id="deny-reason-input"
                                placeholder="Provide context so the user understands why their request was denied…"
                                value={denyReason}
                                onChange={(e) => setDenyReason(e.target.value)}
                                rows={3}
                                maxLength={1000}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReviewTarget(null)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            id={`confirm-${reviewAction}-request`}
                            variant={reviewAction === "deny" ? "destructive" : "default"}
                            onClick={() => void submitReview()}
                            disabled={submitting}
                            className={reviewAction === "approve" ? "harbor-approve-btn" : ""}
                        >
                            {submitting && <Loader2 className="harbor-spinner" />}
                            {reviewAction === "approve" ? "Approve" : "Deny"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style>{`
                .harbor-jr-page {
                    padding: 1.5rem;
                    max-width: 900px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .harbor-jr-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                }
                .harbor-jr-title {
                    font-size: 1.375rem;
                    font-weight: 700;
                    letter-spacing: -0.015em;
                    color: var(--color-text-primary, #f4f4f5);
                    margin: 0;
                }
                .harbor-jr-subtitle {
                    font-size: 0.875rem;
                    color: var(--color-text-muted, #a1a1aa);
                    margin: 0.25rem 0 0;
                }
                .harbor-jr-tabs {
                    display: flex;
                    border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.1));
                    gap: 0;
                }
                .harbor-jr-tab {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 1rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--color-text-muted, #a1a1aa);
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    transition: color 0.12s, border-color 0.12s;
                    margin-bottom: -1px;
                }
                .harbor-jr-tab:hover {
                    color: var(--color-text-primary, #f4f4f5);
                }
                .harbor-jr-tab--active {
                    color: var(--color-text-primary, #f4f4f5);
                    border-bottom-color: var(--color-accent, #a78bfa);
                }
                .harbor-jr-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 1.25rem;
                    height: 1.25rem;
                    padding: 0 0.3rem;
                    border-radius: 99px;
                    background: var(--color-accent, #a78bfa);
                    color: #fff;
                    font-size: 0.7rem;
                    font-weight: 700;
                }
                .harbor-jr-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 4rem 2rem;
                    color: var(--color-text-muted, #a1a1aa);
                    font-size: 0.875rem;
                }
                .harbor-spinner-lg {
                    width: 1.5rem;
                    height: 1.5rem;
                    animation: spin 1s linear infinite;
                }
                .harbor-spinner {
                    width: 0.875rem;
                    height: 0.875rem;
                    animation: spin 1s linear infinite;
                    margin-right: 0.375rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .harbor-jr-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 4rem 2rem;
                    text-align: center;
                    border-radius: 0.75rem;
                    border: 1px dashed var(--color-border, rgba(255,255,255,0.1));
                }
                .harbor-jr-empty-icon {
                    width: 2.5rem;
                    height: 2.5rem;
                    color: var(--color-text-muted, #71717a);
                }
                .harbor-jr-empty-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                }
                .harbor-jr-empty-desc {
                    font-size: 0.875rem;
                    color: var(--color-text-muted, #a1a1aa);
                    max-width: 380px;
                    margin: 0;
                }
                .harbor-jr-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.625rem;
                }
                .harbor-jr-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    border-radius: 0.75rem;
                    border: 1px solid var(--color-border, rgba(255,255,255,0.1));
                    background: var(--color-surface-card, rgba(255,255,255,0.03));
                    transition: border-color 0.15s ease, background 0.15s ease;
                }
                .harbor-jr-card:hover {
                    border-color: var(--color-border-hover, rgba(255,255,255,0.16));
                    background: var(--color-surface-card-hover, rgba(255,255,255,0.05));
                }
                .harbor-jr-card-left {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    min-width: 0;
                    flex: 1;
                }
                .harbor-jr-avatar { width: 2.5rem; height: 2.5rem; flex-shrink: 0; }
                .harbor-jr-avatar-fallback {
                    background: var(--color-accent-muted, rgba(167,139,250,0.15));
                    color: var(--color-accent, #a78bfa);
                    font-size: 0.8rem;
                    font-weight: 700;
                }
                .harbor-jr-info { min-width: 0; }
                .harbor-jr-name {
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .harbor-jr-email {
                    font-size: 0.8rem;
                    color: var(--color-text-muted, #a1a1aa);
                    margin: 0.1rem 0 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .harbor-jr-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    flex-wrap: wrap;
                    margin-top: 0.25rem;
                }
                .harbor-jr-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.72rem;
                    color: var(--color-text-muted, #a1a1aa);
                }
                .harbor-jr-badge { font-size: 0.7rem; }
                .harbor-meta-icon { width: 0.7rem; height: 0.7rem; }
                .harbor-jr-card-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }
                .harbor-btn-icon { width: 0.875rem; height: 0.875rem; margin-right: 0.3rem; }
                .harbor-approve-btn { background: #059669 !important; border-color: #059669 !important; }
                .harbor-approve-btn:hover { background: #047857 !important; border-color: #047857 !important; }
                .harbor-deny-btn { color: #f87171 !important; border-color: rgba(248,113,113,0.3) !important; }
                .harbor-deny-btn:hover { background: rgba(248,113,113,0.08) !important; }
                .harbor-badge--approved { background: rgba(5,150,105,0.15) !important; color: #34d399 !important; border: none !important; }
                .harbor-badge--denied { background: rgba(239,68,68,0.12) !important; color: #f87171 !important; border: none !important; }
                .harbor-review-dialog { max-width: 440px; }
                .harbor-deny-reason { display: flex; flex-direction: column; gap: 0.5rem; }
                .harbor-deny-reason-label { font-size: 0.875rem; font-weight: 500; margin: 0; }
                .harbor-optional { font-weight: 400; color: var(--color-text-muted, #71717a); }
            `}</style>
        </div>
    );
}
