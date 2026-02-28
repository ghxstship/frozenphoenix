"use client";

import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    level?: "app" | "page" | "section";
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`[ErrorBoundary:${this.props.level ?? "section"}]`, error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const level = this.props.level ?? "section";

            if (level === "section") {
                return (
                    <Card className="border-destructive/30 bg-destructive/5">
                        <CardContent className="py-6">
                            <div className="flex flex-col items-center justify-center text-center gap-3">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                                <div>
                                    <p className="text-sm font-semibold text-destructive">Something went wrong</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {this.state.error?.message || "An unexpected error occurred"}
                                    </p>
                                </div>
                                <Button size="sm" variant="outline" onClick={this.handleReset}>
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Retry
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            }

            return (
                <div className="flex items-center justify-center min-h-[50vh] p-6">
                    <div className="flex flex-col items-center justify-center text-center gap-4 max-w-md">
                        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">
                                {level === "app" ? "Application Error" : "Page Error"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {this.state.error?.message || "An unexpected error occurred. Please try again."}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={this.handleReset}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Try Again
                            </Button>
                            {level === "page" && (
                                <Button variant="default" onClick={() => window.location.assign("/dashboard")}>
                                    <Home className="h-4 w-4 mr-1" />
                                    Go to Dashboard
                                </Button>
                            )}
                            {level === "app" && (
                                <Button variant="default" onClick={() => window.location.reload()}>
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Reload App
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
