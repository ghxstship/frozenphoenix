import { describe, expect, it } from "vitest";
import { apiError, ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";

describe("apiError", () => {
    it("returns structured error envelope", async () => {
        const response = apiError("TEST_ERROR", "Something went wrong", 400);
        expect(response.status).toBe(400);

        const body = await response.json();
        expect(body.error.code).toBe("TEST_ERROR");
        expect(body.error.message).toBe("Something went wrong");
        expect(body.error.requestId).toBeDefined();
        expect(body.error.requestId).toMatch(/^req_/);
    });

    it("includes details when provided", async () => {
        const response = apiError("VALIDATION_ERROR", "Invalid", 422, {
            name: ["Required"],
        });
        const body = await response.json();
        expect(body.error.details).toEqual({ name: ["Required"] });
    });
});

describe("ApiErrors", () => {
    it("unauthorized returns 401", () => {
        expect(ApiErrors.unauthorized().status).toBe(401);
    });

    it("forbidden returns 403", () => {
        expect(ApiErrors.forbidden().status).toBe(403);
    });

    it("notFound returns 404", async () => {
        const response = ApiErrors.notFound("User");
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error.message).toBe("User not found");
    });

    it("conflict returns 409", () => {
        expect(ApiErrors.conflict("Already exists").status).toBe(409);
    });

    it("gone returns 410", () => {
        expect(ApiErrors.gone("Expired").status).toBe(410);
    });

    it("validationError returns 422", async () => {
        const response = ApiErrors.validationError({ email: ["Invalid email"] });
        expect(response.status).toBe(422);
        const body = await response.json();
        expect(body.error.code).toBe("VALIDATION_ERROR");
        expect(body.error.details).toEqual({ email: ["Invalid email"] });
    });

    it("serviceUnavailable returns 503", () => {
        expect(ApiErrors.serviceUnavailable().status).toBe(503);
    });

    it("internalError returns 500", () => {
        expect(ApiErrors.internalError().status).toBe(500);
    });
});

describe("parseAndValidate", () => {
    const testSchema = z.object({
        name: z.string().min(1),
        age: z.number().positive(),
    });

    it("parses valid JSON body", async () => {
        const request = new Request("http://localhost/api/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Alice", age: 30 }),
        });

        const result = await parseAndValidate(request, testSchema);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.name).toBe("Alice");
            expect(result.data.age).toBe(30);
        }
    });

    it("rejects invalid JSON", async () => {
        const request = new Request("http://localhost/api/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "not json",
        });

        const result = await parseAndValidate(request, testSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.response.status).toBe(400);
        }
    });

    it("rejects invalid data shape", async () => {
        const request = new Request("http://localhost/api/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "", age: -1 }),
        });

        const result = await parseAndValidate(request, testSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.response.status).toBe(422);
            const body = await result.response.json();
            expect(body.error.code).toBe("VALIDATION_ERROR");
            expect(body.error.details).toBeDefined();
        }
    });
});
