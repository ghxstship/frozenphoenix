import { describe, expect, it } from "vitest";
import {
    cn,
    formatCompactCurrency,
    formatCurrency,
    getInitials,
    percentChange,
    slugify,
    truncate,
} from "@/lib/utils";

describe("cn (class name merger)", () => {
    it("merges class names", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
        expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("deduplicates Tailwind conflicts", () => {
        const result = cn("p-4", "p-2");
        expect(result).toBe("p-2");
    });
});

describe("formatCurrency", () => {
    it("formats positive amounts", () => {
        const result = formatCurrency(1234.56);
        // Rounds to 0 decimal places: 1234.56 → $1,235
        expect(result).toBe("$1,235");
    });

    it("formats zero", () => {
        const result = formatCurrency(0);
        expect(result).toContain("0");
    });
});

describe("formatCompactCurrency", () => {
    it("formats thousands as K", () => {
        // .toFixed(0) rounds: 1500/1000 = 1.5 → "2K"
        expect(formatCompactCurrency(1500)).toBe("$2K");
    });

    it("formats millions as M", () => {
        expect(formatCompactCurrency(2500000)).toBe("$2.5M");
    });

    it("formats small amounts directly", () => {
        expect(formatCompactCurrency(500)).toBe("$500");
    });
});

describe("getInitials", () => {
    it("extracts initials from full name", () => {
        expect(getInitials("John Doe")).toBe("JD");
    });

    it("handles single name", () => {
        expect(getInitials("Alice")).toBe("A");
    });

    it("handles empty string", () => {
        expect(getInitials("")).toBe("");
    });
});

describe("slugify", () => {
    it("converts to lowercase slug", () => {
        expect(slugify("Hello World")).toBe("hello-world");
    });

    it("removes special characters", () => {
        expect(slugify("Hello, World!")).toBe("hello-world");
    });

    it("handles multiple spaces", () => {
        expect(slugify("hello   world")).toBe("hello-world");
    });
});

describe("truncate", () => {
    it("truncates long strings", () => {
        expect(truncate("Hello World", 5)).toBe("Hello…");
    });

    it("does not truncate short strings", () => {
        expect(truncate("Hi", 5)).toBe("Hi");
    });
});

describe("percentChange", () => {
    it("calculates positive change", () => {
        // percentChange(current, previous) = (current - previous) / previous * 100
        expect(percentChange(150, 100)).toBe(50);
    });

    it("calculates negative change", () => {
        expect(percentChange(50, 100)).toBe(-50);
    });

    it("handles zero previous value", () => {
        expect(percentChange(100, 0)).toBe(0);
    });
});
