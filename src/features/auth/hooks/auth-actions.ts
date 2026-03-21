"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import type { AuthError, AuthResponse, Provider, UserResponse } from "@supabase/supabase-js";

// ─── Helpers ───

function getRedirectUrl(path: string): string {
    if (typeof window !== "undefined") {
        return `${window.location.origin}${path}`;
    }
    return path;
}

// ─── Types ───

export interface OAuthSignInOptions {
    provider: Provider;
    redirectTo?: string;
    scopes?: string;
    queryParams?: Record<string, string>;
}

export interface PasswordResetRequest {
    email: string;
    redirectTo?: string;
}

export interface PasswordUpdateRequest {
    password: string;
}

export interface EmailUpdateRequest {
    email: string;
}

export interface ProfileUpdateRequest {
    name?: string;
    avatar_url?: string;
    [key: string]: unknown;
}

export interface MFAEnrollResponse {
    id: string;
    type: "totp";
    totp: {
        qr_code: string;
        secret: string;
        uri: string;
    };
}

export interface MFAVerifyRequest {
    factorId: string;
    code: string;
}

export interface MFAChallengeResponse {
    id: string;
}

// ═══════════════════════════════════════════════════════════════
// CORE AUTH FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// ─── Email/Password Sign In ───
export async function signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    const supabase = getSupabase();
    return supabase.auth.signInWithPassword({ email, password });
}

// ─── Email/Password Sign Up ───
export async function signUp(
    email: string,
    password: string,
    metadata?: Record<string, unknown>
): Promise<AuthResponse> {
    const supabase = getSupabase();
    return supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
            emailRedirectTo: getRedirectUrl("/auth/callback"),
        },
    });
}

// ─── OAuth Sign In ───
export async function signInWithOAuth(
    options: OAuthSignInOptions
): Promise<{ url: string | null; error: AuthError | null }> {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: options.provider,
        options: {
            redirectTo: options.redirectTo ?? getRedirectUrl("/auth/callback"),
            scopes: options.scopes,
            queryParams: options.queryParams,
        },
    });
    return { url: data?.url ?? null, error };
}

// ─── Magic Link ───
export async function signInWithMagicLink(
    email: string,
    redirectTo?: string
): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: redirectTo ?? getRedirectUrl("/auth/callback"),
        },
    });
    return { error };
}

// ─── Sign Out ───
export async function signOut(): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    return supabase.auth.signOut();
}

// ═══════════════════════════════════════════════════════════════
// PASSWORD MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// ─── Request Password Reset ───
export async function resetPassword(
    options: PasswordResetRequest
): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(options.email, {
        redirectTo: options.redirectTo ?? getRedirectUrl("/auth/reset-password"),
    });
    return { error };
}

// ─── Update Password (authenticated user) ───
export async function updatePassword(password: string): Promise<UserResponse> {
    const supabase = getSupabase();
    return supabase.auth.updateUser({ password });
}

// ═══════════════════════════════════════════════════════════════
// USER PROFILE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// ─── Update Email ───
export async function updateEmail(email: string): Promise<UserResponse> {
    const supabase = getSupabase();
    return supabase.auth.updateUser({ email });
}

// ─── Update User Metadata (name, avatar, etc.) ───
export async function updateUserMetadata(metadata: ProfileUpdateRequest): Promise<UserResponse> {
    const supabase = getSupabase();
    return supabase.auth.updateUser({ data: metadata });
}

// ─── Update Profile Row (user_profiles table) ───
export async function updateProfile(
    userId: string,
    updates: Record<string, unknown>
): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from("user_profiles").update(updates).eq("id", userId);
    if (error) throw error;
}

// ─── Get Current User ───
export async function getCurrentUser() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
}

// ─── Get Current Session ───
export async function getCurrentSession() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

// ─── Refresh Session ───
export async function refreshSession() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
}

// ═══════════════════════════════════════════════════════════════
// MFA / TOTP
// ═══════════════════════════════════════════════════════════════

