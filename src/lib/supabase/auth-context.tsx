"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
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

const MEMBERSHIP_SELECT =
    "id, user_id, organization_id, role, status, is_default_org, is_owner, organizations(id, name, slug)" as const;

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
    const supabase = useMemo(() => createClient(), []);

    // When supabase is not configured, there is nothing to load — start as false.
    const [loading, setLoading] = useState(() => supabase !== null);

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
            const { data, error } = await supabase
                .from("org_memberships")
                .select(MEMBERSHIP_SELECT)
                .eq("user_id", userId)
                .eq("status", "active");

            if (data && data.length > 0) {
                setMemberships(data);
                return;
            }

            // Only create a default membership when the query succeeded with
            // zero rows. If the query itself failed (RLS, network), do NOT
            // fall through — that would spuriously create a duplicate membership.
            if (error) return;

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
                    .select(MEMBERSHIP_SELECT)
                    .single();

                if (created) {
                    setMemberships([created]);
                }
            }
        },
        [supabase]
    );

    // Accepts an optional authUser so the fallback path doesn't need a
    // redundant getUser() round-trip when we already have the validated user.
    const fetchProfile = useCallback(
        async (userId: string, authUser?: User) => {
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
            const resolvedUser = authUser ?? (await supabase.auth.getUser()).data.user;
            if (!resolvedUser) return;

            const displayName =
                resolvedUser.user_metadata?.name ||
                resolvedUser.user_metadata?.full_name ||
                resolvedUser.email?.split("@")[0] ||
                "User";

            const { data: created } = await supabase
                .from("user_profiles")
                .upsert(
                    {
                        id: userId,
                        email: resolvedUser.email ?? "",
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

    // Stable refs for functions called inside useEffect — prevents the effect
    // from re-running (and re-subscribing) when these callbacks are recreated.
    const fetchProfileRef = useRef(fetchProfile);
    const fetchMembershipsRef = useRef(fetchMemberships);
    useEffect(() => {
        fetchProfileRef.current = fetchProfile;
        fetchMembershipsRef.current = fetchMemberships;
    }, [fetchProfile, fetchMemberships]);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await Promise.all([
                fetchProfileRef.current(user.id),
                fetchMembershipsRef.current(user.id),
            ]);
        }
    }, [user]);

    const signOut = useCallback(async () => {
        // Prevent onAuthStateChange from processing SIGNED_OUT events
        // that would flash the UI in an unauthenticated state.
        signingOutRef.current = true;

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
        // Must complete before navigation so back-button doesn't see stale tokens.
        if (supabase) {
            await supabase.auth.signOut();
        }

        // Hard navigation to /login ensures middleware sees cleared cookies.
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }, [supabase]);

    // Tracks whether initSession has completed. Prevents onAuthStateChange's
    // INITIAL_SESSION event from clobbering the server-validated state with a
    // stale/null local session — the root cause of the "Not signed in" flash.
    const initDoneRef = useRef(false);

    // Tracks whether signOut is in progress. When true, onAuthStateChange
    // events are ignored to prevent re-rendering in an unauthenticated state
    // before the hard navigation to /login completes.
    const signingOutRef = useRef(false);

    useEffect(() => {
        if (!supabase) {
            // Supabase not configured — loading already initialized to false
            // via the lazy initializer, so no setState needed here.
            return;
        }

        initDoneRef.current = false;
        let cancelled = false;

        const initSession = async () => {
            try {
                // getUser() validates the token server-side and refreshes it if
                // expired. getSession() only reads from local storage and will
                // return a stale/expired token after a hard refresh, causing the
                // user to be kicked out.
                const {
                    data: { user: validatedUser },
                } = await supabase.auth.getUser();

                if (cancelled) return;

                if (validatedUser) {
                    // Token is now refreshed — getSession() will return the fresh session.
                    const {
                        data: { session: freshSession },
                    } = await supabase.auth.getSession();

                    if (cancelled) return;

                    setSession(freshSession);
                    setUser(validatedUser);

                    await Promise.all([
                        fetchProfileRef.current(validatedUser.id, validatedUser),
                        fetchMembershipsRef.current(validatedUser.id),
                    ]);
                } else {
                    setSession(null);
                    setUser(null);
                }
            } catch {
                // Network failure during init — clear state so the UI doesn't
                // hang on loading=true forever.
                if (!cancelled) {
                    setSession(null);
                    setUser(null);
                }
            }

            if (!cancelled) {
                setLoading(false);
                initDoneRef.current = true;
            }
        };

        initSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            // Skip INITIAL_SESSION — initSession() already handles the initial
            // load with server-validated getUser(). The INITIAL_SESSION event
            // fires synchronously with the (potentially stale/null) local
            // storage session and would clobber the validated state.
            if (event === "INITIAL_SESSION") return;

            // Until initSession completes, ignore listener events to prevent
            // races where TOKEN_REFRESHED fires before initSession's getUser()
            // resolves, setting loading=false with incomplete profile/memberships.
            if (!initDoneRef.current) return;

            // During signOut, ignore all events to prevent flash of unauth state.
            if (signingOutRef.current) return;

            // TOKEN_REFRESHED only updates the session object (new JWT).
            // No need to re-fetch profile/memberships — they haven't changed.
            if (event === "TOKEN_REFRESHED") {
                setSession(newSession);
                return;
            }

            setSession(newSession);
            setUser(newSession?.user ?? null);

            // Audit: log successful sign-in events + track session
            if (event === "SIGNED_IN" && newSession?.user) {
                logAuthEvent("login_success", {
                    auth_method: newSession.user.app_metadata?.provider ?? "unknown",
                    email: newSession.user.email ?? "unknown",
                });
                // Track session (fire-and-forget)
                fetch("/api/auth/session-track", { method: "POST", keepalive: true }).catch(
                    () => {}
                );
            }

            if (newSession?.user) {
                await Promise.all([
                    fetchProfileRef.current(newSession.user.id, newSession.user),
                    fetchMembershipsRef.current(newSession.user.id),
                ]);
            } else {
                setProfile(null);
                setMemberships([]);
            }

            setLoading(false);
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [supabase]);

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
