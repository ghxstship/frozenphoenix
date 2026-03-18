import { beforeEach, describe, expect, it, vi } from "vitest";

describe("env validation", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllEnvs();
    });

    it("provides default values when env vars are missing", async () => {
        vi.stubEnv("NODE_ENV", "test");
        const { env } = await import("@/lib/env");
        expect(env.NEXT_PUBLIC_BRAND_ID).toBe("atlvs");
        expect(env.NODE_ENV).toBe("test");
    });

    it("accepts valid NEXT_PUBLIC_SUPABASE_URL", async () => {
        vi.stubEnv("NODE_ENV", "test");
        vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
        const { env } = await import("@/lib/env");
        expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://abc.supabase.co");
    });

    it("rejects invalid NEXT_PUBLIC_SUPABASE_URL in production", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
        await expect(import("@/lib/env")).rejects.toThrow("Invalid environment variables");
    });
});