// ─── Enroll TOTP Factor ───
export async function enrollMFA(): Promise<MFAEnrollResponse> {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
    });
    if (error) throw error;
    return data as MFAEnrollResponse;
}

// ─── Create MFA Challenge ───
export async function challengeMFA(factorId: string): Promise<MFAChallengeResponse> {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.mfa.challenge({
        factorId,
    });
    if (error) throw error;
    return data;
}

// ─── Verify MFA Challenge ───
export async function verifyMFA(options: MFAVerifyRequest): Promise<void> {
    const supabase = getSupabase();

    // Create a challenge first
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: options.factorId,
    });
    if (challengeError) throw challengeError;

    // Verify the challenge with the TOTP code
    const { error } = await supabase.auth.mfa.verify({
        factorId: options.factorId,
        challengeId: challenge.id,
        code: options.code,
    });
    if (error) throw error;
}

// ─── Unenroll MFA Factor ───
export async function unenrollMFA(factorId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
}

// ─── List Enrolled MFA Factors ───
export async function listMFAFactors() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    return data;
}

// ─── Get MFA Authenticator Assurance Level ───
export async function getMFAAssuranceLevel() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw error;
    return data;
}

// ═══════════════════════════════════════════════════════════════
// REACT QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

export function useSignInWithPassword() {
    return useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            const result = await signInWithPassword(email, password);
            if (result.error) throw result.error;
            return result.data;
        },
    });
}

export function useSignUp() {
    return useMutation({
        mutationFn: async ({
            email,
            password,
            metadata,
        }: {
            email: string;
            password: string;
            metadata?: Record<string, unknown>;
        }) => {
            const result = await signUp(email, password, metadata);
            if (result.error) throw result.error;
            return result.data;
        },
    });
}

export function useSignInWithOAuth() {
    return useMutation({
        mutationFn: async (options: OAuthSignInOptions) => {
            const { url, error } = await signInWithOAuth(options);
            if (error) throw error;
            // OAuth redirects the browser; url is where to redirect
            if (url && typeof window !== "undefined") {
                window.location.href = url;
            }
            return { url };
        },
    });
}

export function useSignInWithMagicLink() {
    return useMutation({
        mutationFn: async ({ email, redirectTo }: { email: string; redirectTo?: string }) => {
            const { error } = await signInWithMagicLink(email, redirectTo);
            if (error) throw error;
        },
    });
}

export function useSignOut() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { error } = await signOut();
            if (error) throw error;
        },
        onSuccess: () => {
            // Clear all cached data on sign out
            queryClient.clear();
        },
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: async (options: PasswordResetRequest) => {
            const { error } = await resetPassword(options);
            if (error) throw error;
        },
    });
}

export function useUpdatePassword() {
    return useMutation({
        mutationFn: async (password: string) => {
            const result = await updatePassword(password);
            if (result.error) throw result.error;
            return result.data;
        },
    });
}

export function useUpdateEmail() {
    return useMutation({
        mutationFn: async (email: string) => {
            const result = await updateEmail(email);
            if (result.error) throw result.error;
            return result.data;
        },
    });
}

export function useUpdateUserMetadata() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (metadata: ProfileUpdateRequest) => {
            const result = await updateUserMetadata(metadata);
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user_profiles"] });
        },
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            userId,
            updates,
        }: {
            userId: string;
            updates: Record<string, unknown>;
        }) => {
            await updateProfile(userId, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user_profiles"] });
        },
    });
}

export function useEnrollMFA() {
    return useMutation({
        mutationFn: async () => enrollMFA(),
    });
}

export function useVerifyMFA() {
    return useMutation({
        mutationFn: async (options: MFAVerifyRequest) => verifyMFA(options),
    });
}

export function useUnenrollMFA() {
    return useMutation({
        mutationFn: async (factorId: string) => unenrollMFA(factorId),
    });
}
