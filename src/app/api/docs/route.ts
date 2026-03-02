import { NextResponse } from "next/server";
import { buildOpenApiSpec } from "@/lib/api-docs";

/**
 * M-009: OpenAPI specification endpoint.
 * GET /api/docs → returns the OpenAPI 3.1 JSON spec.
 */
export async function GET() {
    return NextResponse.json(buildOpenApiSpec());
}
