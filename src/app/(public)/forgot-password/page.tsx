"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brandConfig } from "@/config/brand";
import { Flame, Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const supabase = createClient();
            if (!supabase) {
                setError("Authentication service unavailable");
                return;
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) {
                setError(error.message);
                return;
            }

            setSuccess(true);
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md space-y-6 animate-fade-in">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10 mb-4">
                                <CheckCircle2 className="h-7 w-7 text-success" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Check your email</h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
                            </p>
                            <Link href="/login">
                                <Button variant="ghost">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Sign In
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6 animate-fade-in">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg mb-4">
                        <Flame className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {brandConfig.name}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Reset Password</CardTitle>
                        <p className="text-sm text-muted-foreground text-center">
                            Enter your email and we&apos;ll send you a reset link.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleReset} className="space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            <Link href="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                                <ArrowLeft className="h-3 w-3" />
                                Back to Sign In
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
