"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";

// ─── Password Strength Calculation ─────────────────────────────
export interface PasswordStrength {
    score: 0 | 1 | 2 | 3 | 4;
    label: string;
    requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
    key: string;
    label: string;
    met: boolean;
}

const PASSWORD_REQUIREMENTS: { key: string; label: string; test: (p: string) => boolean }[] = [
    { key: "length", label: "At least 10 characters", test: (p) => p.length >= 10 },
    { key: "uppercase", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { key: "lowercase", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
    { key: "digit", label: "One number", test: (p) => /\d/.test(p) },
    { key: "special", label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function calculatePasswordStrength(password: string): PasswordStrength {
    const requirements = PASSWORD_REQUIREMENTS.map((r) => ({
        key: r.key,
        label: r.label,
        met: r.test(password),
    }));

    const metCount = requirements.filter((r) => r.met).length;

    let score: 0 | 1 | 2 | 3 | 4 = 0;
    if (metCount >= 5) score = 4;
    else if (metCount >= 4) score = 3;
    else if (metCount >= 3) score = 2;
    else if (metCount >= 1) score = 1;

    const labels: Record<number, string> = {
        0: "Too weak",
        1: "Weak",
        2: "Fair",
        3: "Strong",
        4: "Very strong",
    };

    return { score, label: labels[score] ?? "Too weak", requirements };
}

const STRENGTH_COLORS: Record<number, string> = {
    0: "bg-muted",
    1: "bg-destructive",
    2: "bg-warning",
    3: "bg-success",
    4: "bg-success",
};

const STRENGTH_TEXT_COLORS: Record<number, string> = {
    0: "text-muted-foreground",
    1: "text-destructive",
    2: "text-warning",
    3: "text-success",
    4: "text-success",
};

// ─── Strength Meter ────────────────────────────────────────────
export function StrengthMeter({ password }: { password: string }) {
    const strength = calculatePasswordStrength(password);
    if (!password) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 flex-1 rounded-full transition-colors duration-200",
                                i < strength.score ? STRENGTH_COLORS[strength.score] : "bg-muted"
                            )}
                        />
                    ))}
                </div>
                <span
                    className={cn(
                        "density-caption font-medium",
                        STRENGTH_TEXT_COLORS[strength.score]
                    )}
                >
                    {strength.label}
                </span>
            </div>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {strength.requirements.map((r) => (
                    <li
                        key={r.key}
                        className={cn(
                            "density-caption flex items-center gap-1 transition-colors",
                            r.met ? "text-success" : "text-muted-foreground"
                        )}
                    >
                        <span className="shrink-0">{r.met ? "✓" : "○"}</span>
                        {r.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ─── Password Input ────────────────────────────────────────────
export interface PasswordInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
> {
    showStrengthMeter?: boolean | undefined;
    showIcon?: boolean | undefined;
    error?: string | undefined;
}

function generateDescribedBy(
    id: string | undefined,
    error: string | undefined,
    showStrength: boolean,
    password: string
): string | undefined {
    const ids: string[] = [];
    if (error && id) ids.push(`${id}-error`);
    if (showStrength && password && id) ids.push(`${id}-strength`);
    return ids.length > 0 ? ids.join(" ") : undefined;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    (
        {
            className,
            showStrengthMeter = false,
            showIcon = true,
            error,
            value,
            id,
            "aria-required": ariaRequired,
            required,
            ...props
        },
        ref
    ) => {
        const [visible, setVisible] = React.useState(false);
        const passwordValue = typeof value === "string" ? value : "";
        const describedBy = generateDescribedBy(id, error, showStrengthMeter, passwordValue);

        return (
            <div className="space-y-2">
                <div className="relative">
                    {showIcon && (
                        <Lock
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                            aria-hidden="true"
                        />
                    )}
                    <Input
                        ref={ref}
                        type={visible ? "text" : "password"}
                        id={id}
                        className={cn(showIcon && "pl-10", "pr-10", className)}
                        value={value}
                        error={!!error}
                        aria-invalid={!!error}
                        aria-describedby={describedBy}
                        aria-required={ariaRequired ?? required}
                        required={required}
                        {...props}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setVisible((v) => !v)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        aria-label={visible ? "Hide password" : "Show password"}
                        tabIndex={-1}
                    >
                        {visible ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                    </Button>
                </div>
                {error && id && (
                    <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
                        {error}
                    </p>
                )}
                {showStrengthMeter && (
                    <div id={id ? `${id}-strength` : undefined}>
                        <StrengthMeter password={passwordValue} />
                    </div>
                )}
            </div>
        );
    }
);
PasswordInput.displayName = "PasswordInput";
