"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient, isSupabaseConfigured } from "./client";
import type { Session, User } from "@supabase/supabase-js";
import type { Database, Tables } from "./database.types";

type Profile = Tables<"profiles">;
type OrgMembershipStatus = Database["public"]["Enums"]["org_membership_status"];

// ─── Org Membership (lightweight shape for context) ────────────
interface OrgMembership {
    id: string;
    user_id: string;
    organization_id: string;
    role: string;
    status: OrgMembershipStatus;
    is_default_org: boolean;
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
    switchOrg: (orgId: string) => void;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AUTH_ACTIVE_ORG_KEY = "fp-active-org-id";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [memberships, setMemberships] = useState<OrgMembership[]>([]);
    const [activeOrgId, setActiveOrgId] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(AUTH_ACTIVE_ORG_KEY);
        }
        return null;
    });
    const [loading, setLoading] = useState(!isSupabaseConfigured ? false : true);

    const supabase = useMemo(() => createClient(), []);

    // Derive active org from memberships + stored preference
    const activeOrg = useMemo(() => {
        if (memberships.length === 0) return null;
        if (activeOrgId) {
            const match = memberships.find((m) => m.organization_id === activeOrgId);
            if (match) return match;
        }
        // Fallback: default org, or first membership
        return memberships.find((m) => m.is_default_org) ?? memberships[0] ?? null;
    }, [memberships, activeOrgId]);

    const switchOrg = useCallback((orgId: string) => {
        setActiveOrgId(orgId);
        if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_ACTIVE_ORG_KEY, orgId);
        }
    }, []);

    const fetchMemberships = useCallback(
        async (userId: string) => {
            if (!supabase) return;
            const { data } = await supabase
                .from("org_memberships")
                .select(
                    "id, user_id, organization_id, role, status, is_default_org, organizations(id, name, slug)"
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
                        },
                        { onConflict: "user_id,organization_id" }
                    )
                    .select(
                        "id, user_id, organization_id, role, status, is_default_org, organizations(id, name, slug)"
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
            const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();

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
                .from("profiles")
                .upsert(
                    {
                        id: userId,
                        email: authUser.email ?? "",
                        name: displayName,
                    },
                    { onConflict: "id" }
                )
                .select("*")
                .single();

            setProfile((created as Profile | null) ?? null);
        },
        [supabase]
    );

    const fetchUsername = useCallback(
        async (userId: string) => {
            if (!supabase) return;
            const { data } = await supabase
                .from("user_profiles")
                .select("username")
                .eq("id", userId)
                .single();
            setUsername(data?.username ?? null);
        },
        [supabase]
    );

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id);
            await fetchMemberships(user.id);
            await fetchUsername(user.id);
        }
    }, [user, fetchProfile, fetchMemberships, fetchUsername]);

    const signOut = useCallback(async () => {
        // Clear client state immediately
        setUser(null);
        setProfile(null);
        setUsername(null);
        setSession(null);
        setMemberships([]);
        setActiveOrgId(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem(AUTH_ACTIVE_ORG_KEY);
        }

        // Clear server-side session cookies via API route, then client-side signOut
        try {
            await fetch("/api/auth/signout", { method: "POST" });
        } catch {
            // Best-effort — continue with client-side signOut
        }

        if (supabase) {
            await supabase.auth.signOut();
        }

        // Hard navigation to /login ensures middleware sees cleared cookies.
        // router.push would serve a cached RSC payload and race with middleware.
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }, [supabase]);

    useEffect(() => {
        if (!supabase || !isSupabaseConfigured) {
            return;
        }

        const getSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id);
                await fetchMemberships(session.user.id);
                await fetchUsername(session.user.id);
            }

            setLoading(false);
        };

        getSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id);
                await fetchMemberships(session.user.id);
                await fetchUsername(session.user.id);
            } else {
                setProfile(null);
                setUsername(null);
                setMemberships([]);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, fetchProfile, fetchMemberships, fetchUsername]);

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
