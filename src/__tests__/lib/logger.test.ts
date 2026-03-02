import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("logs info messages", () => {
        logger.info("test message");
        expect(consoleSpy).toHaveBeenCalled();
    });

    it("logs error messages via console.error", () => {
        const errorSpy = vi.spyOn(console, "error");
        logger.error("error message");
        expect(errorSpy).toHaveBeenCalled();
    });

    it("logs warn messages via console.warn", () => {
        const warnSpy = vi.spyOn(console, "warn");
        logger.warn("warning message");
        expect(warnSpy).toHaveBeenCalled();
    });

    it("includes context in log output", () => {
        logger.info("user created", { userId: "abc" });
        const output = consoleSpy.mock.calls[0]?.[0] as string;
        expect(output).toContain("user created");
        expect(output).toContain("abc");
    });

    it("creates child loggers with inherited context", () => {
        const child = logger.child({ requestId: "req_123" });
        child.info("processing");
        const output = consoleSpy.mock.calls[0]?.[0] as string;
        expect(output).toContain("processing");
        expect(output).toContain("req_123");
    });
});
