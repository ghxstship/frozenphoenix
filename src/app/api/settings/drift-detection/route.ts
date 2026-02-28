import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface DriftItem {
    setting_key: string;
    category: string;
    drift_type: "missing" | "type_mismatch" | "out_of_range" | "deprecated" | "orphaned";
    severity: "critical" | "warning" | "info";
    message: string;
    expected?: unknown;
    actual?: unknown;
}

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = request.nextUrl.searchParams.get("organization_id");
    if (!orgId) {
        return NextResponse.json({ error: "organization_id is required" }, { status: 400 });
    }

    // Verify exec access
    const { data: membership } = await supabase.from("org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .single();

    if (!membership || !["exec", "pm"].includes(membership.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const driftItems: DriftItem[] = [];

    // Fetch setting definitions
    const { data: definitions } = await supabase.from("setting_definitions")
        .select("*")
        .eq("is_active", true);

    // Fetch current settings for this org
    const { data: settings } = await supabase.from("settings")
        .select("*")
        .eq("organization_id", orgId);

    const definitionMap = new Map(
        (definitions || []).map((d: Record<string, unknown>) => [d.key, d])
    );
    const settingMap = new Map(
        (settings || []).map((s: Record<string, unknown>) => [s.key, s])
    );

    // 1. Check for missing required settings (defined but no value set)
    for (const [key, def] of definitionMap) {
        const d = def as Record<string, unknown>;
        if (!settingMap.has(key as string)) {
            const isSecuritySetting = (d.category as string) === "security";
            driftItems.push({
                setting_key: key as string,
                category: (d.category as string) || "unknown",
                drift_type: "missing",
                severity: isSecuritySetting ? "critical" : "warning",
                message: `Setting "${d.label || key}" has no value — using default: ${JSON.stringify(d.default_value)}`,
                expected: d.default_value,
                actual: undefined,
            });
        }
    }

    // 2. Check for orphaned settings (value exists but no definition)
    for (const [key] of settingMap) {
        if (!definitionMap.has(key as string)) {
            driftItems.push({
                setting_key: key as string,
                category: "unknown",
                drift_type: "orphaned",
                severity: "info",
                message: `Setting "${key}" has a value but no matching definition — may be deprecated or misconfigured.`,
            });
        }
    }

    // 3. Check for type mismatches
    for (const [key, def] of definitionMap) {
        const d = def as Record<string, unknown>;
        const s = settingMap.get(key as string) as Record<string, unknown> | undefined;
        if (!s) continue;

        const expectedType = d.value_type as string;
        const actualValue = s.value;

        if (expectedType === "boolean" && typeof actualValue !== "boolean") {
            driftItems.push({
                setting_key: key as string,
                category: (d.category as string) || "unknown",
                drift_type: "type_mismatch",
                severity: "warning",
                message: `Setting "${d.label || key}" expected boolean, got ${typeof actualValue}.`,
                expected: "boolean",
                actual: typeof actualValue,
            });
        } else if (expectedType === "number" && typeof actualValue !== "number") {
            driftItems.push({
                setting_key: key as string,
                category: (d.category as string) || "unknown",
                drift_type: "type_mismatch",
                severity: "warning",
                message: `Setting "${d.label || key}" expected number, got ${typeof actualValue}.`,
                expected: "number",
                actual: typeof actualValue,
            });
        }

        // 4. Check range constraints
        if (expectedType === "number" && typeof actualValue === "number" && d.validation_rules) {
            const rules = d.validation_rules as Record<string, unknown>;
            if (typeof rules.min === "number" && actualValue < rules.min) {
                driftItems.push({
                    setting_key: key as string,
                    category: (d.category as string) || "unknown",
                    drift_type: "out_of_range",
                    severity: "warning",
                    message: `Setting "${d.label || key}" value ${actualValue} is below minimum ${rules.min}.`,
                    expected: `>= ${rules.min}`,
                    actual: actualValue,
                });
            }
            if (typeof rules.max === "number" && actualValue > rules.max) {
                driftItems.push({
                    setting_key: key as string,
                    category: (d.category as string) || "unknown",
                    drift_type: "out_of_range",
                    severity: "warning",
                    message: `Setting "${d.label || key}" value ${actualValue} exceeds maximum ${rules.max}.`,
                    expected: `<= ${rules.max}`,
                    actual: actualValue,
                });
            }
        }
    }

    // Sort by severity: critical first, then warning, then info
    const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
    driftItems.sort((a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99));

    return NextResponse.json({
        organization_id: orgId,
        scanned_at: new Date().toISOString(),
        total_definitions: definitions?.length || 0,
        total_settings: settings?.length || 0,
        drift_count: driftItems.length,
        critical_count: driftItems.filter((d) => d.severity === "critical").length,
        warning_count: driftItems.filter((d) => d.severity === "warning").length,
        info_count: driftItems.filter((d) => d.severity === "info").length,
        items: driftItems,
    });
}
