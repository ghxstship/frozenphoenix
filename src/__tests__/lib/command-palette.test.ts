import { describe, expect, it } from "vitest";
import { PLATFORM_SHORTCUTS, SHORTCUT_ROUTES } from "@/hooks/use-keyboard-shortcuts";

// ─── Command Palette Foundation Tests ────────────────────────

describe("PLATFORM_SHORTCUTS", () => {
    it("includes ⌘K for command palette", () => {
        const cmdK = PLATFORM_SHORTCUTS.find((s) => s.key === "k" && s.meta);
        expect(cmdK).toBeDefined();
        expect(cmdK!.label).toBe("Open Command Palette");
    });

    it("includes ⌘/ for shortcuts help", () => {
        const help = PLATFORM_SHORTCUTS.find((s) => s.key === "/" && s.meta);
        expect(help).toBeDefined();
    });

    it("has G-sequence navigation shortcuts", () => {
        const gShortcuts = PLATFORM_SHORTCUTS.filter((s) => s.sequence === "g");
        expect(gShortcuts.length).toBeGreaterThanOrEqual(7);
    });

    it("each G-sequence shortcut has a matching route", () => {
        const gShortcuts = PLATFORM_SHORTCUTS.filter((s) => s.sequence === "g");
        for (const s of gShortcuts) {
            expect(SHORTCUT_ROUTES[s.key]).toBeDefined();
        }
    });

    it("includes global search shortcut", () => {
        const search = PLATFORM_SHORTCUTS.find((s) => s.key === "f" && s.meta && s.shift);
        expect(search).toBeDefined();
        expect(search!.label).toBe("Global Search");
    });
});

describe("SHORTCUT_ROUTES", () => {
    it("maps d to /dashboard", () => {
        expect(SHORTCUT_ROUTES.d).toBe("/dashboard");
    });

    it("maps p to /projects", () => {
        expect(SHORTCUT_ROUTES.p).toBe("/projects");
    });

    it("maps t to /tasks", () => {
        expect(SHORTCUT_ROUTES.t).toBe("/tasks");
    });

    it("maps all expected keys", () => {
        expect(Object.keys(SHORTCUT_ROUTES)).toEqual(
            expect.arrayContaining(["d", "p", "t", "c", "m", "s", "n"])
        );
    });
});
