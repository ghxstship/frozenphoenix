function decodeBase64Url(input: string): string | null {
    try {
        const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

        if (typeof atob === "function") {
            return atob(padded);
        }

        if (typeof Buffer !== "undefined") {
            return Buffer.from(padded, "base64").toString("utf8");
        }

        return null;
    } catch {
        return null;
    }
}

function extractProjectRefFromAnonKey(anonKey: string | null): string | null {
    if (!anonKey) {
        return null;
    }

    const parts = anonKey.split(".");
    if (parts.length < 2) {
        return null;
    }

    const payloadPart = parts[1];
    if (!payloadPart) return null;
    const payload = decodeBase64Url(payloadPart);
    if (!payload) {
        return null;
    }

    try {
        const parsed = JSON.parse(payload) as { ref?: string };
        return typeof parsed.ref === "string" ? parsed.ref : null;
    } catch {
        return null;
    }
}

function normalizeSupabaseUrl(url: string | null): string | null {
    if (!url) {
        return null;
    }

    const candidate = url.startsWith("http") ? url : `https://${url}`;

    try {
        return new URL(candidate).origin;
    } catch {
        return null;
    }
}

function extractProjectRefFromUrl(url: string | null): string | null {
    if (!url) {
        return null;
    }

    try {
        const hostname = new URL(url).hostname;
        const [projectRef] = hostname.split(".");
        return projectRef || null;
    } catch {
        return null;
    }
}

const envSupabaseUrl = normalizeSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? null
);

export const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? null;

const keyProjectRef = extractProjectRefFromAnonKey(supabaseAnonKey);
const urlProjectRef = extractProjectRefFromUrl(envSupabaseUrl);

const shouldPreferKeyProjectUrl =
    !!keyProjectRef && (!envSupabaseUrl || (urlProjectRef !== null && urlProjectRef !== keyProjectRef));

export const supabaseUrl = shouldPreferKeyProjectUrl
    ? `https://${keyProjectRef}.supabase.co`
    : envSupabaseUrl;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
