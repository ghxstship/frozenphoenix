"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "./client";
import { clearWorkspaceContext } from "@/hooks/use-workspace-context";
import type { Session, User } from "@supabase/supabase-js";
import type { Database, Tables } from "./database.types";
import { logAuthEvent } from "./auth-audit";

type Profile = Tables<"user_profiles">;
type OrgMembershipStatus = Database["public"]["Enums"]["org_membership_status"];

// ─── Org Membership (lightweight shape for context) ────────────
interface OrgMembership {
    id: string;
    user_id: string;
    organization_id: string;
    role: string;
    status: OrgMembershipStatus;
    is_default_org: boolean;
    is_owner: boolean;
    organizations: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    username: string | null;
    session: Session | null;
    loading: boolean;
    memberships: OrgMembership[];
    activeOrg: OrgMembership | null;
    isOwner: boolean;
    /** True when the user signed up via Bluesky and has a placeholder @atproto.local email */
    needsEmailCollection: boolean;
    switchOrg: (orgId: string) => void;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AUTH_ACTIVE_ORG_KEY = "fp-active-org-id";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [memberships, setMemberships] = useState<OrgMembership[]>([]);
    const [activeOrgId, setActiveOrgId] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(AUTH_ACTIVE_ORG_KEY);
        }
        return null;
    });
    const [loading, setLoading] = useState(true);

    const supabase = useMemo(() => createClient(), []);

    // Derive active org + owner flag from memberships + stored preference
    const activeOrg = useMemo(() => {
        if (memberships.length === 0) return null;
        if (activeOrgId) {
            const match = memberships.find((m) => m.organization_id === activeOrgId);
            if (match) return match;
        }
        // Fallback: default org, or first membership
        return memberships.find((m) => m.is_default_org) ?? memberships[0] ?? null;
    }, [memberships, activeOrgId]);

    const isOwner = useMemo(() => activeOrg?.is_owner === true, [activeOrg]);

    const switchOrg = useCallback((orgId: string) => {
        clearWorkspaceContext();
        setActiveOrgId(orgId);
        if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_ACTIVE_ORG_KEY, orgId);
            // Invalidate middleware cache cookies so the next request
            // triggers a fresh DB lookup with the new org's role/permissions.
            const cookiesToClear = [
                "fp-user-role",
                "fp-org-id",
                "fp-lifecycle-status",
                "fp-onboarding-complete",
            ];
            for (const name of cookiesToClear) {
                document.cookie = `${name}=; path=/; max-age=0`;
            }
        }
    }, []);

    const fetchMemberships = useCallback(
        async (userId: string) => {
            if (!supabase) return;
            const { data } = await supabase
                .from("org_memberships")
                .select(
                    "id, user_id, organization_id, role, status, is_default_org, is_owner, organizations(id, name, slug)"
                )
                .eq("user_id", userId)
                .eq("status", "active");

            if (data && data.length > 0) {
                setMemberships(data);
                return;
            }

            // No org_memberships — create one in the default org
            const { data: defaultOrg } = await supabase
                .from("organizations")
                .select("id")
                .eq("slug", "default")
                .single();

            if (defaultOrg) {
                const { data: created } = await supabase
                    .from("org_memberships")
                    .upsert(
                        {
                            user_id: userId,
                            organization_id: defaultOrg.id,
                            role: "member",
                            status: "active",
                            is_default_org: true,
                            is_owner: false,
                        },
                        { onConflict: "user_id,organization_id" }
                    )
                    .select(
                        "id, user_id, organization_id, role, status, is_default_org, is_owner, organizations(id, name, slug)"
                    )
                    .single();

                if (created) {
                    setMemberships([created]);
                }
            }
        },
        [supabase]
    );

    const fetchProfile = useCallback(
        async (userId: string) => {
            if (!supabase) return;
            const { data } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (data) {
                setProfile(data as Profile);
                return;
            }

            // Profile row missing — DB trigger may have failed.
            // Create it from auth metadata so the user is never stuck as "Guest".
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            if (!authUser) return;

            const displayName =
                authUser.user_metadata?.name ||
                authUser.user_metadata?.full_name ||
                authUser.email?.split("@")[0] ||
                "User";

            const { data: created } = await supabase
                .from("user_profiles")
                .upsert(
                    {
                        id: userId,
                        email: authUser.email ?? "",
                        display_name: displayName,
                    },
                    { onConflict: "id" }
                )
                .select("*")
                .single();

            setProfile((created as Profile | null) ?? null);
        },
        [supabase]
    );

    // Performance: username derived from profile (SELECT * already fetches it).
    // Eliminates 1 redundant Supabase round-trip per page load.
    const username = useMemo(() => {
        if (!profile) return null;
        return ((profile as Record<string, unknown>).username as string | null) ?? null;
    }, [profile]);

    // BUG-006: Bluesky users get a placeholder @atproto.local email.
    // Surface a flag so UI can prompt for real email collection.
    const needsEmailCollection = useMemo(() => {
        if (!profile) return false;
        return typeof profile.email === "string" && profile.email.endsWith("@atproto.local");
    }, [profile]);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await Promise.all([fetchProfile(user.id), fetchMemberships(user.id)]);
        }
    }, [user, fetchProfile, fetchMemberships]);

    const signOut = useCallback(async () => {
        // Audit: log the logout event before clearing session
        logAuthEvent("logout");

        // Revoke tracked session (fire-and-forget)
        fetch("/api/auth/session-track", { method: "DELETE", keepalive: true }).catch(() => {});

        // Clear persisted preferences
        if (typeof window !== "undefined") {
            localStorage.removeItem(AUTH_ACTIVE_ORG_KEY);
        }

        // Clear server-side session cookies via API route
        try {
            await fetch("/api/auth/signout", { method: "POST" });
        } catch {
            // Best-effort — continue with client-side signOut
        }

        // Client-side signOut (clears local Supabase tokens).
        // Do NOT await — we navigate immediately to avoid the onAuthStateChange
        // callback re-rendering the current page in an unauthenticated state.
        if (supabase) {
            supabase.auth.signOut();
        }

        // Hard navigation to /login ensures middleware sees cleared cookies.
        // This must happen synchronously after signOut to prevent the race
        // where onAuthStateChange fires and the page re-renders without a user.
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }, [supabase]);

    useEffect(() => {
        if (!supabase) {
            return;
        }

        const initSession = async () => {
            // getUser() validates the token server-side and refreshes it if
            // expired. getSession() only reads from local storage and will
            // return a stale/expired token after a hard refresh, causing the
            // user to be kicked out.
            const {
                data: { user: validatedUser },
            } = await supabase.auth.getUser();

            if (validatedUser) {
                // Token is now refreshed — getSession() will return the fresh session.
                const {
                    data: { session: freshSession },
                } = await supabase.auth.getSession();

                setSession(freshSession);
                setUser(validatedUser);

                await Promise.all([
                    fetchProfile(validatedUser.id),
                    fetchMemberships(validatedUser.id),
                ]);
            } else {
                setSession(null);
                setUser(null);
            }

            setLoading(false);
        };

        initSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Audit: log successful sign-in events + track session
            if (event === "SIGNED_IN" && session?.user) {
                logAuthEvent("login_success", {
                    auth_method: session.user.app_metadata?.provider ?? "unknown",
                    email: session.user.email ?? "unknown",
                });
                // Track session (fire-and-forget)
                fetch("/api/auth/session-track", { method: "POST", keepalive: true }).catch(
                    () => {}
                );
            }

            if (session?.user) {
                await Promise.all([
                    fetchProfile(session.user.id),
                    fetchMemberships(session.user.id),
                ]);
            } else {
                setProfile(null);
                setMemberships([]);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, fetchProfile, fetchMemberships]);

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                username,
                session,
                loading,
                memberships,
                activeOrg,
                isOwner,
                needsEmailCollection,
                switchOrg,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
