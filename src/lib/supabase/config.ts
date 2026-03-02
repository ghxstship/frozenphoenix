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

const envSupabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? null);

export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? null;

const keyProjectRef = extractProjectRefFromAnonKey(supabaseAnonKey);
const urlProjectRef = extractProjectRefFromUrl(envSupabaseUrl);

// Only use the key-derived URL as a fallback when no explicit URL is configured.
// Never silently override an explicit env var — that causes hard-to-debug mismatches.
const shouldFallbackToKeyUrl = !!keyProjectRef && !envSupabaseUrl;

if (keyProjectRef && envSupabaseUrl && urlProjectRef && urlProjectRef !== keyProjectRef) {
    console.warn(
        `[Supabase Config] Project ref mismatch: URL implies "${urlProjectRef}" but anon key implies "${keyProjectRef}". ` +
            `Using the explicit NEXT_PUBLIC_SUPABASE_URL. Verify your env vars are for the same project.`
    );
}

export const supabaseUrl = shouldFallbackToKeyUrl
    ? `https://${keyProjectRef}.supabase.co`
    : envSupabaseUrl;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
