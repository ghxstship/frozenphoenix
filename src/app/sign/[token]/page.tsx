"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileSignature, Loader2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type SignatureData = {
    contract: Record<string, unknown> | null;
    e_signature: Record<string, unknown> | null;
    project_name: string;
    counterparty_name: string;
};

export default function ESignaturePage() {
    const params = useParams();
    const token = params.token as string;

    const [data, setData] = React.useState<SignatureData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [signedName, setSignedName] = React.useState("");
    const [consent, setConsent] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [signed, setSigned] = React.useState(false);

    React.useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/sign/${token}`);
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    setError(
                        (err as Record<string, Record<string, string>>)?.error?.message ??
                            "Unable to load document"
                    );
                    return;
                }
                const json = await res.json();
                const d = json.data as SignatureData;
                setData(d);

                if ((d.e_signature as Record<string, unknown>)?.signed_at) {
                    setSigned(true);
                }
            } catch {
                setError("Network error — please try again");
            } finally {
                setLoading(false);
            }
        }
        if (token) load();
    }, [token]);

    const handleSign = async () => {
        if (!signedName.trim() || !consent) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/sign/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    typed_name: signedName.trim(),
                    consent_given: true,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setError(
                    (err as Record<string, Record<string, string>>)?.error?.message ??
                        "Failed to sign"
                );
                return;
            }
            setSigned(true);
        } catch {
            setError("Network error — please try again");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 motion-safe:animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                        <h2 className="text-lg font-semibold">Document Unavailable</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data) return null;

    const contract = data.contract as Record<string, unknown> | null;
    const esig = data.e_signature as Record<string, unknown> | null;

    if (signed) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" />
                        <h2 className="text-lg font-semibold">Document Signed</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Thank you. Your signature has been recorded.
                        </p>
                        {Boolean(esig?.signed_at) && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Signed on {formatDate(String(esig!.signed_at))}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card px-4 py-6 sm:px-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center gap-3">
                        <FileSignature className="h-6 w-6 text-primary" />
                        <div>
                            <h1 className="text-xl font-bold">
                                {String(contract?.title ?? "Contract")}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {data.project_name} — {data.counterparty_name}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8 density-gap-page">
                {/* Contract Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Contract Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <Badge variant="ghost">{String(contract?.contract_type ?? "—")}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Number</span>
                            <span>{String(contract?.number ?? "—")}</span>
                        </div>
                        {Boolean(contract?.effective_date) && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Effective Date</span>
                                <span>{formatDate(String(contract!.effective_date))}</span>
                            </div>
                        )}
                        {Boolean(contract?.expiration_date) && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Expiration Date</span>
                                <span>{formatDate(String(contract!.expiration_date))}</span>
                            </div>
                        )}
                        {Boolean(contract?.value) && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Value</span>
                                <span className="font-medium">
                                    ${Number(contract!.value).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contract Body / Terms */}
                {Boolean(contract?.description) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Terms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                {String(contract!.description)}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Signature Capture */}
                <Card className="border-primary/30">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileSignature className="h-4 w-4" />
                            Sign Document
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="density-gap-section">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="typed-name" className="text-sm font-medium">
                                Type your full legal name
                            </label>
                            <Input
                                id="typed-name"
                                value={signedName}
                                onChange={(e) => setSignedName(e.target.value)}
                                placeholder="e.g. John A. Smith"
                                className="text-lg"
                            />
                            {signedName && (
                                <div className="mt-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center">
                                    <p className="text-2xl italic font-serif text-primary">
                                        {signedName}
                                    </p>
                                    <p className="density-caption text-muted-foreground mt-1">
                                        Signature preview
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="consent"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="mt-1 rounded border-input"
                            />
                            <label htmlFor="consent" className="text-xs text-muted-foreground">
                                I agree that my typed name above constitutes my electronic
                                signature, and that this signature has the same legal force as a
                                handwritten signature. I have read and agree to the terms of this
                                document.
                            </label>
                        </div>

                        <Button
                            onClick={handleSign}
                            disabled={!signedName.trim() || !consent || submitting}
                            className="w-full"
                            size="lg"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                                    Signing...
                                </>
                            ) : (
                                <>
                                    <FileSignature className="h-4 w-4" />
                                    Sign Document
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
