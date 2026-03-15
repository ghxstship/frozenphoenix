import { NextResponse } from "next/server";
import { getBlueskyOAuthClient } from "@/lib/auth/bluesky-client";

// AT Protocol OAuth requires client metadata to be served at the client_id URL.
// Authorization servers fetch this endpoint to discover our app's configuration.
export async function GET() {
    try {
        const client = await getBlueskyOAuthClient();
        return NextResponse.json(client.clientMetadata, {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        void error;
        return NextResponse.json({ error: "Client metadata unavailable" }, { status: 500 });
    }
}
