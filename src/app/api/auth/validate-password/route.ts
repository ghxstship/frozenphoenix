import { NextRequest, NextResponse } from "next/server";
import { ApiErrors } from "@/lib/api-utils";

interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
    strength: number;
}

function validatePasswordServer(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (typeof password !== "string" || password.length === 0) {
        return { valid: false, errors: ["Password is required."], strength: 0 };
    }

    if (password.length < 10) errors.push("Password must be at least 10 characters.");
    if (password.length > 128) errors.push("Password must not exceed 128 characters.");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain an uppercase letter.");
    if (!/[a-z]/.test(password)) errors.push("Password must contain a lowercase letter.");
    if (!/\d/.test(password)) errors.push("Password must contain a number.");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("Password must contain a special character.");

    // Check for common patterns
    const commonPasswords = [
        "password123", "qwerty12345", "letmein1234", "admin12345",
        "welcome1234", "monkey12345", "dragon12345", "master12345",
    ];
    if (commonPasswords.some((cp) => password.toLowerCase().includes(cp))) {
        errors.push("Password is too common. Please choose a more unique password.");
    }

    // Check for repeated characters (e.g., "aaaaaa")
    if (/(.)\1{4,}/.test(password)) {
        errors.push("Password must not contain 5 or more repeated characters.");
    }

    // Check for sequential characters (e.g., "12345", "abcde")
    const sequential = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i <= password.length - 5; i++) {
        const slice = password.slice(i, i + 5).toLowerCase();
        if (sequential.includes(slice) || sequential.split("").reverse().join("").includes(slice)) {
            errors.push("Password must not contain 5 or more sequential characters.");
            break;
        }
    }

    // Calculate strength score (0-4)
    let strength = 0;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return {
        valid: errors.length === 0,
        errors,
        strength,
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        const result = validatePasswordServer(password);

        return NextResponse.json(result);
    } catch {
        return ApiErrors.badRequest("Invalid request");
    }
}
