import { NextRequest, NextResponse } from "next/server";
import { scrapeInstagramProfile } from "@/lib/instagram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body as { username?: string };

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "A valid username is required" },
        { status: 400 },
      );
    }

    const missingVars = [
      "BROWSERLESS_API_KEY",
      "AI_GATEWAY_API_KEY",
    ].filter((v) => !process.env[v]);

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required environment variables: ${missingVars.join(", ")}`,
        },
        { status: 500 },
      );
    }

    const profile = await scrapeInstagramProfile(username.trim());
    return NextResponse.json(profile);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    const isNotFound =
      message.toLowerCase().includes("not found") ||
      message.toLowerCase().includes("doesn't exist");

    return NextResponse.json(
      { error: message },
      { status: isNotFound ? 404 : 500 },
    );
  }
}
